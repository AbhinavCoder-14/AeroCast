import os
import time
import requests
import pandas as pd
import json
from sqlalchemy import create_engine, text
from datetime import datetime


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception("database_url enviorment variable not set")

# Connection to Db

engine = None
while engine is None:
    try:
        engine = create_engine(DATABASE_URL)
        print("Successfully connected to the postgress database.")
        
    except Exception as e:
        print(f"database connection failed : {e}")
        print("Retrying in 5 seconds")
        time.sleep(5)
        
        

        
def get_and_lock_pending_job(connection):
    with connection.begin():
        find_query = text("""
            SELECT id, city FROM "Jobs"
            WHERE status = 'PENDING'
            ORDER BY "createdAt"
            LIMIT 1
            FOR UPDATE SKIP LOCKED;
        """)
        result = connection.execute(find_query).first()
        
        
        if result:
            jobId,city = result
            lock_query = text("""UPDATE "Jobs" SET status = 'IN_PROGRESS' WHERE id = :jobId""")
            connection.execute(lock_query,{"jobId":jobId})
            return {'id': jobId, 'city': city}
        return None
    
    
    
    
    
    
    def process_job(job):
        pass

def update_job_in_db(connection, job_id, status, result_data=None):
    update_query = text("""
        UPDATE "Jobs"
        SET status = :status, "resultData" = :result_data
        WHERE id = :jobId
    """)
    with connection.begin():
        connection.execute(update_query, {
            'job_id': job_id,
            'status': status,
            'result_data': result_data
        })
    print(f"Updated job {job_id} status to {status}")
    
    
    
    
    def main_loop():
        print("python worker started.Waiting for Jobs...")
        while True:
            job = None
            try:
                with engine.connect() as connection:
                    job = get_and_lock_pending_job(connection)
                    if job:
                        result_json = process_job(job)
                        update_job_in_db(connection,job['id'],"COMPLETED")
                        
                    else:
                        time.sleep(10)
                        

            except Exception as e:
                print(f"An error occurred while processing job {job['id'] if job else 'N/A'}: {e}")
                if job:
                    try:
                        with engine.connect() as connection:
                            update_job_in_db(connection, job['id'],'FAILED')
                        
                    except Exception as db_e:
                        
                        print(f"CRITICAL: Could not update job {job['id']} to FAILED: {db_e}")
                time.sleep(15)
                
                
if __name__ == "__main__":
    main_loop()
    
    
    
    
        
















if __name__ == '__main__':
    main()


