"use client";

import axios from "axios";
import { Fascinate } from "next/font/google";
import { useState, useRef, useEffect } from "react";

interface AnalysisData {
  insights: {};
  chart_data: {
    hourly_today: {
      time: string;
      temperature: number;
      apparent_temperature: number;
      relative_humidity_2m: number;
      precipitation_probability: number;
      wind_speed_10m: number;
    }[];
    daily_yearly: {
      //   time: string;
      //   temperature_2m_max: number;
      //   temperature_2m_min: number;
    }[];
  };
}

interface job {
  jobId: string;
  city: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  result_data: string | null;
  createdAt: string;
}

export const DataPolling = (jobId: string | null) => {
  const [Final_Result, setFinal_Result] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    setFinal_Result(null);
    setError(null);
    stopPolling();

    if (jobId) {
      const poll = async () => {
        try {
          setIsLoading(true);
          const response = await axios.get(`api/jobs/${jobId}`);
          const result: job = response.data;

          if (result.status == "COMPLETED") {
            if (result.result_data) {
              setFinal_Result(JSON.parse(result.result_data));
            }
            setIsLoading(false);
            stopPolling();
          } else if (result.status === "FAILED") {
            setError("Analysis failed. Please try again");
            setIsLoading(false);
            stopPolling();
          }
        } catch (error: any) {
          setError(error.message);
          setIsLoading(false);
          stopPolling();
        }

        poll();
        intervalRef.current = setInterval(poll, 3000);
      };
    } else {
      setIsLoading(false);
    }

    return { Final_Result, isLoading, error };
  }, [jobId]);
};
