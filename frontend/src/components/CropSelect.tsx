"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface Crop {
  id: string;
  name_en: string;
  name_hi: string;
  category: string;
  icon?: string;
}

// Fallback demo crops in case backend isn't connected
export const DEMO_CROPS: Crop[] = [
  { id: "c0000000-0000-0000-0000-000000000001", name_en: "Soybean", name_hi: "सोयाबीन", category: "oilseed" },
  { id: "c0000000-0000-0000-0000-000000000002", name_en: "Wheat", name_hi: "गेहूं", category: "cereal" },
  { id: "c0000000-0000-0000-0000-000000000003", name_en: "Cotton", name_hi: "कपास", category: "cash_crop" },
  { id: "c0000000-0000-0000-0000-000000000004", name_en: "Maize", name_hi: "मक्का", category: "cereal" },
  { id: "c0000000-0000-0000-0000-000000000005", name_en: "Mustard", name_hi: "सरसों", category: "oilseed" },
];

export const CATEGORY_LABELS: Record<string, { en: string, hi: string }> = {
  cereal: { en: "Cereals", hi: "अनाज" },
  pulse: { en: "Pulses", hi: "दालें" },
  oilseed: { en: "Oilseeds", hi: "तिलहन" },
  cash_crop: { en: "Cash Crops", hi: "नकदी फसलें" },
  vegetable: { en: "Vegetables", hi: "सब्जियां" },
  fruit: { en: "Fruits", hi: "फल" },
  spice: { en: "Spices", hi: "मसाले" },
  other: { en: "Other", hi: "अन्य" }
};

interface CropSelectProps {
  value?: string;
  onChange: (value: string) => void;
  crops?: Crop[];
  className?: string;
  placeholder?: string;
}

export function CropSelect({ value, onChange, crops = DEMO_CROPS, className, placeholder = "Select crop..." }: CropSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { language } = useLanguage();

  const getCropName = (c: Crop) => language === "hi" ? c.name_hi : c.name_en;
  const getCategoryName = (cat: string) => language === "hi" ? (CATEGORY_LABELS[cat]?.hi || cat) : (CATEGORY_LABELS[cat]?.en || cat);

  const filteredCrops = useMemo(() => {
    const s = search.toLowerCase();
    return crops.filter(c => 
      c.name_en.toLowerCase().includes(s) || 
      c.name_hi.includes(s)
    );
  }, [crops, search]);

  const groupedCrops = useMemo(() => {
    const groups: Record<string, Crop[]> = {};
    filteredCrops.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filteredCrops]);

  const selectedCrop = crops.find(c => c.id === value);

  return (
    <div className={cn("relative w-full", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">
          {selectedCrop ? getCropName(selectedCrop) : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
          <div className="sticky top-0 flex items-center border-b bg-popover px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={language === 'hi' ? "फसल खोजें..." : "Search crop..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="p-1">
            {Object.entries(groupedCrops).length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {language === 'hi' ? "कोई फसल नहीं मिली।" : "No crops found."}
              </div>
            ) : (
              Object.entries(groupedCrops).map(([category, categoryCrops]) => (
                <div key={category} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {getCategoryName(category)}
                  </div>
                  {categoryCrops.map(crop => (
                    <button
                      key={crop.id}
                      type="button"
                      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      onClick={() => {
                        onChange(crop.id);
                        setIsOpen(false);
                        setSearch("");
                      }}
                    >
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        {value === crop.id && <Check className="h-4 w-4" />}
                      </span>
                      {getCropName(crop)}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
