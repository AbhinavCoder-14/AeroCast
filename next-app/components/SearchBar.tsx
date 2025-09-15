"use client";
import axios from "axios";
import { Fascinate } from "next/font/google";
import { useEffect, useState } from "react";
import { Search, Cloud } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [city, setCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggrestion] = useState<any>([]);

  const [isDropDownVisable, setIsDropDownVisible] = useState<boolean>(false);

  useEffect(() => {
    if (city.length < 2) {
      setSuggrestion([]);
      return;
    }

    if (!isDropDownVisable) {
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

    return () => clearTimeout(timerId);
  }, [city, isDropDownVisable]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (city.trim()) {
      onSearch(city.trim());
      setSuggrestion([]);
      setIsDropDownVisible(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setCity(suggestion);
    setSuggrestion([]);
    setIsDropDownVisible(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center space-x-4">
      <div className="relative group">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onFocus={() => setIsDropDownVisible(true)}
          placeholder="Enter city name..."
          className="pl-12 pr-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-weather-emerald/50 focus:border-weather-emerald/50 w-80 transition-smooth group-hover:bg-white/15 mr-3"
        />

        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-300 group-hover:text-weather-emerald transition-colors" />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-900 hover:shadow-emerald-glow rounded-2xl transition-smooth font-medium shadow-glass hover:scale-105"
        >
          Search
        </button>
        {(isDropDownVisable || suggestions.length > 0) && (
                <div className="">
                  {isLoading ? (
                    <div className="text-2xl invisible"></div>
                  ) : (
                    <ul
                      className={`${
                        city.length > 2 ? "visible" : "invisible"
                      } suggestionBox text-left bg-white rounded-lg shadow-lg max-h-60 text-white text-[16px] w-[300px] border-2 border-[#9e9e9e] absolute mx-[10px]`}
                    >
                      {suggestions.map((suggestion: any, index: number) => (
                        <li
                          key={index}
                          className="cursor-pointer  px-[5px] py-[5px] m-0 bg-[#929191] hover:bg-[#5e6b80]"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}




      </div>

      {/* {(isDropDownVisable || suggestions.length > 0) && (
        <div className="">
          {isLoading ? (
            <div className="text-2xl invisible"></div>
          ) : (
            <ul
              className={`${
                city.length > 2 ? "visible" : "invisible"
              } suggestionBox text-left bg-white rounded-lg shadow-lg max-h-60 text-white text-[16px] w-[300px] border-2 border-[#9e9e9e] absolute ml-[-205px]`}
            >
              {suggestions.map((suggestion: any, index: number) => (
                <li
                  key={index}
                  className="cursor-pointer  px-[5px] py-[5px] m-0 bg-[#929191] hover:bg-[#5e6b80]"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
      )} */}
    </form>
  );
}
