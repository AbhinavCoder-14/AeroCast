
"use client";


import SearchBar from "@/components/SearchBar";
import { checkServerIdentity } from "tls";






export default function WeatherPage(){
    const handleSearch = (city:string) =>{
        console.log("enterd in handle search")
    }

    return(
        <SearchBar onSearch={handleSearch}/>
    )

}