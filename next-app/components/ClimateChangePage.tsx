import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Thermometer,
  CloudRain,
  Wind,
  AlertTriangle,
  Calendar,
  Sun,
  Droplets,
  Activity
} from 'lucide-react';

// Mock data structure based on your Python worker's return format
const mockClimateData = {
  annual_avg_temp: [
    { year: 1975, temp: 14.2 },
    { year: 1980, temp: 14.5 },
    { year: 1985, temp: 14.7 },
    { year: 1990, temp: 14.9 },
    { year: 1995, temp: 15.1 },
    { year: 2000, temp: 15.4 },
    { year: 2005, temp: 15.7 },
    { year: 2010, temp: 16.0 },
    { year: 2015, temp: 16.4 },
    { year: 2020, temp: 16.8 },
    { year: 2024, temp: 17.2 }
  ],
  heatwave_days_per_year: [
    { year: 1975, days: 2 },
    { year: 1980, days: 3 },
    { year: 1985, days: 4 },
    { year: 1990, days: 5 },
    { year: 1995, days: 8 },
    { year: 2000, days: 10 },
    { year: 2005, days: 14 },
    { year: 2010, days: 18 },
    { year: 2015, days: 22 },
    { year: 2020, days: 28 },
    { year: 2024, days: 35 }
  ],
  tropical_nights_per_year: [
    { year: 1975, nights: 5 },
    { year: 1980, nights: 6 },
    { year: 1985, nights: 8 },
    { year: 1990, nights: 10 },
    { year: 1995, nights: 14 },
    { year: 2000, nights: 18 },
    { year: 2005, nights: 22 },
    { year: 2010, nights: 28 },
    { year: 2015, nights: 35 },
    { year: 2020, nights: 42 },
    { year: 2024, nights: 50 }
  ],
  extreme_events: {
    hottest_day: { date: '2024-07-15', temp: 48.5, year: 2024 },
    coldest_day: { date: '1985-01-10', temp: -8.2, year: 1985 },
    rainiest_month: { month: 'July 2023', precipitation: 450.5, year: 2023 },
    windiest_day: { date: '2019-03-22', speed: 95.3, year: 2019 }
  },
  trend_analysis: {
    total_temp_rise: 3.0,
    slope_per_year: 0.06,
    period_years: 50,
    projection_2050: 18.8
  }
};

const ClimateChangePage = ({ currentCity = "New York", analysisData = mockClimateData }) => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, title: string, value: string | number, subtitle: string, trend?: number, color: string }) => (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend > 0 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
          }`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-semibold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-white/70 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/60 text-sm">{subtitle}</p>
    </div>
  );

  const ExtremeEventCard = ({ icon: Icon, title, value, date, color }:any) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${color} shadow-xl`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="relative z-10">
        <Icon className="w-8 h-8 text-white mb-3" />
        <h3 className="text-white/90 text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-white/80 text-sm">{date}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-10 h-10 text-emerald-400" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Climate Change Analysis
            </h1>
            <p className="text-white/70 text-lg mt-1">
              50-Year Climate Trends for {currentCity.split(',')[0]}
            </p>
          </div>
        </div>
        
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-300 font-semibold mb-1">Climate Warning</h3>
            <p className="text-white/80 text-sm">
              Temperature has risen by <span className="font-bold text-amber-300">
                {analysisData.trend_analysis.total_temp_rise}°C
              </span> over the past {analysisData.trend_analysis.period_years} years. 
              Current trends suggest continued warming.
            </p>
          </div>
        </div>
      </div>

      {/* Key Statistics Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          title="Total Temperature Rise"
          value={`+${analysisData.trend_analysis.total_temp_rise}°C`}
          subtitle={`Over ${analysisData.trend_analysis.period_years} years`}
          trend={12}
          color="from-red-500 to-orange-500"
        />
        <StatCard
          icon={Thermometer}
          title="Annual Warming Rate"
          value={`+${analysisData.trend_analysis.slope_per_year}°C`}
          subtitle="Per year average"
          trend={8}
          color="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={Sun}
          title="2050 Projection"
          value={`${analysisData.trend_analysis.projection_2050}°C`}
          subtitle="Expected avg temperature"
          trend={15}
          color="from-amber-500 to-yellow-500"
        />
        <StatCard
          icon={Activity}
          title="Heatwave Days (2024)"
          value={analysisData.heatwave_days_per_year[analysisData.heatwave_days_per_year.length - 1].days}
          subtitle="Days above 45°C"
          trend={25}
          color="from-red-600 to-pink-600"
        />
      </div>

      {/* Main Chart - Temperature Trends */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">50-Year Temperature Evolution</h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-white/10 text-white rounded-xl px-4 py-2 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="temperature" className="bg-gray-800">Temperature Trend</option>
              <option value="heatwaves" className="bg-gray-800">Heatwave Days</option>
              <option value="tropical" className="bg-gray-800">Tropical Nights</option>
            </select>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            {selectedMetric === 'temperature' ? (
              <AreaChart data={analysisData.annual_avg_temp}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="year" 
                  stroke="rgba(255,255,255,0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  style={{ fontSize: '12px' }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                  formatter={(value) => [`${value}°C`, 'Avg Temperature']}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
              </AreaChart>
            ) : selectedMetric === 'heatwaves' ? (
              <BarChart data={analysisData.heatwave_days_per_year}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="days" radius={[8, 8, 0, 0]}>
                  {analysisData.heatwave_days_per_year.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(239, 68, 68, ${0.4 + (index / analysisData.heatwave_days_per_year.length) * 0.6})`} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={analysisData.tropical_nights_per_year}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nights" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Extreme Events Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
          Extreme Weather Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ExtremeEventCard
            icon={Thermometer}
            title="Hottest Day Recorded"
            value={`${analysisData.extreme_events.hottest_day.temp}°C`}
            date={new Date(analysisData.extreme_events.hottest_day.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            color="from-red-600 to-orange-600"
          />
          <ExtremeEventCard
            icon={Thermometer}
            title="Coldest Day Recorded"
            value={`${analysisData.extreme_events.coldest_day.temp}°C`}
            date={new Date(analysisData.extreme_events.coldest_day.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            color="from-blue-600 to-cyan-600"
          />
          <ExtremeEventCard
            icon={CloudRain}
            title="Rainiest Month"
            value={`${analysisData.extreme_events.rainiest_month.precipitation}mm`}
            date={analysisData.extreme_events.rainiest_month.month}
            color="from-blue-500 to-indigo-600"
          />
          <ExtremeEventCard
            icon={Wind}
            title="Windiest Day"
            value={`${analysisData.extreme_events.windiest_day.speed} km/h`}
            date={new Date(analysisData.extreme_events.windiest_day.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            color="from-purple-600 to-pink-600"
          />
        </div>
      </div>

      {/* Heatwave vs Tropical Nights Comparison */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sun className="w-6 h-6 text-red-400" />
            Heatwave Days Trend (Days &gt; 45°C)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analysisData.heatwave_days_per_year}>
              <defs>
                <linearGradient id="heatwaveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" style={{ fontSize: '11px' }} />
              <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="days" 
                stroke="#dc2626" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#heatwaveGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-amber-400" />
            Tropical Nights Trend (Nights &gt; 25°C)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analysisData.tropical_nights_per_year}>
              <defs>
                <linearGradient id="tropicalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" style={{ fontSize: '11px' }} />
              <YAxis stroke="rgba(255,255,255,0.7)" style={{ fontSize: '11px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="nights" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tropicalGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Data Analysis Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/80">
            <div>
              <span className="font-semibold text-white">Analysis Period:</span> 
              <p className="mt-1">{analysisData.trend_analysis.period_years} years of climate data</p>
            </div>
            <div>
              <span className="font-semibold text-white">Data Source:</span> 
              <p className="mt-1">Open-Meteo Archive API (Historical Weather)</p>
            </div>
            <div>
              <span className="font-semibold text-white">Last Updated:</span> 
              <p className="mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateChangePage;