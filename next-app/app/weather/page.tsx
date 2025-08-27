"use client";

import HourlyChart from "@/components/hourlyChart";
import SearchBar from "@/components/SearchBar";
import PageSelectorBar from "@/components/PageSelecterBar"
import HistoricalChart from "@/components/HistroicalCharts"

import { act, useState } from "react";

interface WeatherData {
  temperature_2m: number;
  weather_code: number;
  Humidity: number;
  Wind_speed: number;
  Pressure: number;
  Visibility: number;
  feels_like: number;
}

interface WeatherCardProps {
  weather: WeatherData;
  city: string;
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
  // Return the matching icon/description, or a default if the code is unknown.
  return weatherMap[code] || { icon: "❓", description: "Unknown" };
};


// Mock hourly data for the past 24 hours
interface HourlyDataPoint {
  hour: string;
  value: number;
  time: number;
}

interface HourlyData {
  temperature: HourlyDataPoint[];
  humidity: HourlyDataPoint[];
  windSpeed: HourlyDataPoint[];
  pressure: HourlyDataPoint[];
}


const generateHourlyData = (
  baseValue: number,
  range: number
): HourlyDataPoint[] => {
  return Array.from(
    { length: 24 },
    (_, i): HourlyDataPoint => ({
      hour: `${23 - i}:00`,
      value: baseValue + Math.random() * range,
      time: i,
    })
  ).reverse();
};

const hourlyData: HourlyData = {
  temperature: generateHourlyData(18, 12),
  humidity: generateHourlyData(45, 40),
  windSpeed: generateHourlyData(5, 20),
  pressure: generateHourlyData(1005, 20),
};


export default function WeatherPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null
  );

  // const [HourlyWeatherData , SetHourlyWeatherData] = useState<>()
  const [jobId, setJobId] = useState<string | null>(null);
  const [searchedCity, setSearchedCity] = useState<string>("");

  const [tempData, setTempData] = useState<string | null>();

  const [activeSection, setActiveSection] = useState<number>(1);

  const handleSearch = async (city: string) => {
    // setIsLoading(true);
    // setError(null);
    // setSearchedCity(city);
    // setJobId(null);
    // setCurrentWeather(null);

    setError(null);
    setSearchedCity(city);
    setJobId(null);
    setCurrentWeather({
      temperature_2m: 30,
      weather_code: 1,
      Humidity: 65,
      Wind_speed: 12,
      Pressure: 1013,
      Visibility: 10,
      feels_like: 34,
    });
    setIsLoading(false);

    // try {
    //   const response = await fetch("/api/jobs", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ city }),
    //   });

    //   const data = await response.json();

    //   if (!response.ok) {
    //     throw new Error(data.error || 'Failed to fetch weather data');
    //   }

    //   setCurrentWeather(data.currentWeather);
    //   setJobId(data.jobId);
    //   console.log("API Response:", data);

    // } catch (err) {
    //   console.error("Search error:", err);
    //   setError(err instanceof Error ? err.message : "Failed to fetch weather data");
    // } finally {
    //   setIsLoading(false);
    // }
  };
  const { icon, description } = currentWeather
    ? getWeatherInfo(currentWeather.weather_code)
    : { icon: "", description: "" };

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

      <PageSelectorBar activeSection={activeSection} OnSectionChange={setActiveSection}/>

      {currentWeather && searchedCity && (activeSection===1) && (
        <div className="flex justify-center align-middle flex-col ">
          <div className="text-center mt-6 p-6 bg-black-400 rounded-lg max-w-md mx-auto">
            <h2 className="text-6xl font-semibold mb-4">{searchedCity}</h2>
            <div className="text-8xl">{icon}</div>
            <p className="text-6xl font-bold pt-5">
              {currentWeather.temperature_2m}°C
            </p>

            <p className="text-lg text-gray-600 mt-2">{description}</p>
            {jobId && (
              <p className="text-xs text-gray-500 mt-2">Job ID: {jobId}</p>
            )}
          </div>

          <div className="max-w-lg flex justify-around flex-wrap m-auto mb-3 p-3 border border-white/20 bg-white/10 rounded-3xl">
            <div className="m-1">Humidity: {currentWeather.Humidity}</div>
            <div className="m-1">Wind Speed: {currentWeather.Wind_speed}</div>

            <div className="m-1">Pressure: {currentWeather.Pressure}</div>

            <div className="m-1">Visibility: {currentWeather.Visibility}</div>
          </div>

          <div className="chart">
            <HourlyChart data={hourlyData} />
          </div>
        </div>
      )}


      {currentWeather && searchedCity && (activeSection===2) && (

        <div>

          <HistoricalChart currentCity={searchedCity} />




          
        </div>


      )}


    </div>
  );
}
