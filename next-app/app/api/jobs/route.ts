import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import axios from "axios";

interface geoResponse {
  latitude: number;
  longitude: number;
}

interface geoCorrdinates {
  results?: geoResponse[]; // Note: it's 'results' not 'result'
}

interface currentWeather {
  current?: {
    temperature_2m: number;
    weather_code: number;
  };
}

export async function getCurrentWeather(city: string) {
  try {
    const geoRes = await axios.get<geoCorrdinates>(
      `https://geocoding-api.open-meteo.com/v1/search`,
      {
        params: {
          name: city,
          count: 1,
          language: "en",
          format: "json",
        },
      }
    );

    const geoData = geoRes.data;
    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }
    const { latitude, longitude } = geoData.results[0];

    const weatherRes = await axios.get<currentWeather>(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,
          current: "temperature_2m,weather_code",
        },
      }
    );

    return weatherRes.data.current ?? null;
  } catch (err) {
    console.error(`[Weather API] Error fetching weather for ${city}:`, err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { city } = body;

    if (!city) {
      return NextResponse.json(
        {
          error: "City is required",
        },
        { status: 400 }
      );
    }

    console.log("Requested data for the city:", city);

    const [newJob, currentWeatherData] = await Promise.all([
      prisma.jobs.create({
        data: { city: city },
      }),
      getCurrentWeather(city),
    ]);

    console.log(`New job token has been created: ${newJob.jobId}`);

    // Check if weather data was found
    if (!currentWeatherData) {
      return NextResponse.json(
        {
          error: `Weather data not found for city: ${city}`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        jobId: newJob.jobId,
        currentWeather: currentWeatherData, // Use consistent naming
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error creating analysis job:", error);
    return NextResponse.json(
      { error: "Failed to create the job" },
      { status: 500 }
    );
  }
}