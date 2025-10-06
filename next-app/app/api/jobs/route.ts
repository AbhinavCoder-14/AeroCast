import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import axios from "axios";

interface geoResponse {
  latitude: number;
  longitude: number;
}

interface geoCorrdinates {
  results?: geoResponse[];
}

interface currentWeather {
  current?: {
    temperature_2m: number;
    weather_code: number;
  };
}

// REMOVED 'export' - This is now a private helper function
async function getCurrentWeather(city: string) {
  try {
    console.log(`[Weather API] Fetching coordinates for city: ${city.split(",")[0]}`);
    
    const geoRes = await axios.get<geoCorrdinates>(
      `https://geocoding-api.open-meteo.com/v1/search`,
      {
        params: {
          name:city.split(",")[0],
          count: 1,
          language: "en",
          format: "json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const geoData = geoRes.data;
    if (!geoData.results || geoData.results.length === 0) {
      console.log(`[Weather API] No coordinates found for city: ${city}`);
      return null;
    }
    
    const { latitude, longitude } = geoData.results[0];
    console.log(`[Weather API] Found coordinates: ${latitude}, ${longitude}`);

    const weatherRes = await axios.get<currentWeather>(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,
          current: "temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,pressure_msl,visibility,wind_speed_10m",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    console.log(`[Weather API] Weather data received for ${city}`);
    return weatherRes.data.current ?? null;
  } catch (err) {
    console.error(`[Weather API] Error fetching weather for ${city}:`, err);
    if (axios.isAxiosError(err)) {
      console.error(`[Weather API] Axios error details:`, {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    }
    return null;
  }
}

// This is the ONLY export - the POST route handler
export async function POST(request: Request) {
  try {
    console.log("[API] POST request received");
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("[API] Request body parsed:", body);
    } catch (parseError) {
      console.error("[API] Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { city } = body;

    if (!city || typeof city !== 'string') {
      console.log("[API] Missing or invalid city parameter");
      return NextResponse.json(
        { error: "City is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("[API] Processing request for city:", city);

    // Test database connection first
    let newJob;
    try {
      console.log("[API] Attempting to create job in database...");
      newJob = await prisma.jobs.create({
        data: { city: city.trim() },
      });
      console.log(`[API] Job created successfully with ID: ${newJob.jobId}`);
    } catch (dbError) {
      console.error("[API] Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Database connection failed. Please check if the database is running.",
          details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
        },
        { status: 500 }
      );
    }

    // Fetch weather data
    let currentWeatherData;
    try {
      console.log("[API] Fetching weather data...");
      currentWeatherData = await getCurrentWeather(city.trim());
    } catch (weatherError) {
      console.error("[API] Weather API error:", weatherError);
      // Even if weather fails, we can still return the job
      return NextResponse.json(
        {
          jobId: newJob.jobId,
          error: "Weather data temporarily unavailable",
          currentWeather: currentWeatherData
        },
        { status: 201 }
      );
    }

    // Check if weather data was found
    if (!currentWeatherData) {
      console.log(`[API] No weather data found for city: ${city}`);
      return NextResponse.json(
        {
          jobId: newJob.jobId,
          error: `Weather data not found for city: ${city}`,
          currentWeather: null
        },
        { status: 404 }
      );
    }

    console.log("[API] Request completed successfully");
    return NextResponse.json(
      {
        jobId: newJob.jobId,
        currentWeather: currentWeatherData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}