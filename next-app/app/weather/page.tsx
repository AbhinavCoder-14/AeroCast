"use client";

import HourlyChart from "@/components/hourlyChart";
import SearchBar from "@/components/SearchBar";
import PageSelectorBar from "@/components/PageSelecterBar";
import HistoricalChart from "@/components/HistroicalCharts";
import { useState } from "react";
import { useDataPolling } from "../hooks/datapolling";

interface CurrentWeather {
  temperature_2m: number;
  weather_code: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  pressure_msl: number;
  visibility: number;
  apparent_temperature: number;
}

interface HourlyDataPoint {
  hour: string;
  value: number;
}

interface HourlyData {
  temperature: HourlyDataPoint[];
  humidity: HourlyDataPoint[];
  windSpeed: HourlyDataPoint[];
  pressure: HourlyDataPoint[];
}

const getWeatherInfo = (
  code: number
): { icon: string; description: string } => {
  const weatherMap: { [key: number]: { icon: string; description: string } } = {
    0: { icon: "☀️", description: "Clear sky" },
    1: { icon: "🌤️", description: "Mainly clear" },
    2: { icon: "⛅️", description: "Partly cloudy" },
    3: { icon: "☁️", description: "Overcast" },
    45: { icon: "🌫️", description: "Fog" },
    48: { icon: "🌫️", description: "Depositing rime fog" },
    51: { icon: "🌦️", description: "Light drizzle" },
    53: { icon: "🌦️", description: "Moderate drizzle" },
    55: { icon: "🌦️", description: "Dense drizzle" },
    61: { icon: "🌧️", description: "Slight rain" },
    63: { icon: "🌧️", description: "Moderate rain" },
    65: { icon: "🌧️", description: "Heavy rain" },
    80: { icon: "🌧️", description: "Slight rain showers" },
    81: { icon: "🌧️", description: "Moderate rain showers" },
    82: { icon: "🌧️", description: "Violent rain showers" },
    95: { icon: "⛈️", description: "Thunderstorm" },
  };
  return weatherMap[code] || { icon: "❓", description: "Unknown" };
};

export default function WeatherPage() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null
  );
  const [jobId, setJobId] = useState<string | null>(null);
  const [searchedCity, setSearchedCity] = useState<string>("");
  const [activeSection, setActiveSection] = useState<number>(1);

  // --- THIS IS THE POLLING CONNECTION ---
  // Call the hook here. It will automatically start when jobId is set.
  const { analysisData, isPolling, pollingError } = useDataPolling(jobId);

  // ADD DEBUG LOGS
  console.log("=== DEBUG INFO ===");
  console.log("jobId:", jobId);
  console.log("isPolling:", isPolling);
  console.log("analysisData:", analysisData);
  console.log("pollingError:", pollingError);


  const handleSearch = async (city: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchedCity(city);
    setJobId(null);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });

      const data = await response.json();
      console.log("API Response:", data); // DEBUG LOG

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch weather data");
      }

      setCurrentWeather(data.currentWeather);
      setJobId(data.jobId); // Set the new job ID, which starts the polling hook
      console.log("Set jobId to:", data.jobId); // DEBUG LOG
    } catch (err) {
      console.error("Search error:", err);
      setSearchError(
        err instanceof Error ? err.message : "Failed to fetch weather data"
      );
    } finally {
      setIsSearching(false);
    }
  };

  const { icon, description } = currentWeather
    ? getWeatherInfo(currentWeather.weather_code)
    : { icon: "", description: "" };

  // Helper function to format the analysis data for the HourlyChart
  const getFormattedHourlyData = (): HourlyData | null => {
    console.log("=== FORMATTING HOURLY DATA ===");
    console.log("analysisData:", analysisData);

    if (!analysisData) {
      console.log("No analysisData available");
      return null;
    } else if (!analysisData.chart_data) {
      console.log("No chart_data in analysisData");
      return null;
    } else if (!analysisData.chart_data.hourly_today) {
      console.log("No hourly_today in chart_data");
      return null;
    }

    console.log("=====================hourly_today data:", analysisData.chart_data.hourly_today);

    const format = (
      key: keyof (typeof analysisData.chart_data.hourly_today)[0]
    ) => {
      const result = analysisData.chart_data.hourly_today.map((d) => ({
        hour: new Date(d.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        value: d[key] as number,
      }));
      console.log(`Formatted ${key}:`, result);
      return result;
    };

    const formattedData = {
      temperature: format("temperature"),
      humidity: format("humidity"),
      windSpeed: format("windSpeed"),
      pressure: format("pressure"),
    };

    console.log("Final formatted data:", formattedData);
    return formattedData;
  };

  const formattedHourlyData = getFormattedHourlyData();
  console.log("formattedHourlyData result:", formattedHourlyData);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Weather Search</h1>
      <SearchBar onSearch={handleSearch} />

      {isSearching && (
        <div className="text-center mt-4">
          <p>Loading weather data...</p>
        </div>
      )}
      {searchError && (
        <div className="text-center mt-4 p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto">
          <p>Error: {searchError}</p>
        </div>
      )}

      {currentWeather && (
        <PageSelectorBar
          activeSection={activeSection}
          OnSectionChange={setActiveSection}
        />
      )}

      {currentWeather && searchedCity && activeSection === 1 && (
        <div className="flex justify-center align-middle flex-col ">
          <div className="text-center mt-6 p-6 rounded-lg max-w-md mx-auto">
            <h2 className="text-6xl font-semibold mb-4">{searchedCity}</h2>
            <div className="text-8xl">{icon}</div>
            <p className="text-6xl font-bold pt-5">
              {Math.round(currentWeather.temperature_2m)}°C
            </p>
            <p className="text-lg text-gray-600 mt-2">{description}</p>
            {jobId && (
              <p className="text-xs text-gray-500 mt-2">
                Analysis Job ID: {jobId}
              </p>
            )}
          </div>

          <div className="max-w-lg flex justify-around flex-wrap m-auto mb-3 p-3 border border-white/20 bg-white/10 rounded-3xl">
            <div className="m-1">
              Humidity: {currentWeather.relative_humidity_2m}%
            </div>
            <div className="m-1">
              Wind Speed: {currentWeather.wind_speed_10m} km/h
            </div>
            <div className="m-1">
              Pressure: {currentWeather.pressure_msl} hPa
            </div>
            <div className="m-1">
              Visibility: {currentWeather.visibility / 1000} km
            </div>
          </div>
        </div>
      )}

      {/* Show the historical chart section when selected */}
      {currentWeather && searchedCity && activeSection === 2 && (
        <div>
          {isPolling && (
            <p className="text-center mt-4">Analyzing historical data...</p>
          )}
          {pollingError && (
            <p className="text-center mt-4 text-red-500">{pollingError}</p>
          )}
          {analysisData ? (
            <HistoricalChart currentCity={searchedCity} />
          ) : (
            !isPolling && (
              <p className="text-center mt-4">No historical data available.</p>
            )
          )}
        </div>
      )}

      {/* Show the hourly chart from the polled data */}
      {currentWeather && searchedCity && activeSection === 1 && (
        <div>
          {isPolling && (
            <p className="text-center mt-4">
              Fetching today's hourly forecast...
            </p>
          )}
          {pollingError && (
            <p className="text-center mt-4 text-red-500">
              Polling Error: {pollingError}
            </p>
          )}
          {formattedHourlyData ? (
            <HourlyChart data={formattedHourlyData} />
          ) : (
            <p className="text-center mt-4 text-gray-500">
              {isPolling
                ? "Loading hourly data..."
                : "No hourly data available"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
