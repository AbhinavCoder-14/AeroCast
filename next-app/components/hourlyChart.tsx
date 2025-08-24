// /next-app/components/hourlyChart.tsx
"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// This is the shape of a single data point in the array we receive
interface ChartDataPoint {
  hour: string;
  value: number;
}

// The component now expects a simple array of these data points
interface HourlyChartProps {
  temperature: ChartDataPoint[];
  humidity: ChartDataPoint[];
  windSpeed: ChartDataPoint[];
  pressure: ChartDataPoint[];
}

interface FinalHourlyChartProps {
  data: HourlyChartProps;
}

type WeatherParameter = 'temperature' | 'humidity' | 'windSpeed' | 'pressure';
const parameterOptions :Array<{value:WeatherParameter;label:string}> =[
    { value: 'temperature', label: 'Temperature (°C)' },
    { value: 'humidity', label: 'Humidity (%)' },
    { value: 'windSpeed', label: 'Wind Speed (km/h)' },
    { value: 'pressure', label: 'Pressure (hPa)' }

];


const HourlyChart = ({ data }: FinalHourlyChartProps) => {
  const [SelectedGrpahParameter, setSelectedGrpahParameter] =
    useState<WeatherParameter>("temperature");

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="flex flex-col items-center justify-between mb-6">
        <div className="w-full flex flex-row justify-between border-2">
        <h3 className="text-2xl font-bold">24-Hour Trends</h3>
        <select
          value={SelectedGrpahParameter}
          onChange={(e) => setSelectedGrpahParameter(e.target.value as WeatherParameter)}
          className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {parameterOptions.map((option)=>(
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}

        </select>

        </div>

      <div className="border-2 mt-8 m-auto w-full flex flex-col justify-center">
        <h3 className=" text-xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          Today's Hourly Temperature
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={(data[SelectedGrpahParameter])}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value" // Use 'value' to get the temperature
              stroke="#8884d8"
              name="Temp (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    </div>
  );
};

export default HourlyChart;
