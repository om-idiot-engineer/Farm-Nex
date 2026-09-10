"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search, Filter, MapPin, CheckCircle2, SlidersHorizontal, ArrowRight, ShieldCheck, Clock
} from "lucide-react";
import type { CropListing, DemandPost } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import { getDemandPosts, getMarketplaceListings } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import LoadingSkeleton from "@/components/LoadingSkeleton";

type MarketplaceView = "supply" | "demand";

function MarketplaceContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as MarketplaceView) || "supply";

  const [view, setView] = useState<MarketplaceView>(initialView);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  const [listings, setListings] = useState<CropListing[]>([]);
  const [demands, setDemands] = useState<DemandPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [listingsRes, demandsRes] = await Promise.all([
          getMarketplaceListings(),
          getDemandPosts()
        ]);
        setListings(listingsRes.data || []);
        setDemands(demandsRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isFarmer = user?.role === "farmer";
  const themeClass = isFarmer ? "theme-farmer" : "theme-buyer";
  const gradientClass = isFarmer ? "from-emerald-600 to-green-600" : "from-blue-600 to-indigo-600";
  const softBg = isFarmer ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-800";
  const highlightBorder = isFarmer ? "hover:border-emerald-300" : "hover:border-blue-300";

  const getEmoji = (crop: string) => {
    const l = crop.toLowerCase();
    if (l.includes("tomato")) return "🍅";
    if (l.includes("wheat")) return "🌾";
    if (l.includes("potato")) return "🥔";
    if (l.includes("soybean") || l.includes("soy")) return "🌱";
    if (l.includes("onion")) return "🧅";
    return "📦";
  };

  const getGradient = (crop: string) => {
    const l = crop.toLowerCase();
    if (l.includes("tomato")) return "from-red-400 to-orange-400";
    if (l.includes("wheat")) return "from-amber-300 to-yellow-500";
    if (l.includes("potato")) return "from-orange-300 to-amber-600";
    if (l.includes("soybean")) return "from-green-300 to-emerald-500";
    if (l.includes("onion")) return "from-fuchsia-400 to-purple-500";
    return "from-zinc-400 to-zinc-600";
  };

  const filteredListings = listings.filter(item => {
    if (selectedCrop !== "all" && !item.crop_id.toLowerCase().includes(selectedCrop.toLowerCase())) return false;
    if (onlyVerified && item.farmer_name && !item.farmer_name.includes("Verified")) return false;
    if (searchQuery && !item.crop_id.toLowerCase().includes(searchQuery.toLowerCase()) && !item.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredDemands = demands.filter(item => {
    if (selectedCrop !== "all" && !item.crop_id.toLowerCase().includes(selectedCrop.toLowerCase())) return false;
    if (searchQuery && !item.crop_id.toLowerCase().includes(searchQuery.toLowerCase()) && !item.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={`p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto ${themeClass}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-extrabold tracking-tight text-zinc-900">Mandi Exchange</h1>
          <p className="text-[13px] text-zinc-500 font-medium">Discover trusted buyers and premium harvest across India.</p>
        </div>

        <div className="flex bg-zinc-100/80 p-1 rounded-full border border-zinc-200">
          <button
            onClick={() => setView("supply")}
            className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm ${view === 'supply' ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'}`}
          >
            Produce (Supply)
          </button>
          <button
            onClick={() => setView("demand")}
            className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm ${view === 'demand' ? 'bg-white text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'}`}
          >
            Requirements (Demand)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="bg-white rounded-[24px] border border-zinc-200 p-5 shadow-sm space-y-6 h-fit sticky top-[88px]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[14px] flex items-center gap-2 uppercase tracking-wider text-zinc-500">
              <Filter className="w-4 h-4" /> Filters
            </h3>
            <button
              onClick={() => { setSelectedCrop("all"); setOnlyVerified(false); setSearchQuery(""); }}
              className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search crop or location..."
                className="w-full h-10 pl-9 pr-4 rounded-full bg-zinc-100 text-[13px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-[13px] text-zinc-900">Crop Category</h4>
            <div className="flex flex-col gap-2">
              {['all', 'soybean', 'wheat', 'tomato', 'potato', 'onion'].map(crop => (
                <label key={crop} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="crop"
                    checked={selectedCrop === crop}
                    onChange={() => setSelectedCrop(crop)}
                    className={`w-4 h-4 text-zinc-900 bg-zinc-100 border-zinc-300 rounded focus:ring-zinc-900`}
                  />
                  <span className={`text-[13px] font-medium capitalize ${selectedCrop === crop ? 'text-zinc-900 font-bold' : 'text-zinc-600 group-hover:text-zinc-900'}`}>
                    {crop === 'all' ? 'All Crops' : crop}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <h4 className="font-bold text-[13px] text-zinc-900">Quality & Trust</h4>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="w-4 h-4 text-zinc-900 rounded bg-zinc-100 border-zinc-300 focus:ring-zinc-900"
              />
              <span className="text-[13px] text-zinc-600 font-medium group-hover:text-zinc-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Verified Partners Only
              </span>
            </label>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-zinc-100 rounded-[20px] animate-pulse"></div>
              ))}
            </div>
          ) : view === "supply" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredListings.map(listing => (
                <div key={listing.id} className={`bg-white rounded-[20px] p-2 border border-zinc-200 shadow-sm transition-all ${highlightBorder} group flex flex-col`}>
                  <div className={`h-36 rounded-[16px] bg-gradient-to-br ${getGradient(listing.crop_id)} flex items-center justify-center text-[54px] relative shadow-inner overflow-hidden`}>
                    <span className="drop-shadow-lg group-hover:scale-110 transition-transform duration-500">{getEmoji(listing.crop_id)}</span>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-[8px] text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                      {listing.quality_grade}
                    </div>
                    {listing.farmer_name?.includes("Verified") && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-extrabold text-[16px] text-zinc-900 capitalize tracking-tight">{listing.crop_id}</h3>
                        <p className="text-[12px] text-zinc-500 font-medium mt-0.5">{listing.farmer_name || "Verified Farmer"}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-[16px] text-zinc-900">₹{listing.expected_price}</div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Per Qtl</div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-[12px] text-zinc-600 font-medium">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900">{listing.quantity} Qtl</span> Available
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-600 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-zinc-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {listing.harvest_date}
                      </div>
                    </div>

                    <Button asChild size="sm" className={`w-full mt-4 h-9 rounded-full font-bold text-[12px] text-white bg-gradient-to-br ${gradientClass} shadow-sm group-hover:shadow-md transition-all`}>
                      <Link href={`/marketplace/listings/${listing.id}`}>
                        Negotiate Offer <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {filteredListings.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 font-medium bg-white rounded-[24px] border border-dashed border-zinc-300">
                  No produce matching your filters.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredDemands.map(demand => (
                <div key={demand.id} className={`bg-white rounded-[20px] p-5 border border-zinc-200 shadow-sm transition-all ${highlightBorder} flex flex-col`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[24px] bg-gradient-to-br ${getGradient(demand.crop_id)} shadow-inner`}>
                        {getEmoji(demand.crop_id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-[16px] text-zinc-900 capitalize tracking-tight">{demand.crop_id}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${softBg}`}>
                            {demand.quality_grade}
                          </span>
                        </div>
                        <p className="text-[12px] text-zinc-500 font-medium mt-1 truncate">By {demand.buyer_name || demand.business_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                    <div className="bg-zinc-50 rounded-[12px] p-3 border border-zinc-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Target Rate</span>
                      <span className="font-black text-[16px] text-zinc-900">₹{demand.offered_price}</span>
                    </div>
                    <div className="bg-zinc-50 rounded-[12px] p-3 border border-zinc-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Required</span>
                      <span className="font-black text-[16px] text-zinc-900">{demand.quantity_needed} Qtl</span>
                    </div>
                    <div className="col-span-2 bg-zinc-50 rounded-[12px] p-3 border border-zinc-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span className="font-semibold text-[13px] text-zinc-700 truncate">{demand.location}</span>
                    </div>
                  </div>

                  <Button asChild size="sm" className={`w-full h-10 rounded-full font-bold text-[13px] text-white bg-gradient-to-br ${gradientClass} shadow-md hover:scale-[1.02] transition-transform`}>
                    <Link href={`/marketplace/requirements/${demand.id}`}>
                      Submit Quote <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              ))}
              {filteredDemands.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 font-medium bg-white rounded-[24px] border border-dashed border-zinc-300">
                  No active demands matching your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MarketplaceContent />
    </Suspense>
  );
}
