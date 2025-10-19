# python-worker/cleanup.py

import os
import time
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def cleanup_old_jobs():
    """
    Connects to the database and deletes jobs that were completed more than 7 days ago.
    """
    try:
        DATABASE_URL = os.environ.get("DATABASE_URL")
        if not DATABASE_URL:
            print("DATABASE_URL not found. Exiting.")
            return

        print("Connecting to the database for cleanup...")
        engine = create_engine(DATABASE_URL)

        with engine.connect() as connection:
            with connection.begin():
                cleanup_query = text("""
                    DELETE FROM "jobs"
                    WHERE status IN ('COMPLETED', 'FAILED')
                    AND "completedAt" < NOW() - INTERVAL '7 days';
                """)
                
                result = connection.execute(cleanup_query)
                print(f"Cleanup successful. Deleted {result.rowcount} old jobs.")

    except Exception as e:
        print(f"An error occurred during cleanup: {e}")

if __name__ == "__main__":
    print("Starting cleanup worker...")
    while True:
        cleanup_old_jobs()
        print("Sleeping for 1 hour before next cleanup.")
        time.sleep(3600)