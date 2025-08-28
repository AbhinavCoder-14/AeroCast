"use client";
import axios from "axios";
import { Fascinate } from "next/font/google";
import { useEffect, useState } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
}


export default function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggrestion] = useState<any>([]);

  const [isDropDownVisable,setIsDropDownVisible] = useState<boolean>(false);


  useEffect(() => {
    if (city.length < 2) {
      setSuggrestion([]);
      return;
    }


    if (!isDropDownVisable){
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
  }, [city,isDropDownVisable]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (city.trim()) {
      onSearch(city.trim());
      setSuggrestion([])
      setIsDropDownVisible(false)
    }
  };

  const handleSuggestionClick = (suggestion:any) =>{
    setCity(suggestion)
    setSuggrestion([])
    setIsDropDownVisible(false)    
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-2 mb-6 w-full max-w-md mx-auto justify-around"
    >
      <div className="w-[500px] flex flex-row">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={() => setIsDropDownVisible(true)}
          placeholder="Enter city name..."
          className={` flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-transparent focus:border-blue-500 focus:ring-0 rounded-lg px-4 py-2.5 text-base transition`}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2.5 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Search
        </button>
      </div>
      
      {(isDropDownVisable || suggestions.length > 0) && (
        <div className="">
          {isLoading ? (

            <div className="text-2xl"></div>
          ):(
            <ul className={`${city.length>2 ? "visible" : "invisible"} suggestionBox text-left bg-white rounded-lg shadow-lg max-h-60 text-white text-[16px] w-[500px] border-2 border-[#364153]`}>


              {suggestions.map((suggestion:any,index:number)=>(
                <li key={index} className="cursor-pointer px-[5px] py-[5px] m-0 bg-[#364153] hover:bg-[#5e6b80]" onClick={()=> handleSuggestionClick(suggestion)}>
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
