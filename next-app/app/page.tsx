"use client";

import HourlyChart from "@/components/hourlyChart";
import SearchBar from "@/components/SearchBar";
import PageSelectorBar from "@/components/PageSelecterBar";
import HistoricalChart from "@/components/HistroicalCharts";
import { useState } from "react";
import { useDataPolling } from "./hooks/datapolling";

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
    setJobId(null); // Reset job ID to trigger polling for a new search
    // setCurrentWeather(null);

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
    <div className="min-h-screen bg-gradient-to-br from-weather-bg-start via-weather-bg-middle to-weather-bg-end text-white relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:50px_50px] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-weather-emerald/10 via-transparent to-weather-teal/10"></div>

      <nav className="p-4 bug align-middle flex flex-col border-b border-white/10 justify-between backdrop-blur-xl items-center m-auto bug align-middle m-auto border-2 border-b border-white/10 relative bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-elevation">
        <div className="p-2 bug align-middle flex flex-row justify-between items-center m-auto w-[65%]">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-weather-emerald-light via-weather-teal to-weather-cyan bg-clip-text text-blue-600">
            AeroCast
          </h1>
          <SearchBar onSearch={handleSearch} />
        </div>

        {currentWeather && (
          <PageSelectorBar
            activeSection={activeSection}
            OnSectionChange={setActiveSection}
          />
        )}
      </nav>
      {isSearching && (
        <div className="min-h-screen bg-gradient-to-br text-white flex flex-col items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="w-10 h-10 rounded-full animate-spin
            border-4 border-solid border-blue-500 border-t-transparent"></div>
            {/* <div className="absolute inset-1.5 rounded-full bg-white dark:bg-slate-900"></div> */}
          </div>
            <p className="text-white">Loading...</p>
        </div>
      )}
      {searchError && (
        <div className="text-center mt-4 p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto">
          <p>Error: {searchError}</p>
        </div>
      )}

      {currentWeather && searchedCity && activeSection === 1 && (
        <div className="flex justify-center align-center flex-col">
          <div className="text-center mt-6 p-5 rounded-lg max-w-md m-auto">
            <h2 className="text-7xl font-semibold mb-4 border-2 w-[100%] m-auto">{searchedCity.split(",")[0]}</h2>
            <div className="text-8xl">{icon}</div>
            <p className="text-6xl font-bold pt-5">
              {Math.round(currentWeather.temperature_2m)}°C
            </p>
            <p className="text-lg text-gray-200 mt-2">{description}</p>
            {jobId && (
              <p className="text-xs text-gray-500 mt-2">
                {/* Analysis Job ID: {jobId} */}
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
            <HistoricalChart currentCity={searchedCity} analysisData={analysisData} />
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
            <>
            <div className="min-h-screen bg-gradient-to-br text-white flex flex-col items-center my-5">

              {/* <div className="relative w-12 h-12"> */}
                <div className="w-10 h-10 rounded-full animate-spin
                    border-4 border-solid border-blue-500 border-t-transparent"></div>
                    {/* <div className="absolute inset-1.5 rounded-full bg-white dark:bg-slate-900"></div> */}
                    {/* </div> */}
                  <p className="text-center mt-4">Analyzing past data with python...</p>
                  </div>
            </>
            
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
                ? (<div className="loading"></div>)
                : "No hourly data available"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
