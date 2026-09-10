"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sprout,
  Plus,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Scale,
  Building2,
  TrendingUp,
  PauseCircle,
  XCircle,
  Share2,
  Edit,
  SlidersHorizontal,
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getFarmerListings, removeListing, type DataSource } from "@/lib/services/domain";
import type { CropListing } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import DemoNotice from "@/components/DemoNotice";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";

export default function MyProduceWorkspacePage() {
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["farmer"]);
  const [listings, setListings] = useState<CropListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [source, setSource] = useState<DataSource>("api");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const loadListings = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getFarmerListings();
      setListings(res.data);
      setSource(res.source);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load produce lots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !hasAccess) return;
    loadListings();
  }, [hasAccess, user]);

  const handleCloseListing = async (id: string) => {
    if (!confirm("Are you sure you want to close this lot from the marketplace?")) return;
    await removeListing(id);
    loadListings();
  };

  if (userLoading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  const filtered = statusFilter === "all" ? listings : listings.filter((l) => l.status === statusFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
              <Sprout className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Produce Lot Management
            </span>
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">My Harvested Produce</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor lot quality assays, compare buyer matches, and control active market availability.
          </p>
        </div>

        <Button asChild className="font-bold shrink-0 shadow-sm">
          <Link href="/farmer/produce/new">
            <Plus className="h-4 w-4 mr-1.5" />
            List New Crop Lot
          </Link>
        </Button>
      </div>

      {source === "demo" && (
        <DemoNotice>
          Produce lots listed here reflect your local browser session and demo data.
        </DemoNotice>
      )}

      {errorMsg && <ErrorState message={errorMsg} onRetry={loadListings} />}

      {/* Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          {["all", "listed", "matched"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {st === "all" ? "All Lots" : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">View:</span>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              viewMode === "cards" ? "bg-muted font-bold text-foreground" : "text-muted-foreground"
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              viewMode === "table" ? "bg-muted font-bold text-foreground" : "text-muted-foreground"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton variant="card" rows={3} />
      ) : filtered.length ? (
        viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lot) => {
              const marketBenchmark = lot.crop_id === "soybean" ? 5420 : 2385;
              const estNetRealization = lot.crop_id === "soybean" ? 5233 : 2320;

              return (
                <article
                  key={lot.id}
                  className="border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Lot #{lot.id.slice(0, 10)}
                        </span>
                        <h2 className="text-2xl font-black capitalize text-foreground mt-0.5">
                          {lot.quantity}Q {lot.crop_id}
                        </h2>
                      </div>
                      <StatusBadge status={lot.status} size="sm" />
                    </div>

                    <div className="bg-muted/20 border border-border rounded-lg p-3 grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Assay Grade</span>
                        <span className="font-bold text-foreground">{lot.quality_grade}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Moisture</span>
                        <span className="font-bold text-foreground">{lot.moisture_percent || 11.2}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Asking Rate</span>
                        <span className="font-black text-foreground">₹{lot.expected_price.toLocaleString("en-IN")}/q</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[10px] uppercase font-bold block">Benchmark</span>
                        <span className="font-bold text-foreground">₹{marketBenchmark.toLocaleString("en-IN")}/q</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-emerald-900 block">
                          Best Est. Net Realization
                        </span>
                        <span className="text-lg font-black text-emerald-800">
                          ₹{estNetRealization.toLocaleString("en-IN")}/q
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                        3 Matches
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground mt-3">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{lot.location}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-primary shrink-0" />
                        <span>Harvested: {lot.harvest_date}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.origin + `/marketplace/listings/${lot.id}`);
                        alert("Lot link copied to clipboard!");
                      }}
                      className="text-xs h-8"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" asChild className="text-xs h-8">
                        <Link href={`/farmer/produce/new?edit=${lot.id}`}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button size="sm" className="text-xs font-bold h-8" asChild>
                        <Link href={`/farmer/buyers?listing_id=${lot.id}`}>
                          Compare Buyers
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-border bg-card rounded-lg overflow-x-auto shadow-sm">
            <table className="w-full min-w-[50rem] text-left text-xs">
              <thead className="bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Lot ID & Crop</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3">Assay & Moisture</th>
                  <th className="px-4 py-3 text-right">Asking Rate</th>
                  <th className="px-4 py-3 text-right text-emerald-800 font-bold">Best Net Realization</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((lot) => (
                  <tr key={lot.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground capitalize">
                        {lot.crop_id}
                      </p>
                      <span className="text-[10px] text-muted-foreground">#{lot.id.slice(0, 10)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-foreground">
                      {lot.quantity} Quintals
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {lot.quality_grade} · {lot.moisture_percent || 11.2}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold">
                      ₹{lot.expected_price.toLocaleString("en-IN")}/q
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-800 text-sm">
                      ₹5,233/q
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={lot.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button size="sm" asChild className="text-xs h-7 font-bold">
                        <Link href={`/farmer/buyers?listing_id=${lot.id}`}>Compare</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <EmptyState
          title="No produce lots listed"
          description="List your harvested soybean, wheat, or cotton to start receiving transparent buyer bids."
          action="List First Crop Lot"
          href="/farmer/produce/new"
          icon={Sprout}
        />
      )}
    </div>
  );
}
