"use client";

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

// interface ChartDataInside {
//   hour:number,
//   value:number,
//   time:number

// }

interface ChartDataPoints {
  temperature: { hour: string; value: number; time: number }[];
  humidity: { hour: string; value: number; time: number }[];
  windSpeed: { hour: string; value: number; time: number }[];
  pressure: { hour: string; value: number; time: number }[];
}

// interface ChartDataPoints {
//   temperature: ChartDataInside[];
//   humidity: ChartDataInside[];
//   windSpeed: ChartDataInside[];
//   pressure: ChartDataInside[];
//   feelsLike: ChartDataInside[];
// }

interface HourlyChartProp {
  data: ChartDataPoints[];
}

const HourlyChart = ({ data }: HourlyChartProp) => {
  const formattedData = data.map((item) => ({
    ...item,
    time: new Date(item.time).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    }),
  }));

  return (
    <>
      <div className="mt-8">
        <h3 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          Today's Hourly Forecast
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#8884d8"
              name="Temp (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default HourlyChart;
