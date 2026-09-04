"use client";

import { MapPin, Phone, AlertCircle } from "lucide-react";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";

interface LogisticsPanelProps {
  agreement: ExtendedTradeAgreement;
}

export default function LogisticsPanel({ agreement }: LogisticsPanelProps) {
  return (
    <div className="border border-border bg-card rounded-lg p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-base font-black text-foreground">Consignment Logistics & Transit</h3>
          <p className="text-xs text-muted-foreground">Carrier allocation, route distance, and loading schedule.</p>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          Buyer Pickup Dispatched
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Origin */}
        <div className="border border-border p-4 rounded-lg bg-muted/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" /> Origin (Farm Gate)
          </span>
          <p className="text-sm font-bold text-foreground">{agreement.pickupLocation || "Ramesh Patel Farm, Sanwer, MP"}</p>
          <p className="text-xs text-muted-foreground">Coordinates verified via farm geotag</p>
        </div>

        {/* Destination */}
        <div className="border border-border p-4 rounded-lg bg-muted/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center gap-1">
            <MapPin className="h-3 w-3 text-blue-600" /> Destination (Processing Mill)
          </span>
          <p className="text-sm font-bold text-foreground">{agreement.deliveryDestination || "Dewas Industrial Area, MP"}</p>
          <p className="text-xs text-muted-foreground">Unloading Bay #3 · Agrocorp Mill Gate</p>
        </div>
      </div>

      {/* Vehicle & Driver Details */}
      <div className="grid sm:grid-cols-3 gap-4 text-xs bg-muted/20 border border-border p-4 rounded-lg">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Assigned Transporter</span>
          <p className="font-bold text-foreground mt-0.5">{agreement.transporterName || "Malwa Freight Logistics"}</p>
          <span className="text-[11px] text-muted-foreground">Commercial permit active</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Vehicle Registration</span>
          <p className="font-bold text-foreground mt-0.5">{agreement.vehicleNumber || "MP-09-GH-8214"}</p>
          <span className="text-[11px] text-muted-foreground">12-Wheel Heavy Vehicle</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Assigned Driver</span>
          <p className="font-bold text-foreground mt-0.5">{agreement.driverName || "Dharmendra Yadav"}</p>
          {agreement.driverPhone && (
            <a
              href={`tel:${agreement.driverPhone}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-0.5"
            >
              <Phone className="h-3 w-3" />
              {agreement.driverPhone}
            </a>
          )}
        </div>
      </div>

      {/* Honest Non-Live Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Informative Milestone Tracking</p>
          <p className="text-[11px] text-amber-800/90 leading-relaxed mt-0.5">
            FarmNex updates consignment progress using digital weighbridge slips and gate-entry confirmation logs. Live telemetry GPS tracking is not simulated to ensure operational honesty.
          </p>
        </div>
      </div>
    </div>
  );
}
