import time
import requests
import pandas as pd
import json
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

# Connection to Db
engine = None
while engine is None:
    try:
        DATABASE_URL = "postgresql://weather:weatherdb@localhost:5432/weatherdb"
        engine = create_engine(DATABASE_URL)
        print("Successfully connected to the postgress database.")
    except Exception as e:
        print(f"database connection failed : {e}")
        print("Retrying in 5 seconds")
        time.sleep(5)

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
            # FIXED: Update status to 'IN_PROGRESS', not 'PENDING'
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
        geo_response = requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={city.split(',')[0]}&count=1&language=en&format=json")
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        if not geo_data.get('results'):
            raise Exception(f"Could not find coordinates for city: {city}")
            
        location = geo_data['results'][0]
        lat, lon = location['latitude'], location['longitude']
        print(f"Found coordinates: {lat}, {lon}")

        # Step 2: Get today's hourly forecast

        
        
        today = datetime.now()
        one_year_ago = today.replace(year=today.year - 1)
        # archive_url = (
        #     f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
        #     f"&start_date={one_year_ago.strftime('%Y-%m-%d')}&end_date={today.strftime('%Y-%m-%d')}"
        #     "&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean, apparent_temperature_max,precipitation_sum,wind_speed_10m_max&monthly=temperature_2m_mean,temperature_2m_max,temperature_2m_min"
        #     "&timezone=auto"
        # )
        
        # Get today's date
        today = datetime.now()
        end_date = today - timedelta(days=1)
        start_date = end_date.replace(year=end_date.year - 1) + timedelta(days=1)
        print(f"Fetching data from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")

        # Step 3: Call the correct historical archive API
        archive_url = (
            f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
            f"&start_date={start_date.strftime('%Y-%m-%d')}&end_date={end_date.strftime('%Y-%m-%d')}"
            f"&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min"
            f"&timezone=auto"
        )
            
            
        print(archive_url)
        
        archive_response = requests.get(archive_url)
        archive_response.raise_for_status()
        archive_data = archive_response.json()
        
        
        print(f"-----000000000000000000 {archive_data}")
        
        
        
        print("Fetching today's hourly forecast...")
        forecast_url = (
            f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
            "&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,wind_speed_10m"
            "&forecast_days=1"
            "&timezone=auto"
        )
        
        forecast_response = requests.get(forecast_url)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()
        # print("Forecast data received successfully")
        
        
        
        
        
        hourly_df = pd.DataFrame(forecast_data['hourly'])
        hourly_df['time'] = pd.to_datetime(hourly_df['time'])
        
        # print(f"Processed {len(hourly_df)} hourly data points")
        # print("Sample data:")
        print(hourly_df.head())

        # Step 4: Format data for frontend
        hourly_records = []
        for _, row in hourly_df.iterrows():
            hourly_records.append({
                'time': row['time'].isoformat(),
                'temperature': float(row['temperature_2m']) if pd.notna(row['temperature_2m']) else 0,
                'apparent_temperature': float(row['apparent_temperature']) if pd.notna(row['apparent_temperature']) else 0,
                'humidity': float(row['relative_humidity_2m']) if pd.notna(row['relative_humidity_2m']) else 0,
                'pressure': float(row['precipitation_probability']) if pd.notna(row['precipitation_probability']) else 0,
                'windSpeed': float(row['wind_speed_10m']) if pd.notna(row['wind_speed_10m']) else 0
            })

        # Step 5: Create final result
        final_result = {
            # 'insights': {
            #     'city': city,
            #     'data_points': len(hourly_records)
            # },
            'chart_data': {
                'hourly_today': hourly_records,
                'historical_records' : historical_records
            }
        }
        
        # print("Final result structure:")
        # print(f"- Insights: {final_result['insights']}")
        # print(final_result['chart_data'])
        
        return json.dumps(final_result, default=str)

    except Exception as e:
        print(f"Error in process_job: {e}")
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
            if job:
                try:
                    with engine.connect() as connection:
                        update_job_in_db(connection, job['jobId'], 'FAILED')
                except Exception as db_e:
                    print(f"CRITICAL: Could not update job {job['jobId']} to FAILED: {db_e}")
            time.sleep(15)

if __name__ == "__main__":
    main_loop()