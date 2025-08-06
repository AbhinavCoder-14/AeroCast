import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import axios from "axios";

interface geoResponse {
  latitude: number;
  longitude: number;
}

interface geoCorrdinates {
  result?: geoResponse[];
}

interface currentWeather {
  current?: any;
}

export async function getCurrentWeather(city: string) {

  try {
    const geoRes = await axios.get<geoCorrdinates>(`https://geocoding-api.open-meteo.com/v1/search`, {
      params: {
        name: city,
        count: 1,
        language: "en",
        format: "json",
      },
    });

    const geoData = geoRes.data;
    if (!geoData.result || geoData.result.length == 0) {
      return null;
    }
    const { latitude, longitude } = geoData.result[0];

    const currentWeather = await axios.get<currentWeather>("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude,
        longitude,
        current: "temperature_2m,weather_code", // matches your original query
      },
    });

    return currentWeather.data ?? null;

  } catch (err) {
    console.error(`[Weather API] Error fetching weather for ${city}:`, err);
    return null;
  }
}


export async function POST(request: Request) {
  // ... all the code for the function
  console.log("enterd in backend")
}