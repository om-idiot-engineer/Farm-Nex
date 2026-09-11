"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, MapPin, Scale } from "lucide-react";
import type { DemandPost } from "@/lib/api";
import { useUser } from "@/lib/auth/UserContext";
import { getDemandPosts, getUserReliabilityScore, type DataSource } from "@/lib/services/domain";
import { ReliabilityScore } from "@/components/ReliabilityScoreCard";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

export default function RequirementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [demand, setDemand] = useState<DemandPost | null>(null);
  const [source, setSource] = useState<DataSource>("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [score, setScore] = useState<ReliabilityScore | undefined>(undefined);

  const loadRequirement = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getDemandPosts();

      const d = result.data.find((item) => item.id === id) || null;
      setDemand(d);
      setSource(result.source);
      if (d) {
        const s = await getUserReliabilityScore(d.buyer_id);
        setScore(s);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not load this buyer requirement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequirement();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSkeleton variant="detail" />;
  if (error) return <div className="mx-auto max-w-4xl py-8"><ErrorState message={error} onRetry={loadRequirement} /></div>;
  if (!demand) return <div className="mx-auto max-w-4xl py-8"><EmptyState title="Requirement not found" description="This buyer requirement may have been closed or is no longer available." action="Back to marketplace" href="/marketplace" icon={Building2} /></div>;

  const isOwner = user?.id === demand.buyer_id;
  return <div className="mx-auto max-w-4xl space-y-6 py-4">
    <Button variant="outline" size="sm" asChild><Link href="/marketplace"><ArrowLeft className="mr-2 h-4 w-4" />Marketplace</Link></Button>
    {source === "demo" && <DemoNotice>This buyer requirement is a demo or locally created browser record.</DemoNotice>}
    <article className="border border-border bg-card shadow-sm"><div className="flex flex-col justify-between gap-5 border-b border-border bg-info/5 p-6 sm:flex-row sm:items-start"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-info">Open buyer requirement</p><h1 className="mt-2 text-4xl font-black capitalize text-foreground">{demand.quantity_needed}Q {demand.crop_id}</h1><p className="mt-2 text-sm text-muted-foreground">{demand.quality_grade}{demand.moisture_max ? ` · up to ${demand.moisture_max}% moisture` : ""}</p></div><span className="border border-info/20 bg-info/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-info">Open</span></div><div className="grid gap-6 p-6 md:grid-cols-2"><section className="space-y-4"><h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">Commercial terms</h2><Detail label="Maximum offer" value={`₹${demand.offered_price.toLocaleString("en-IN")}/quintal`} /><Detail label="Payment terms" value={demand.payment_terms} /><Detail label="Required quantity" value={`${demand.quantity_needed} quintals`} /></section><section className="border-l-0 border-border md:border-l md:pl-6"><h2 className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">Buyer and destination</h2><p className="mt-4 flex items-center gap-2 text-lg font-bold text-foreground"><Link href={`/profile/${demand.buyer_id}`} className="hover:underline hover:text-primary">{demand.business_name || demand.buyer_name || "Verified buyer"}</Link><TrustBadge type="buyer" score={score} /></p><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-info" />{demand.location}</p><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Scale className="h-4 w-4 text-info" />Rate is subject to accepted quality and weighment.</p></section></div><div className="border-t border-border p-6">{isOwner ? <Button asChild><Link href="/buyer">Manage requirement</Link></Button> : <Button asChild><Link href="/messages">Contact buyer</Link></Button>}</div></article>
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-border pb-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-bold text-foreground">{value}</span></div>;
}
