"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Heart, 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  Bell, 
  Calendar, 
  ShoppingBag, 
  Leaf, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function ConsumerFollowingFarmsPage() {
  const { user, loading } = useRequiredUser(["consumer", "admin", "farmer", "buyer", "fpo"]);

  const [followedFarms, setFollowedFarms] = useState([
    {
      id: "farmer-ramesh",
      producerId: "usr-farmer-01",
      farmName: "Vedic Soil Naturals",
      farmerName: "Ramesh Patel",
      location: "Sanwer, Indore District, MP",
      specialty: "Cold-Pressed Mustard Oil & Stone-Ground Sharbati Atta",
      followersCount: 1420,
      nextHarvest: "March 2026",
      upcomingCrop: "Spring Chickpeas (Desi Chana)",
      certifiedOrganic: true,
      image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "fpo-malwa",
      producerId: "demo-fpo",
      farmName: "Malwa Organic Pulses Collective",
      farmerName: "Sunita Verma & 38 Women Farmers",
      location: "Depalpur, MP",
      specialty: "Unpolished Native Tur Dal & Cold-Pressed Groundnut Oil",
      followersCount: 2890,
      nextHarvest: "April 2026",
      upcomingCrop: "Summer Moong Dal",
      certifiedOrganic: true,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    }
  ]);

  if (loading) {
    return <LoadingSkeleton variant="detail" />;
  }

  const handleUnfollow = (id: string) => {
    setFollowedFarms(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/consumer" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Fresh Market
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Followed Farms & Harvest Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get priority access when your favorite family farms release freshly pressed oils and unpolished seasonal dal batches.
          </p>
        </div>

        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/consumer/discover">
            Discover More Farms
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Following a farm alerts you 48 hours before freshly pressed seasonal harvests are made available on the public catalog.
      </DemoNotice>

      {/* Followed Farms List */}
      <div className="grid gap-6 md:grid-cols-2">
        {followedFarms.map((farm) => (
          <div key={farm.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/50">
            <div className="relative h-40 w-full bg-muted">
              <img src={farm.image} alt={farm.farmName} className="h-full w-full object-cover" />
              <div className="absolute top-2 right-2 rounded-full bg-background/90 p-1.5 backdrop-blur-xs text-rose-500">
                <Heart className="h-4 w-4 fill-current" />
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">{farm.farmName}</h3>
                  <TrustBadge type={farm.id.startsWith("fpo") ? "fpo" : "producer"} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">By {farm.farmerName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {farm.location}
                </p>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-semibold text-foreground">{farm.specialty}</p>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <Calendar className="h-3.5 w-3.5" /> Next Harvest Drop: {farm.nextHarvest} ({farm.upcomingCrop})
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                <button 
                  onClick={() => handleUnfollow(farm.id)}
                  className="text-muted-foreground hover:text-rose-600 transition-colors"
                >
                  Unfollow
                </button>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                    <Link href="/consumer/shop">
                      <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                      Shop Available
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
