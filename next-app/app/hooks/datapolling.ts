"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";

// This interface defines the final shape of the data we expect from the Python worker.
// It's important to keep this in sync with what your worker.py script produces.
interface AnalysisData {
  chart_data: {
    hourly_today: {
      time: string;
      temperature: number;
      apparent_temperature: number;
      humidity: number;
      pressure: number;
      windSpeed: number;
    }[];
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
          console.log("calling api name [jobId]")
          const response = await axios.get(`/api/jobs/${jobId}`);
          const result = response.data;

          console.log("Polling result:", result)

          if (result.status === 'COMPLETED') {
            console.log("Job completed successfully!")
            
            // Check if we have result_data
            if (result.result_data && result.result_data !== 'hello' && result.result_data !== 'None') {
              try {
                console.log(`The Python work is done: ${result.result_data}`)
                const parsedData = JSON.parse(result.result_data);
                setAnalysisData(parsedData);
                setIsPolling(false);
                stopPolling();
              } catch (parseError) {
                console.error("Error parsing result_data:", parseError);
                setPollingError("Failed to parse analysis data.");
                setIsPolling(false);
                stopPolling();
              }
            } else {
              console.log("Job completed but no valid result_data found");
              setPollingError("Job completed but no data was returned.");
              setIsPolling(false);
              stopPolling();
            }
          } 
          else if (result.status === "FAILED") {
            console.log("Job failed in worker")
            setPollingError("Analysis failed in the background worker.");
            setIsPolling(false);
            stopPolling();
          }
          else if (result.status === "PENDING" || result.status === "IN_PROGRESS") {
            console.log(`Job status: ${result.status} - continuing to poll...`)
            // Continue polling - do nothing here
          }
          else {
            console.log("Unknown job status:", result.status)
          }
        } catch (error: any) {
          console.error("Polling error:", error);
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

    // Cleanup function - runs when component unmounts or jobId changes
    return () => {
      stopPolling(); 
    };
  }, [jobId]); // This entire effect function re-runs ONLY when the jobId changes

  return { analysisData, isPolling, pollingError };
};