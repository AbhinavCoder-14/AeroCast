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

// The component now expects a simple array of these data points for each parameter
interface HourlyChartProps {
  data: {
    temperature: ChartDataPoint[];
    humidity: ChartDataPoint[];
    windSpeed: ChartDataPoint[];
    pressure: ChartDataPoint[];
  };
}

type WeatherParameter = 'temperature' | 'humidity' | 'windSpeed' | 'pressure';

const parameterOptions: Array<{ value: WeatherParameter; label: string; unit: string; color: string }> = [
  { value: 'temperature', label: 'Temperature', unit: '°C', color: '#EF4444' },
  { value: 'humidity', label: 'Humidity', unit: '%', color: '#3B82F6' },
  { value: 'windSpeed', label: 'Wind Speed', unit: 'km/h', color: '#10B981' },
  { value: 'pressure', label: 'Precipitation Probability', unit: '%', color: '#8B5CF6' }
];

const HourlyChart = ({ data }: HourlyChartProps) => {
  const [selectedGraphParameter, setSelectedGraphParameter] = useState<WeatherParameter>("temperature");
  
  // Get current parameter info
  const currentParameter = parameterOptions.find(param => param.value === selectedGraphParameter);
  
  // Get the data for the selected parameter
  const chartData = data[selectedGraphParameter] || [];

  return (
    <div className="bg-white/10 w-[86%] backdrop-blur-lg rounded-3xl p-7 border border-white/20 shadow-2xl m-auto">
      <div className="flex flex-col items-center justify-between mb-4">
        <div className="w-full flex flex-row justify-between items-center">
          <h3 className="text-2xl font-bold">24-Hour Trends</h3>
          <select
            value={selectedGraphParameter}
            onChange={(e) => setSelectedGraphParameter(e.target.value as WeatherParameter)}
            className="bg-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20"
          >
            {parameterOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-gray-800 text-white"
              >
                {option.label} ({option.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 m-auto w-full flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-center mb-7 text-white">
            Today's Hourly {currentParameter?.label || 'Data'}
          </h3>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="hour" 
                  fontSize={12} 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  fontSize={12} 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white'
                  }}
                  labelStyle={{ color: 'white' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={currentParameter?.color || "#8884d8"}
                  name={`${currentParameter?.label || 'Value'} (${currentParameter?.unit || ''})`}
                  strokeWidth={3}
                  dot={{ fill: currentParameter?.color || "#8884d8", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: currentParameter?.color || "#8884d8", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-white/70">
              <p>No hourly data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HourlyChart;