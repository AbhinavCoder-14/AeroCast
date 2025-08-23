// /next-app/components/hourlyChart.tsx
'use client';

import React from "react";
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
  data:HourlyChartProps
}

const HourlyChart = ({data}: FinalHourlyChartProps) => {
  // The data is already in the correct format, so we can use it directly.
  // The 'dataKey' in the chart components will look for the 'hour' and 'value' properties.
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-white">
        Today's Hourly Temperature
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data.humidity}>
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
  );
};

export default HourlyChart;