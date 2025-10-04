'use client';

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

interface HistoricalDataPoint {
  month: string;
  temp_mean: number;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  wind_max: number;
}

const HistoricalChart = ({ currentCity, analysisData }: any) => {
  const getFormattedHistoricalData = (): HistoricalDataPoint[] | null => {
    if (!analysisData) {
      console.log("No analysisData available");
      return null;
    } else if (!analysisData.chart_data) {
      console.log("no chart_data in analysisData");
      return null;
    } else if (!analysisData.chart_data.historical_avg_records) {
      console.log("no historical_avg_records in chart_data");
      return null;
    }

    const formattedData = analysisData.chart_data.historical_avg_records.map((record: any) => ({
      month: record.month,
      temp_mean: record.temp_mean,
      temp_max: record.temp_max,
      temp_min: record.temp_min,
      precipitation: record.precipitation,
      wind_max: record.wind_max
    }));

    console.log("Formatted historical data:", formattedData);
    return formattedData;
  };

  const yearlyData = getFormattedHistoricalData();
  
  // Return early if no data
  if (!yearlyData || yearlyData.length === 0) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-4xl font-bold mb-2">Historical Weather Data</h2>
        <p className="text-white/70">No historical data available for {currentCity}</p>
      </div>
    );
  }

  return (
  
    <>
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">Historical Weather Data</h2>
          <p className="text-white/70">Yearly trends for {currentCity}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">Annual Temperature Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                <YAxis stroke="rgba(255,255,255,0.7)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Area type="monotone" dataKey="temp_max" stackId="1" stroke="#EF4444" fill="#EF444480" name="Max Temp (°C)" />
                <Area type="monotone" dataKey="temp_mean" stackId="2" stroke="#60A5FA" fill="#60A5FA80" name="Avg Temp (°C)" />
                <Area type="monotone" dataKey="temp_min" stackId="3" stroke="#10B981" fill="#10B98180" name="Min Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Monthly Precipitation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="precipitation" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Precipitation (mm)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Average Max Wind Speed</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                  <Line type="monotone" dataKey="wind_max" stroke="#8B5CF6" strokeWidth={3} name="Wind Speed (km/h)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoricalChart;