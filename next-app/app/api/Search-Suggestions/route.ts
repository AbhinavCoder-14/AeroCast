import { NextResponse } from "next/server";

import prisma from "@/app/lib/db";
import axios from "axios";

interface ListOfCity{
    city:string;
}


interface suggestedCity{
    data:ListOfCity[];
}



export async function GetSuggestions(partialCity:string) {

    try{

        console.log("Entered search suggestion backend route")

        const city_json = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${partialCity}&count=5`)


        const 




    }


    
}