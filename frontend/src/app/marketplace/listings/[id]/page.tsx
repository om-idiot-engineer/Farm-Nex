"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, ShieldCheck, Sprout } from "lucide-react";
import type { CropListing } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import { getMarketplaceListings, type DataSource } from "@/lib/services/domain";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import StatusBadge from "@/components/StatusBadge";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [listing, setListing] = useState<CropListing | null>(null);
  const [source, setSource] = useState<DataSource>("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadListing = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getMarketplaceListings();
      setListing(result.data.find((item) => item.id === id) || null);
      setSource(result.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not load this crop lot.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadListing(); }, [id]);

  if (loading) return <LoadingSkeleton variant="detail" />;
  if (error) return <div className="mx-auto max-w-4xl py-8"><ErrorState message={error} onRetry={loadListing} /></div>;
  if (!listing) return <div className="mx-auto max-w-4xl py-8"><EmptyState title="Lot not found" description="This listing may have been withdrawn or is no longer available." action="Back to marketplace" href="/marketplace" icon={Sprout} /></div>;

  const isOwner = user?.id === listing.farmer_id;
  return <div className="mx-auto max-w-4xl space-y-6 py-4">
    <Button variant="outline" size="sm" asChild><Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Marketplace</Link></Button>
    {source === "demo" && <DemoNotice>This crop lot is a demo or locally created browser record.</DemoNotice>}
    <article className="border border-border bg-card shadow-sm">
      <div className="flex flex-col justify-between gap-5 border-b border-border bg-primary/5 p-6 sm:flex-row sm:items-start"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Available crop lot</p><h1 className="mt-2 text-4xl font-black capitalize text-foreground">{listing.quantity}Q {listing.commodity}</h1><p className="mt-2 text-sm text-muted-foreground">{listing.quality_grade}{listing.moisture_percent ? ` · ${listing.moisture_percent}% moisture` : ""}</p></div><StatusBadge status={listing.status} className="self-start" /></div>
      <div className="grid gap-6 p-6 md:grid-cols-2"><section className="space-y-4"><h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">Lot details</h2><Detail label="Expected farm-gate rate" value={`₹${listing.expected_price.toLocaleString("en-IN")}/quintal`} /><Detail label="Pickup preference" value={listing.pickup_preference} /><Detail label="Payment preference" value={listing.payment_preference} /><p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" />Harvested {new Date(listing.harvest_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></section><section className="border-l-0 border-border md:border-l md:pl-6"><h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">Producer</h2><p className="mt-4 flex items-center gap-2 text-lg font-bold text-foreground">{listing.farmer_name || "Verified farmer"}<TrustBadge type="producer" /></p><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{listing.location}</p><p className="mt-5 text-sm leading-6 text-muted-foreground">Farm-level price is shown before transport. Smart Sell compares qualifying buyer offers by the estimated net realization after logistics.</p></section></div>
      <div className="border-t border-border p-6">{isOwner ? <Button asChild><Link href={`/farmer/smart-sell?listing_id=${listing.id}`}>Compare buyer offers</Link></Button> : <Button asChild><Link href="/messages">Ask about this lot</Link></Button>}</div>
    </article>
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-bold text-foreground">{value}</span></div>;
}
