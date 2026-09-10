"use client";

import React from "react";
import { ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface ReliabilityScore {
  role: "farmer" | "buyer";
  total_transactions: number;
  successful_transactions: number;
  quality_consistency_percent?: number;
  payment_reliability_percent?: number;
  average_rating: number;
  verification_status: boolean;
}

interface ReliabilityScoreCardProps {
  score: ReliabilityScore;
  className?: string;
  compact?: boolean;
}

export function ReliabilityScoreCard({ score, className, compact = false }: ReliabilityScoreCardProps) {
  const { t, language } = useLanguage();

  const isNew = score.total_transactions === 0;
  const successRate = score.total_transactions > 0
    ? Math.round((score.successful_transactions / score.total_transactions) * 100)
    : 0;

  // Determine tier
  let tierName = language === 'hi' ? "नया सदस्य" : "New Member";
  let tierColor = "bg-muted text-muted-foreground";

  if (!isNew) {
    if (successRate >= 95 && score.average_rating >= 4.5 && score.verification_status) {
      tierName = language === 'hi' ? "एलीट" : "Elite";
      tierColor = "bg-brand-100 text-brand-700 border-brand-200";
    } else if (successRate >= 90 && score.average_rating >= 4.0) {
      tierName = language === 'hi' ? "विश्वसनीय" : "Trusted";
      tierColor = "bg-brand-50 text-brand-600 border-brand-100";
    } else if (successRate >= 80) {
      tierName = language === 'hi' ? "भरोसेमंद" : "Reliable";
      tierColor = "bg-earth-100 text-earth-700 border-earth-200";
    } else {
      tierName = language === 'hi' ? "साधारण" : "Standard";
      tierColor = "bg-muted text-muted-foreground";
    }
  }

  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border", tierColor, className)}>
        {score.verification_status && <ShieldCheck className="h-3.5 w-3.5" />}
        {tierName}
        {!isNew && (
          <span className="flex items-center ml-1 opacity-80">
            <Star className="h-3 w-3 fill-current mr-0.5" />
            {score.average_rating.toFixed(1)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-foreground">
            {score.role === "farmer"
              ? (language === 'hi' ? "किसान विश्वसनीयता" : "Farmer Reliability")
              : (language === 'hi' ? "खरीदार विश्वसनीयता" : "Buyer Reliability")}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border", tierColor)}>
              {tierName}
            </span>
            {score.verification_status && (
              <span className="inline-flex items-center text-xs text-brand-600 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                {language === 'hi' ? "सत्यापित" : "Verified"}
              </span>
            )}
          </div>
        </div>
        {!isNew && (
          <div className="flex flex-col items-end">
            <div className="flex items-center text-amber-500 font-bold text-lg">
              <Star className="h-5 w-5 fill-current mr-1" />
              {score.average_rating.toFixed(1)}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {language === 'hi' ? "रेटिंग" : "Rating"}
            </span>
          </div>
        )}
      </div>

      {isNew ? (
        <div className="py-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-md">
          {language === 'hi'
            ? "अभी तक कोई लेनदेन नहीं हुआ है।"
            : "No transaction history yet."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-4 pt-4 border-t">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{language === 'hi' ? "लेनदेन" : "Transactions"}:</span>
            <span className="font-medium">{score.total_transactions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{language === 'hi' ? "सफल" : "Successful"}:</span>
            <span className="font-medium text-brand-600">{score.successful_transactions} ({successRate}%)</span>
          </div>

          {score.role === "farmer" && score.quality_consistency_percent !== undefined && (
            <div className="flex justify-between col-span-2 mt-1">
              <span className="text-muted-foreground">{language === 'hi' ? "गुणवत्ता स्थिरता" : "Quality consistency"}:</span>
              <span className="font-medium">{score.quality_consistency_percent}%</span>
            </div>
          )}

          {score.role === "buyer" && score.payment_reliability_percent !== undefined && (
            <div className="flex justify-between col-span-2 mt-1">
              <span className="text-muted-foreground">{language === 'hi' ? "भुगतान विश्वसनीयता" : "Payment reliability"}:</span>
              <span className="font-medium">{score.payment_reliability_percent}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
