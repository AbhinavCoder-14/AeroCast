"use client";
import React, { useState } from "react";

import {
  Search,
  Cloud,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Leaf,
} from "lucide-react";

interface PageSelectorBarProps {
  activeSection: number;
  OnSectionChange: (sectionId: number) => void;
}

const PageSelectorBar = ({activeSection,OnSectionChange}:PageSelectorBarProps) => {
  // type navOption = 1 | 2 | 3;
  // const [activeSection, setActiveSection] = useState<number>(1);

  const navigationOptions: Array<{ id: number; name: string; icon: any }> = [
    { id: 1, name: "Current Weather", icon: Sun },
    { id: 2, name: "Historical Data", icon: Calendar },
    { id: 3, name: "Climate Analysis", icon: TrendingUp },
  ];

  return (
    <>
      <div className="w-[65%] bar flex justify-start space-x-1 mt-2 ml-2">
        {navigationOptions.map(({ id, name, icon }) => (
          <button
            key={id}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeSection === id
                ? "bg-white/20 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            onClick={() => OnSectionChange(id)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>
    </>
  );
};

export default PageSelectorBar;
