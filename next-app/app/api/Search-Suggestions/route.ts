import { NextResponse } from "next/server";

import prisma from "@/app/lib/db";
import axios from "axios";
import { features } from "process";

interface ListOfCity {
  city: string;
}

interface suggestedCity {
  data: ListOfCity[];
}




export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    console.log("Entered search suggestion backend route");

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      throw new Error("API key for Geoapify is not configured.");
    }
    const apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&type=city&apiKey=${apiKey}`;

    const response1 = await axios.get(apiUrl);
    const data = response1.data;

    const suggestions = data.features.map((feature: any) => {
      return feature.properties.formatted;
    });

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.log("api error");
    return NextResponse.json(
      { error: error.message || "Failed to fetch suggestion" },
      { status: 500 }
    );
  }
}
