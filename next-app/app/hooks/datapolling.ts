"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";

// This interface defines the final shape of the data we expect from the Python worker.
// It's important to keep this in sync with what your worker.py script produces.
interface AnalysisData {
  // insights: {
  //   hottest_day: { date: string; temp: number };
  //   avg_temp_year: number;
  // };
  chart_data: {
    hourly_today: {
      time: string;
      temperature: number;
      apparent_temperature: number;
      humidity: number;
      pressure: number;
      windSpeed: number;
    }[];
    // daily_yearly: {
    //   time: string;
    //   temperature_2m_max: number;
    //   temperature_2m_min: number;
    // }[];
  };
}

// This interface defines the shape of the Job object our API returns.
interface Job {
  jobId: string;
  city: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  result_data: string | null; // The result_data from Python is a JSON string
}

// The custom hook to handle polling logic
export const useDataPolling = (jobId: string | null) => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Helper function to safely stop any active polling
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    

    // When the jobId changes, reset everything
    setAnalysisData(null);
    setPollingError(null);
    stopPolling();

    if (jobId) {
      setIsPolling(true); // Start loading as soon as we have a jobId

      const poll = async () => {
        try {
          // Poll the specific job status endpoint
          console.log("calling api name  [jobId]")
          const response = await axios.get(`/api/jobs/${jobId}`);
          const result = response.data;

          if (result.status){

          }
          console.log("===========",result)

          if (result['status'] == 'COMPLETED') {
            console.log("completed job enterd********")
            const response1 = await axios.get(`/api/jobs/${jobId}`);

            const result1 = response1.data
            console.log("******************************",result1)
            if (result.result_data) {
              console.log(`The Python work is done :${result.result_data}`)
              
              setAnalysisData(JSON.parse(result.result_data));
              setIsPolling(false);
              stopPolling();
            }
          } 
          
          else if (result['status'] == "FAILED") {
            setPollingError("Analysis failed in the background worker.");
            setIsPolling(false);
            stopPolling();
          
          }

          else{
            console.log("===========not matched with anything================")
          }
          // If status is PENDING or IN_PROGRESS, do nothing and let the interval call again.
        } catch (error: any) {
          setPollingError("Failed to poll for job status.");
          setIsPolling(false);
          stopPolling();
        }
      };

      // Start polling immediately, then repeat every 3 seconds
      poll();
      intervalRef.current = setInterval(poll, 3000);
    } else {
      setIsPolling(false);
    }

    // This is a cleanup function. It runs when the component unmounts or the jobId changes.
    return () => {
      // stopPolling(); 
    };
  }, [jobId]); // This entire effect function re-runs ONLY when the jobId changes

  return { analysisData, isPolling, pollingError };
};
