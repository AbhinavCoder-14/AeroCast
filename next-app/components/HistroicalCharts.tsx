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


interface YearlyDataPoint {
  month: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  rainfall: number;
  humidity: number;
}


  const yearlyData: YearlyDataPoint[] = Array.from({length: 12}, (_, i): YearlyDataPoint => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      month: monthNames[i],
      avgTemp: 5 + i * 2.5 + (i > 6 ? (12-i) * 2 : 0) + Math.random() * 5,
      maxTemp: 15 + i * 3 + (i > 6 ? (12-i) * 2.5 : 0) + Math.random() * 5,
      minTemp: -5 + i * 1.5 + (i > 6 ? (12-i) * 1.5 : 0) + Math.random() * 3,
      rainfall: 50 + Math.random() * 100,
      humidity: 60 + Math.random() * 25
    };
  });

interface HistoricalChartProps {
  currentCity:string;
}



const HistoricalChart = ({ currentCity }: HistoricalChartProps) => {

    return ( 
        <>
        
        
        <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2">Historical Weather Data</h2>
              <p className="text-white/70">Yearly trends and fun facts for {currentCity}</p>
            </div>

            {/* Yearly Temperature Chart */}
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
                    <Area type="monotone" dataKey="maxTemp" stackId="1" stroke="#EF4444" fill="#EF444480" name="Max Temp" />
                    <Area type="monotone" dataKey="avgTemp" stackId="2" stroke="#60A5FA" fill="#60A5FA80" name="Avg Temp" />
                    <Area type="monotone" dataKey="minTemp" stackId="3" stroke="#10B981" fill="#10B98180" name="Min Temp" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rainfall and Humidity Chart */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Monthly Rainfall</h3>
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
                      <Bar dataKey="rainfall" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Average Humidity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyData}>
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
                      <Line type="monotone" dataKey="humidity" stroke="#8B5CF6" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Fun Facts */}
            {/* <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">🎯 Weather Fun Facts</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {funFacts.map((fact: string, index: number) => (
                  <div key={index} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <p className="text-white/90">{fact}</p>
                  </div>
                ))}
              </div>
            </div> */}
          </div></>
    )



}



export default HistoricalChart;