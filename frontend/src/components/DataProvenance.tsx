"use client";

import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { formatDistanceToNow } from "date-fns";

interface DataProvenanceProps {
  source: string;
  updatedAt: string | Date;
  region?: string;
  className?: string;
}

export function DataProvenance({ source, updatedAt, region, className }: DataProvenanceProps) {
  const { t } = useLanguage();

  const parsedDate = new Date(updatedAt);
  const isStale = Date.now() - parsedDate.getTime() > 3 * 24 * 60 * 60 * 1000; // > 3 days
  const isRecent = Date.now() - parsedDate.getTime() < 24 * 60 * 60 * 1000; // < 1 day

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs text-muted-foreground border-t pt-2 mt-2", className)}>
      <div className="flex items-center gap-1">
        <span className={cn("flex h-2 w-2 rounded-full", isRecent ? "bg-green-500" : isStale ? "bg-gray-400" : "bg-amber-500")} />
        <span className="font-medium text-foreground/80">{source}</span>
      </div>
      <span>&middot;</span>
      <span>{t("updated") || "Updated"} {formatDistanceToNow(parsedDate, { addSuffix: true })}</span>
      {region && (
        <>
          <span>&middot;</span>
          <span className="truncate max-w-[120px]">{region}</span>
        </>
      )}
    </div>
  );
}
