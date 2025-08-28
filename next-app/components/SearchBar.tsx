"use client";
import axios from "axios";
import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
}


export default function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggrestion] = useState<any>([]);

  useEffect(() => {
    if (city.length < 2) {
      setSuggrestion([]);
      return;
    }

    const timerId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/Search-Suggestions?q=${city}`);
        const data = response.data;

        if (data.suggestions) {
          setSuggrestion(data.suggestions);
        }
      } catch (error) {
        console.log("error while callin this api of search suggestions");
        setSuggrestion([]);
      }


      setIsLoading(false);
    }, 300);



    return() => clearTimeout(timerId)
  }, [city]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (city.trim()) {
      onSearch(city.trim());
      setSuggrestion([])
    }
  };

  const handleSuggestionClick = (suggestion:any) =>{
    setCity(suggestion)
    setSuggrestion([])
    setIsLoading(false)

    
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-2 mb-6 w-full max-w-md mx-auto justify-around"
    >
      <div>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
          className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent focus:border-blue-500 focus:ring-0 rounded-lg px-4 py-2.5 text-base transition"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2.5 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Search
        </button>
      </div>
      
      {(isLoading || suggestions.length > 0) && (
        <div className="">
          {isLoading ? (

            <div className="text-2xl">Loading...</div>
          ):(
            <ul className="suggestionBox border-2 text-center m-1 text-xl font-bold">

              {suggestions.map((suggestion:any,index:number)=>(
                <li key={index} onClick={()=> handleSuggestionClick(suggestion)}>
                  {suggestion}
                </li>
              ))}


            </ul>



          )}

        </div>



      )}






    </form>
  );
}
