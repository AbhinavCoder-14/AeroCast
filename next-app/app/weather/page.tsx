"use client";

import SearchBar from "@/components/SearchBar";
import { useState } from "react";

interface WeatherData {
  temperature_2m: number;
  weather_code: number;
}

export default function WeatherPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [searchedCity, setSearchedCity] = useState<string>("");

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setError(null);
    setSearchedCity(city);
    setJobId(null);
    setCurrentWeather(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }

      setCurrentWeather(data.currentWeather);
      setJobId(data.jobId);
      console.log("API Response:", data);

    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Weather Search</h1>
      
      <SearchBar onSearch={handleSearch} />
      
      {isLoading && (
        <div className="text-center mt-4">
          <p>Loading weather data...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center mt-4 p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto">
          <p>Error: {error}</p>
        </div>
      )}
      
      {currentWeather && searchedCity && (
        <div className="text-center mt-6 p-6 bg-black-400 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Weather for {searchedCity}</h2>
          <p className="text-lg">
            Temperature: {currentWeather.temperature_2m}°C
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Weather Code: {currentWeather.weather_code}
          </p>
          {jobId && (
            <p className="text-xs text-gray-500 mt-2">
              Job ID: {jobId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}