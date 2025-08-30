# import os
import time
import requests
import pandas as pd
import json
from sqlalchemy import create_engine, text
from datetime import datetime




# DATABASE_URL = os.getenv("DATABASE_URL")

# if not DATABASE_URL:
#     raise Exception("database_url enviorment variable not set")

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
        # Using the correct table ("jobs") and column ("jobId") names from your schema
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
                UPDATE "jobs" SET status = 'PENDING' WHERE "jobId" = :job_id
            """)
            connection.execute(lock_query, {'job_id': job_id})
            print(f"\nLocked job {job_id} for city: {city}")
            # Return a dictionary with keys that match the schema
            print('all set --------------')
            return {'jobId': job_id, 'city': city}
    return None

    
    
    
def process_job(job):
    
    city = job['city']
    print(f"Processing job for {city}...")

    geo_response = requests.get(f"https://geocoding-api.open-meteo.com/v1/search?name={city.split(",")[0]}&count=1&language=en&format=json")
    geo_response.raise_for_status()
    geo_data = geo_response.json()
    if not geo_data.get('results'):
        raise Exception(f"Could not find coordinates for city: {city}")
        
    location = geo_data['results'][0]
    lat, lon = location['latitude'], location['longitude']

    # Step B: Get a full year of historical daily data
    today = datetime.now()
    one_year_ago = today.replace(year=today.year-1)
    archive_url = (
        f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
        f"&start_date={one_year_ago.strftime('%Y-%m-%d')}&end_date={today.strftime('%Y-%m-%d')}"
        "&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,precipitation_sum,wind_speed_10m_max"
        "&timezone=auto"
    )
    
    print(archive_url)
        
    weather_response = requests.get(archive_url)
    weather_response.raise_for_status()
    historical_data = weather_response.json()


    forecast_url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        "&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,wind_speed_10m"
        "&forecast_days=1"
        "&timezone=auto"
    )
    
    forecast_response = requests.get(forecast_url)
    forecast_response.raise_for_status()
    forecast_data = forecast_response.json()
    

    # Step C: Use pandas to create a DataFrame and perform analysis
    daily_df = pd.DataFrame(historical_data['daily'])
    daily_df['time'] = pd.to_datetime(daily_df['time'])
    
    # print(daily_df)
    

    hourly_df = pd.DataFrame(forecast_data['hourly'])
    hourly_df['time'] = pd.to_datetime(hourly_df['time'])
        
    print(hourly_df)

    # # --- PANDAS ANALYSIS ---
    # # 1. Find the hottest day in the last year
    # hottest_day_row = df.loc[df['temperature_2m_max'].idxmax()]
    # hottest_day_insight = {
    #     'date': hottest_day_row['time'].strftime('%B %d, %Y'),
    #     'temp': round(hottest_day_row['temperature_2m_max'])
    # }

    # # 2. Find the average temperature for the current month, last year
    # current_month_last_year_df = df[
    #     (df['time'].dt.year == one_year_ago.year) &
    #     (df['time'].dt.month == today.month)
    # ]
    # avg_temp_last_year = round(current_month_last_year_df['temperature_2m_max'].mean(), 1)

    # # 3. Count the number of rainy days in the last 90 days
    # last_90_days_df = df[df['time'] > (today - pd.Timedelta(days=90))]
    # rainy_days_count = int(last_90_days_df[last_90_days_df['precipitation_sum'] > 1.0].count(['time'])
    
    
    param_vs_hour_today = hourly_df[['time', 'temperature_2m','relative_humidity_2m','wind_speed_10m','precipitation_probability']].rename(columns={'temperature_2m': 'temperature','relative_humidity_2m':'humidity','wind_speed_10m':"windSpeed","precipitation_probability":"pressure"})
    
    # temp_vs_hour_today = hourly_df[['time', 'temperature_2m',]].rename(columns={'temperature_2m': 'temperature'})
    # temp_vs_hour_today = hourly_df[['time', 'temperature_2m',]].rename(columns={'temperature_2m': 'temperature'})
    
    print(param_vs_hour_today)

    # Step D: Combine all results into a single dictionary
    final_result = {
            'insights': {
                # 'hottest_day': hottest_day_insight,
                # 'avg_temp_last_year': avg_temp_last_year,
                # 'rainy_days_last_90': rainy_days_count,
            },
        # We can still include the chart data if we want
            'chart_data': {
                'hourly_today': param_vs_hour_today.to_dict(orient='records'),
                
                # 'daily_yearly': temp_vs_day_yearly.to_dict(orient='records')
            }
        }
    return json.dumps(final_result,default=str)

    # Convert the final dictionary to a JSON string to store in the database
    # return json.dumps(final_result, default=str)

            


def update_job_in_db(connection, job_id, status, result_data=None):
    """
    Updates a job's status. If COMPLETED, it also saves the result data.
    """
    print(f"Updating job {job_id} to {status}...")
    
    if status == 'COMPLETED' and result_data:
        # For completed jobs, we update BOTH status and result_data.
        # Note the correct column name: "result_data".
        update_query = text("""
            UPDATE "jobs"
            SET status = :status, result_data = :result_data
            WHERE "jobId" = :job_id
        """)
        # The dictionary keys match the :placeholders in the query.
        params = {
            'job_id': job_id, 
            'status': status, 
            'result_data': result_data
        }
    else:
        # For FAILED jobs, we ONLY update the status.
        update_query = text("""
            UPDATE "jobs"
            SET status = :status
            WHERE "jobId" = :job_id
        """)
        # This dictionary only needs the parameters for this simpler query.
        params = {
            'job_id': job_id, 
            'status': status
        }

    with connection.begin():
        connection.execute(update_query, params)
    
    print(f"Successfully updated job {job_id}.")
    
    
    
def main_loop():
    print("python worker started.Waiting for Jobs...")
    while True:
        job = None
        try:
            with engine.connect() as connection:
                job = get_and_lock_pending_job(connection)
                if job:
                    result_json = process_job(job)
                    update_job_in_db(connection,job['jobId'],"COMPLETED",result_json)
                        
                else:
                    time.sleep(10)
                        

        except Exception as e:
            print(f"An error occurred while processing job {job['jobId'] if job else 'N/A'}: {e}")
            if job:
                try:
                    with engine.connect() as connection:
                        update_job_in_db(connection, job['jobId'],'FAILED')
                        
                except Exception as db_e:
                        
                    print(f"CRITICAL: Could not update job {job['jobId']} to FAILED: {db_e}")
            time.sleep(15)
                
                
                
if __name__ == "__main__":
    main_loop()
    # job = {
    #     "city":"delhi"
    # }
    # process_job(job)
    

