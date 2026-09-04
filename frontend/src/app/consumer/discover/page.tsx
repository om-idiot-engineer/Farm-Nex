"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Leaf, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Heart, 
  Share2, 
  Sparkles, 
  QrCode, 
  ExternalLink,
  Users,
  Award,
  BookOpen
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function ConsumerDiscoverFarmsPage() {
  const { user, loading } = useRequiredUser(["consumer", "admin", "farmer", "buyer", "fpo"]);
  const [following, setFollowing] = useState<Record<string, boolean>>({ "farmer-ramesh": true });

  if (loading) {
    return <LoadingSkeleton variant="detail" />;
  }

  const toggleFollow = (id: string) => {
    setFollowing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const farmStories = [
    {
      id: "farmer-ramesh",
      producerId: "usr-farmer-01",
      farmName: "Vedic Soil Naturals",
      farmerName: "Ramesh Patel",
      location: "Sanwer, Indore District, MP",
      specialty: "Single-Origin Sharbati Wheat & Cold-Pressed Mustard Oil",
      acres: "12.5 Acres Multi-Cropping",
      practice: "Natural Farming (Jeevamrutha, Zero Synthetic Pesticides)",
      story: "For three generations, our family tended the black cotton soils of Malwa without chemical urea. We harvest our wheat at peak kernel hardness and mill it slowly on traditional stone grinders to preserve natural germ oils and wheatgrass nutrients.",
      image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
      harvestDate: "February 2026",
      batchCode: "BATCH-VEC-2026-08",
      labReport: "Certified 0.00% Heavy Metal / Organophosphate residue by NABL Accredited Lab."
    },
    {
      id: "fpo-malwa",
      producerId: "demo-fpo",
      farmName: "Malwa Organic Pulses Collective",
      farmerName: "Sunita Verma & 38 Member Women Farmers",
      location: "Depalpur, MP",
      specialty: "Unpolished Desi Chana & Native Tur Dal",
      acres: "140 Acres Pooled Bio-Farm",
      practice: "Regenerative Agroforestry & Rainwater Harvesting",
      story: "Our women-led collective pools indigenous seed varieties handed down through generations. By cultivating nitrogen-fixing pulses alongside wild coriander, we maintain live soil mycorrhizae without requiring artificial nitrogen.",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
      harvestDate: "January 2026",
      batchCode: "BATCH-MOP-2026-03",
      labReport: "Tested for aflatoxins and water retention: 100% pure food grade."
    }
  ];

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
            Grower Origin Stories & Soil Chronicles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Meet the actual farmers and collective families producing your everyday pantry staples with verified chemical-free certifications.
          </p>
        </div>

        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/consumer/shop">
            Shop From These Farms
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Every farm profile features auditable geo-tagged soil test reports, harvest diary journals, and direct-to-farmer compensation transparency.
      </DemoNotice>

      {/* Farm Stories */}
      <div className="space-y-8">
        {farmStories.map((farm) => (
          <div key={farm.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/50">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Image side */}
              <div className="relative min-h-[280px] bg-muted lg:min-h-full">
                <img 
                  src={farm.image} 
                  alt={farm.farmName} 
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                  {farm.practice}
                </div>
              </div>

              {/* Story Content side */}
              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Verified Farm</span>
                        <TrustBadge type={farm.id.startsWith("fpo") ? "fpo" : "producer"} size="sm" />
                      </div>
                      <h2 className="text-2xl font-black text-foreground mt-1">{farm.farmName}</h2>
                      <p className="text-sm font-semibold text-foreground/90">By {farm.farmerName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-primary" /> {farm.location} · {farm.acres}
                      </p>
                    </div>

                    <Button
                      variant={following[farm.id] ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFollow(farm.id)}
                      className="text-xs shrink-0"
                    >
                      <Heart className={`mr-1.5 h-3.5 w-3.5 ${following[farm.id] ? "fill-current" : ""}`} />
                      {following[farm.id] ? "Following Farm" : "Follow Farm"}
                    </Button>
                  </div>

                  <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-foreground/90">
                    <p className="font-semibold text-primary mb-1">Our Cultivation Philosophy:</p>
                    &ldquo;{farm.story}&rdquo;
                  </div>

                  {/* Traceability Highlights */}
                  <div className="mt-4 space-y-2 rounded-lg border border-border/70 p-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <QrCode className="h-3.5 w-3.5 text-primary" /> Traceability Code:
                      </span>
                      <strong className="font-mono text-foreground">{farm.batchCode}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Harvest Period:</span>
                      <strong className="text-foreground">{farm.harvestDate}</strong>
                    </div>
                    <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                      <span className="font-bold text-foreground">Lab Purity Result: </span>
                      {farm.labReport}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                    <Link href={`/consumer/shop`}>
                      Order From {farm.farmName}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/profile/${farm.producerId}`}>
                      Full Grower Profile <ExternalLink className="ml-1.5 h-3 w-3" />
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
