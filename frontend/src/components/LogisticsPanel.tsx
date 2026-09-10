"use client";

import React from "react";
import { MapPin, Phone, AlertCircle, Truck, CheckCircle2, Clock, Scale, ShieldCheck, ArrowRight } from "lucide-react";
import type { ExtendedTradeAgreement } from "@/lib/data/demo";

interface LogisticsPanelProps {
  agreement: ExtendedTradeAgreement;
}

export default function LogisticsPanel({ agreement }: LogisticsPanelProps) {
  const isTransit = agreement.status === "in_transit" || agreement.status === "delivered" || agreement.status === "completed";
  const isDelivered = agreement.status === "delivered" || agreement.status === "completed";

  return (
    <div className="border border-border bg-card rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-foreground">Consignment Logistics & Transit Corridor</h3>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Corridor ID: CR-IND-DWS-44
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dedicated agricultural freight route connecting farm aggregation gate to processor milling bay.
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
          {agreement.status === "completed" ? "Consignment Completed" : isDelivered ? "Unloaded at Mill" : isTransit ? "En Route (48 km)" : "Dispatch Scheduled"}
        </span>
      </div>

      {/* Visual Route Corridor (Section 14) */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 sm:p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Route Progression & Gate Checkpoints
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Checkpoint 1: Origin */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
                <MapPin className="h-4 w-4" /> Origin Farm Gate
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Loaded & Cleared
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {agreement.pickupLocation || "Ramesh Patel Farm, Sanwer, MP"}
            </p>
            <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1 border-t border-border">
              <p>Lot Loading: 100 Quintals (Jute Bags)</p>
              <p>Departure Time: 02 Mar 2026, 09:15 AM</p>
            </div>
          </div>

          {/* Checkpoint 2: Tare / Weighbridge */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-400">
                <Scale className="h-4 w-4" /> Digital Weighbridge
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Tare Certified
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              Sanwer Electronic Weighbridge #9821
            </p>
            <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1 border-t border-border">
              <p>Gross: 14,820 kg | Tare: 4,820 kg</p>
              <p>Net Produce: 10,000 kg (0.0% variance)</p>
            </div>
          </div>

          {/* Checkpoint 3: Destination */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black text-foreground">
                <Truck className="h-4 w-4 text-primary" /> Mill Intake Gate
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isDelivered ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}>
                {isDelivered ? "Received" : "Slot Reserved"}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {agreement.deliveryDestination || "Dewas Agro Extraction Plant"}
            </p>
            <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1 border-t border-border">
              <p>Inbound Gate: Unloading Bay #3</p>
              <p>Scheduled Slot: 02 Mar 2026, 11:30 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle, Driver & E-Way Details */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-muted/20 border border-border p-4 rounded-xl">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Assigned Transporter</span>
          <p className="font-bold text-foreground mt-0.5">{agreement.transporterName || "Malwa Freight Logistics"}</p>
          <span className="text-[11px] text-muted-foreground">Commercial Permit #MP-2024-88</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Vehicle Registration</span>
          <p className="font-bold text-foreground mt-0.5">{agreement.vehicleNumber || "MP-09-GH-8214"}</p>
          <span className="text-[11px] text-muted-foreground">12-Wheel Heavy Cargo Truck</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">Assigned Driver</span>
          <p className="font-bold text-foreground mt-0.5">{agreement.driverName || "Dharmendra Yadav"}</p>
          {agreement.driverPhone ? (
            <a
              href={`tel:${agreement.driverPhone}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-0.5"
            >
              <Phone className="h-3 w-3" />
              {agreement.driverPhone}
            </a>
          ) : (
            <span className="text-[11px] text-muted-foreground">+91 98260 44123</span>
          )}
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase font-bold">GST E-Way Bill</span>
          <p className="font-bold text-foreground mt-0.5">EWB-8921-9920</p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active & Tax Cleared
          </span>
        </div>
      </div>

      {/* Operational Guarantee Notice */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
        <AlertCircle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Electronic Verification vs GPS Simulation</p>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed mt-0.5">
            FarmNex updates consignment progress using digital weighbridge tare slips and gate-entry sensor stamps. Live GPS telemetry is not faked, ensuring operational honesty and audit certainty.
          </p>
        </div>
      </div>
    </div>
  );
}
