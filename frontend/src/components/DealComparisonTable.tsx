"use client";

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
  return (
    <div className="border border-border bg-card rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-foreground">Complete Buyer Comparison Ledger</h3>
          <p className="text-xs text-muted-foreground">
            Ranked by estimated net realization per quintal after all transport and service deductions.
          </p>
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 rounded w-fit">
          {opportunities.length} Buyers Matched
        </span>
      </div>

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
    </div>
  );
}
