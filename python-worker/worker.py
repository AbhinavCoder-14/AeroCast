import time
import requests
import pandas as pd
import json
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv  # ADD THIS

# Load environment variables from .env file
load_dotenv()  # ADD THIS

# Connection to Db - FIXED VERSION
engine = None
retry_count = 0
max_retries = 3

while engine is None and retry_count < max_retries:
    try:
        DATABASE_URL = os.environ.get("DATABASE_URL")
        
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is not set. Create a .env file in python-worker directory.")
        
        print(f"Connecting to database...")
        engine = create_engine(DATABASE_URL)
        
        # Test the connection
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        
        print("Successfully connected to the postgres database.")
        
    except ValueError as ve:
        print(f"Configuration Error: {ve}")
        print("\nCreate python-worker/.env with:")
        print("DATABASE_URL=postgresql://weather:weatherdb@localhost:5432/weatherdb")
        break
        
    except Exception as e:
        retry_count += 1
        print(f"Database connection failed (attempt {retry_count}/{max_retries}): {e}")
        
        if retry_count < max_retries:
            print("Retrying in 5 seconds...")
            time.sleep(5)
        else:
            print("\nConnection failed. Please check:")
            print("1. PostgreSQL is running: docker-compose up -d postgres")
            print("2. .env file exists in python-worker directory")
            print("3. DATABASE_URL is correct")
            exit(1)

if engine is None:
    print("Failed to establish database connection. Exiting...")
    exit(1)

def get_and_lock_pending_job(connection):
    """
    Finds one pending job and immediately updates its status to 'IN_PROGRESS'.
    """
    with connection.begin():
        find_query = text("""
            SELECT "jobId", city FROM "jobs"
            WHERE status = 'PENDING'
            ORDER BY "createdAt"
            LIMIT 1
            FOR UPDATE SKIP LOCKED;
        """)
        result = connection.execute(find_query).first()

        if result:
            job_id, city = result
            lock_query = text("""
                UPDATE "jobs" SET status = 'IN_PROGRESS' WHERE "jobId" = :job_id
            """)
            connection.execute(lock_query, {'job_id': job_id})
            print(f"\nLocked job {job_id} for city: {city}")
            return {'jobId': job_id, 'city': city}
    return None

def process_job(job):
    city = job['city']
    print(f"Processing job for {city}...")

    try:
        # Step 1: Get coordinates
        print(f"Getting coordinates for {city}...")
        geo_response = requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={city.split(',')[0]}&count=1&language=en&format=json", timeout=30)
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        if not geo_data.get('results'):
            raise Exception(f"Could not find coordinates for city: {city}")
            
        location = geo_data['results'][0]
        lat, lon = location['latitude'], location['longitude']
        print(f"Found coordinates: {lat}, {lon}")

        # Step 2: Get today's hourly forecast
        print("Fetching today's hourly forecast...")
        forecast_url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            "&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,wind_speed_10m"
            "&forecast_days=1"
            "&timezone=auto"
        )
        
        forecast_response = requests.get(forecast_url, timeout=30)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()
        print("Forecast data received successfully")

        # Step 3: Get historical data
        print("Fetching historical data...")
        today = datetime.now()
        end_date = today - timedelta(days=1)
        start_date = end_date.replace(year=end_date.year - 1) + timedelta(days=1)
        print(f"Fetching data from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")

        archive_url = (
            f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
            f"&start_date={start_date.strftime('%Y-%m-%d')}&end_date={end_date.strftime('%Y-%m-%d')}"
            f"&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max"
            f"&timezone=auto"
        )
        
        print(f"Archive URL: {archive_url}")
        
        try:
            archive_response = requests.get(archive_url, timeout=60)
            archive_response.raise_for_status()
            archive_data = archive_response.json()
            print(f"Historical data received: {len(archive_data.get('daily', {}).get('time', []))} days")
        except Exception as e:
            print(f"Historical data fetch failed (non-critical): {e}")
            archive_data = {'daily': {'time': [], 'temperature_2m_mean': [], 'temperature_2m_max': [], 'temperature_2m_min': [], 'precipitation_sum': [], 'wind_speed_10m_max': []}}

        # Step 4: Process hourly forecast data
        hourly_df = pd.DataFrame(forecast_data['hourly'])
        hourly_df['time'] = pd.to_datetime(hourly_df['time'])
        
        print(f"Processed {len(hourly_df)} hourly data points")
        
        # Step 5: Format hourly data for frontend
        hourly_records = []
        for _, row in hourly_df.iterrows():
            hourly_records.append({
                'time': row['time'].isoformat(),
                'temperature': float(row['temperature_2m']) if pd.notna(row['temperature_2m']) else 0.0,
                'apparent_temperature': float(row['apparent_temperature']) if pd.notna(row['apparent_temperature']) else 0.0,
                'humidity': float(row['relative_humidity_2m']) if pd.notna(row['relative_humidity_2m']) else 0.0,
                'pressure': float(row['precipitation_probability']) if pd.notna(row['precipitation_probability']) else 0.0,
                'windSpeed': float(row['wind_speed_10m']) if pd.notna(row['wind_speed_10m']) else 0.0
            })

        # Step 6: Process and aggregate historical data
        historical_avg_records = []
        historical_daily_records = []
        if archive_data.get('daily') and archive_data['daily'].get('time'):
            daily_df = pd.DataFrame(archive_data['daily'])
            daily_df['time'] = pd.to_datetime(daily_df['time'])
            
            daily_df['month'] = daily_df['time'].dt.to_period('M')
            
            monthly_agg = daily_df.groupby('month').agg({
                'temperature_2m_mean': 'mean',
                'temperature_2m_max': 'mean',
                'temperature_2m_min': 'mean',
                'precipitation_sum': 'sum',
                'wind_speed_10m_max': 'mean'
            }).reset_index()
            
            for _, row in monthly_agg.iterrows():
                historical_avg_records.append({
                    'month': str(row['month']),
                    'temp_mean': round(float(row['temperature_2m_mean']), 2) if pd.notna(row['temperature_2m_mean']) else 0.0,
                    'temp_max': round(float(row['temperature_2m_max']), 2) if pd.notna(row['temperature_2m_max']) else 0.0,
                    'temp_min': round(float(row['temperature_2m_min']), 2) if pd.notna(row['temperature_2m_min']) else 0.0,
                    'precipitation': round(float(row['precipitation_sum']), 2) if pd.notna(row['precipitation_sum']) else 0.0,
                    'wind_max': round(float(row['wind_speed_10m_max']), 2) if pd.notna(row['wind_speed_10m_max']) else 0.0
                })
                
            for _, row in daily_df.iterrows():
                historical_daily_records.append({
                    'date': row['time'].isoformat(),
                    'temp_mean': float(row['temperature_2m_mean']) if pd.notna(row['temperature_2m_mean']) else 0.0,
                    'temp_max': float(row['temperature_2m_max']) if pd.notna(row['temperature_2m_max']) else 0.0,
                    'temp_min': float(row['temperature_2m_min']) if pd.notna(row['temperature_2m_min']) else 0.0,
                    'precipitation': float(row['precipitation_sum']) if pd.notna(row['precipitation_sum']) else 0.0,
                    'wind_max': float(row['wind_speed_10m_max']) if pd.notna(row['wind_speed_10m_max']) else 0.0
                })
        
        final_result = {
            "chart_data": {
                'hourly_today': hourly_records,
                "historical_avg_records": historical_avg_records,
                "historical_daily_records": historical_daily_records
            }
        }
        
        print(f"Final result created with {len(hourly_records)} hourly records and {len(historical_avg_records)} historical records")
        return json.dumps(final_result, default=str)

    except Exception as e:
        print(f"Error in process_job: {e}")
        import traceback
        traceback.print_exc()
        raise

def update_job_in_db(connection, job_id, status, result_data=None):
    """
    Updates a job's status. If COMPLETED, it also saves the result data.
    """
    print(f"Updating job {job_id} to {status}...")
    
    if status == 'COMPLETED' and result_data:
        update_query = text("""
            UPDATE "jobs"
            SET status = :status, result_data = :result_data
            WHERE "jobId" = :job_id
        """)
        params = {
            'job_id': job_id, 
            'status': status, 
            'result_data': result_data
        }
    else:
        update_query = text("""
            UPDATE "jobs"
            SET status = :status
            WHERE "jobId" = :job_id
        """)
        params = {
            'job_id': job_id, 
            'status': status
        }

    with connection.begin():
        connection.execute(update_query, params)
    
    print(f"Successfully updated job {job_id} to {status}")

def main_loop():
    print("Python worker started. Waiting for Jobs...")
    while True:
        job = None
        try:
            with engine.connect() as connection:
                job = get_and_lock_pending_job(connection)
                if job:
                    print(f"Processing job: {job}")
                    result_json = process_job(job)
                    update_job_in_db(connection, job['jobId'], "COMPLETED", result_json)
                    print("Job completed successfully!")
                else:
                    print("No pending jobs found. Waiting...")
                    time.sleep(10)

        except Exception as e:
            print(f"An error occurred while processing job {job['jobId'] if job else 'N/A'}: {e}")
            import traceback
            traceback.print_exc()
            if job:
                try:
                    with engine.connect() as connection:
                        update_job_in_db(connection, job['jobId'], 'FAILED')
                except Exception as db_e:
                    print(f"CRITICAL: Could not update job {job['jobId']} to FAILED: {db_e}")
            time.sleep(15)

if __name__ == "__main__":
    main_loop()