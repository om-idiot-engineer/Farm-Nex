"use client";

import React, { useEffect, useState } from "react";
import { getHeatmapData } from "@/lib/services/domain";
import { Map, MapPin } from "lucide-react";

interface HeatmapNode {
  location: string;
  lat: number;
  lng: number;
  listings: number;
  demands: number;
}

export default function HeatmapWidget() {
  const [data, setData] = useState<HeatmapNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getHeatmapData();
      setData(res);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="h-64 animate-pulse bg-muted rounded-xl"></div>;
  }

  // Calculate intensities
  const maxActivity = Math.max(...data.map(d => d.listings + d.demands), 1);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary/10 p-2 rounded-md">
          <Map className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground leading-tight">National Activity Heatmap</h3>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Supply & Demand Density</p>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No activity data available.</p>
        ) : (
          data.map((node, i) => {
            const total = node.listings + node.demands;
            const intensity = (total / maxActivity) * 100;
            return (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs items-center">
                  <span className="font-bold flex items-center gap-1 text-foreground">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {node.location}
                  </span>
                  <span className="text-muted-foreground font-semibold">
                    <span className="text-emerald-600 font-bold">{node.listings} Supply</span>
                    {" · "}
                    <span className="text-blue-600 font-bold">{node.demands} Demand</span>
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full"
                    style={{ width: `${(node.listings / total) * intensity}%` }}
                  />
                  <div
                    className="h-full bg-blue-500 rounded-r-full"
                    style={{ width: `${(node.demands / total) * intensity}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
