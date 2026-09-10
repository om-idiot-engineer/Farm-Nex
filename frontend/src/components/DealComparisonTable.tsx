"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Truck, ArrowRight } from "lucide-react";
import type { BuyerMatchOpportunity } from "@/lib/api";
import TrustBadge from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";

interface DealComparisonTableProps {
  opportunities: BuyerMatchOpportunity[];
  onSelectDeal: (opp: BuyerMatchOpportunity) => void;
}

export default function DealComparisonTable({
  opportunities,
  onSelectDeal,
}: DealComparisonTableProps) {
  const [matrixMode, setMatrixMode] = useState<"matrix" | "ledger">("matrix");

  return (
    <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <h3 className="text-base font-black text-foreground">Compare Qualified Suppliers & Offers</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional side-by-side comparison across Price, Quality, Proximity, and Fulfillment Reliability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/40 p-1 rounded-lg border border-border text-xs font-bold">
            <button
              type="button"
              onClick={() => setMatrixMode("matrix")}
              className={`px-3 py-1 rounded-md transition-colors ${
                matrixMode === "matrix" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Side-by-Side Matrix
            </button>
            <button
              type="button"
              onClick={() => setMatrixMode("ledger")}
              className={`px-3 py-1 rounded-md transition-colors ${
                matrixMode === "ledger" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ledger Table
            </button>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border/60">
            {opportunities.length} Matched
          </span>
        </div>
      </div>

      {matrixMode === "matrix" ? (
        /* SIDE-BY-SIDE MATRIX VIEW (Section 19) */
        <div className="overflow-x-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[45rem]">
            {opportunities.slice(0, 3).map((opp, idx) => {
              const isTop = idx === 0;
              return (
                <div
                  key={opp.match_id || idx}
                  className={`rounded-2xl border p-5 flex flex-col justify-between space-y-5 transition-all ${
                    isTop
                      ? "border-primary bg-primary/[0.02] shadow-sm ring-1 ring-primary/20"
                      : "border-border bg-card shadow-2xs"
                  }`}
                >
                  <div>
                    {/* Top Identity */}
                    <div className="flex items-start justify-between gap-2 border-b border-border/80 pb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                            isTop ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            #{idx + 1}
                          </span>
                          <h4 className="font-black text-sm text-foreground truncate max-w-[170px]">
                            {opp.business_name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {opp.distance_km} km distance
                        </p>
                      </div>
                      {isTop && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase shrink-0">
                          Top Fit
                        </span>
                      )}
                    </div>

                    {/* Matrix Rows (Section 19: Price, Quantity, Quality, Distance, Availability, Verification, Reliability, Delivery, Payment terms) */}
                    <div className="divide-y divide-border/60 text-xs py-2 space-y-0.5">
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Price / Quintal</span>
                        <span className="font-black text-primary text-sm">₹{opp.offered_price_per_quintal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Quantity Matched</span>
                        <span className="font-bold text-foreground">{opp.quantity_matched} Quintals</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Assay Quality</span>
                        <span className="font-bold text-foreground">Grade A (10.4% M)</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Proximity Distance</span>
                        <span className="font-medium text-foreground">{opp.distance_km} km (Indore Hub)</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Availability</span>
                        <span className="font-bold text-emerald-800">Ready in 48h</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Verification</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> FPO Certified
                        </span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Past Reliability</span>
                        <span className="font-black text-foreground">{idx === 0 ? "98%" : idx === 1 ? "93%" : "89%"}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Delivery / Transport</span>
                        <span className="font-medium text-foreground">Farm-gate Pickup</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-muted-foreground text-[11px]">Payment Terms</span>
                        <span className="font-medium text-foreground">100% Escrow on Gate-In</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => onSelectDeal(opp)}
                    className={`w-full font-bold text-xs h-9 shadow-xs ${isTop ? "bg-primary text-primary-foreground" : ""}`}
                    variant={isTop ? "default" : "outline"}
                  >
                    {isTop ? "Lock Preferred Supplier" : "Select This Supplier"}
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE RESPONSIVE CARD VIEW (< md) */}
          <div className="md:hidden divide-y divide-border">
        {opportunities.map((opp, idx) => {
          const isFirst = idx === 0;
          return (
            <div
              key={opp.match_id}
              className={`p-4 space-y-3 transition-colors ${
                isFirst ? "bg-primary/[0.04]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black shrink-0 ${
                      isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <Link
                      href={`/profile/${opp.buyer_id}`}
                      className="font-black text-sm text-foreground hover:text-primary"
                    >
                      {opp.business_name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {opp.distance_km} km away · Farm-gate pickup
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Net in Pocket
                  </span>
                  <p className="text-base font-black text-emerald-800">
                    ₹{opp.net_realization_per_quintal.toLocaleString("en-IN")}<span className="text-[10px] font-normal text-muted-foreground">/q</span>
                  </p>
                </div>
              </div>

              {/* Deductions row */}
              <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2.5 rounded-lg text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Buyer Offer</span>
                  <span className="font-bold text-foreground">₹{opp.offered_price_per_quintal.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Freight</span>
                  <span className="font-bold text-rose-700">-₹{opp.estimated_logistics_per_quintal}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Total Payout</span>
                  <span className="font-black text-primary">₹{opp.net_total_realization.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Payment within 24h · 100% Escrow
                </span>
                <Button
                  size="sm"
                  variant={isFirst ? "default" : "outline"}
                  onClick={() => onSelectDeal(opp)}
                  className="font-bold text-xs h-8"
                >
                  {isFirst ? "Accept Top Deal" : "Select Deal"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[55rem] text-left text-xs">
          <thead className="bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3">Rank & Buyer</th>
              <th className="px-4 py-3 text-right">Offer Rate</th>
              <th className="px-4 py-3 text-right">Est. Freight</th>
              <th className="px-4 py-3 text-right">Other Cost</th>
              <th className="px-4 py-3 text-right font-bold text-emerald-800">Net / Q</th>
              <th className="px-4 py-3 text-right font-bold text-foreground">Total Net</th>
              <th className="px-4 py-3 text-center">Distance</th>
              <th className="px-4 py-3 text-center">Pickup</th>
              <th className="px-4 py-3 text-center">Payment</th>
              <th className="px-4 py-3 text-center">Reliability</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {opportunities.map((opp, idx) => {
              const isFirst = idx === 0;
              return (
                <tr
                  key={opp.match_id}
                  className={`transition-colors ${
                    isFirst ? "bg-primary/[0.03] font-medium" : "hover:bg-muted/20"
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shrink-0 ${
                          isFirst ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <Link
                          href={`/profile/${opp.buyer_id}`}
                          className="font-bold text-foreground hover:text-primary block truncate max-w-[180px]"
                        >
                          {opp.business_name}
                        </Link>
                        {opp.buyer_verified && (
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold">
                    ₹{opp.offered_price_per_quintal.toLocaleString("en-IN")}/q
                  </td>
                  <td className="px-4 py-3.5 text-right text-rose-700 font-semibold">
                    -₹{opp.estimated_logistics_per_quintal}
                  </td>
                  <td className="px-4 py-3.5 text-right text-rose-700">
                    -₹35
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-emerald-800 text-sm">
                    ₹{opp.net_realization_per_quintal.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-foreground">
                    ₹{opp.net_total_realization.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3.5 text-center text-muted-foreground">
                    {opp.distance_km} km
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      <Truck className="h-3 w-3" /> Available
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center text-muted-foreground text-[11px]">
                    Within 24h
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-bold text-foreground">{idx === 0 ? "98%" : idx === 1 ? "92%" : "88%"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant={isFirst ? "default" : "outline"}
                      onClick={() => onSelectDeal(opp)}
                      className="text-xs h-8 font-bold"
                    >
                      {isFirst ? "Accept Deal" : "Select"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  )}
    </div>
  );
}
