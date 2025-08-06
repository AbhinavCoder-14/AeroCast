"use client";

import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import { checkServerIdentity } from "tls";

export default function WeatherPage() {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [error, setError] = useState<string | null>();
  const [currentWeather, setCurrentWeather] = useState<string | null>();
  const [isJob, setJobId] = useState<string | null>("");
  const [searchedCity, setSearchedCity] = useState<string>("");

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setError(null);
    setSearchedCity(city);
    setJobId(null);
    setCurrentWeather(null);

    try {
      const response = await fetch("api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch weather data. City might not be found.');
      }

      const data = await response.json();
      setCurrentWeather(data.currentWeather);
    //   setJobId(data?.jobId);
    console.log(data)

    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setIsLoading(false);
    }
  };

  return <SearchBar onSearch={handleSearch} />;
}
