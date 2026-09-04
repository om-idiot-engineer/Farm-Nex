"use client";

import type { TradeEarningsBreakdown } from "@/lib/api";

interface PaymentBreakdownProps {
  breakdown: TradeEarningsBreakdown;
  quantityQuintals: number;
  ratePerQuintal: number;
}

export default function PaymentBreakdown({
  breakdown,
  quantityQuintals,
  ratePerQuintal,
}: PaymentBreakdownProps) {
  const adjustments = 0;

  return (
    <div className="border border-border bg-card rounded-lg p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-black text-foreground">Financial Settlement Ledger</h3>
          <p className="text-xs text-muted-foreground">Transparent itemization of gross crop value minus contracted deductions.</p>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          Escrow Secured
        </span>
      </div>

      <div className="divide-y divide-border text-xs">
        {/* Gross produce */}
        <div className="py-2.5 flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">Gross Produce Value</p>
            <p className="text-[11px] text-muted-foreground">
              {quantityQuintals} Quintals × ₹{ratePerQuintal.toLocaleString("en-IN")}/q
            </p>
          </div>
          <span className="text-sm font-black text-foreground">
            ₹{breakdown.gross_produce_value.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Logistics */}
        <div className="py-2.5 flex items-center justify-between text-rose-700">
          <div>
            <p className="font-semibold">Logistics & Freight Deduction</p>
            <p className="text-[11px] text-muted-foreground">
              Transport freight managed and covered via buyer pickup contract
            </p>
          </div>
          <span className="text-sm font-bold">
            -₹{breakdown.logistics_cost_deduction.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Platform Fee */}
        <div className="py-2.5 flex items-center justify-between text-rose-700">
          <div>
            <p className="font-semibold">Platform Facilitation & Quality Assay</p>
            <p className="text-[11px] text-muted-foreground">
              Escrow payment settlement, digital contract execution & assay
            </p>
          </div>
          <span className="text-sm font-bold">
            -₹{breakdown.platform_fee.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Net Farmer Earnings */}
        <div className="py-3.5 flex items-center justify-between bg-emerald-50/70 -mx-5 px-5 rounded-b-lg border-t-2 border-emerald-600">
          <div>
            <p className="text-sm font-black text-emerald-950">Net Farmer Payout</p>
            <p className="text-[11px] text-emerald-800">
              Direct NEFT transfer to verified farmer bank account
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-emerald-800">
              ₹{breakdown.net_farmer_earnings.toLocaleString("en-IN")}
            </span>
            <p className="text-[10px] text-muted-foreground font-semibold">
              (₹{Math.round(breakdown.net_farmer_earnings / quantityQuintals).toLocaleString("en-IN")}/q net)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
