"use client";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
}


export default function SearchBar({ onSearch }: SearchBarProps) {
  // Initialize with empty string instead of undefined
  const [city, setCity] = useState<string>("New York");
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 mb-6 w-full max-w-md mx-auto"
    >
      <input
        type="text"
        value={city} // Now always controlled with a string value
        onChange={(e) => setCity("New York")}
        placeholder="Enter city name..."
        className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-2 border-transparent focus:border-blue-500 focus:ring-0 rounded-lg px-4 py-2.5 text-base transition"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-5 py-2.5 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Search
      </button>
    </form>
  );
}