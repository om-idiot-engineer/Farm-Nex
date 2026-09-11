"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { getVerificationQueue, decideVerification } from "@/lib/services/domain";
import { getDataSourceLabel } from "@/lib/services/domain";

export default function AdminVerificationQueuePage() {
  const { user, loading, hasAccess } = useRequiredUser(["admin"]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [source, setSource] = useState("");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const res = await getVerificationQueue();
        setRequests(res.data);
        setSource(getDataSourceLabel(res.source));
      } catch (err) {
        console.error("Failed to load queue:", err);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [user]);

  const handleDecision = async (id: string, status: string) => {
    try {
      await decideVerification(id, status, "Reviewed by admin");
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed decision:", err);
      alert("Failed to process decision");
    }
  };

  if (loading || !user || !hasAccess) return <LoadingSkeleton variant="detail" />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Operations Hub
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Trust & Verification Queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve pending verification requests.
          </p>
        </div>
      </div>

      <DemoNotice>{source} powering this queue.</DemoNotice>

      {loadingData ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading queue...</div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No pending verification requests.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Document Type</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">{req.document_type}</h3>
                <p className="text-xs text-muted-foreground mt-1">User: {req.user_id}</p>
                <Link href={req.document_url} target="_blank" className="text-blue-500 hover:underline text-sm mt-2 block">
                  View Document
                </Link>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button size="sm" onClick={() => handleDecision(req.id, "approved")} className="bg-emerald-600 text-white hover:bg-emerald-700 w-full">
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" onClick={() => handleDecision(req.id, "rejected")} variant="destructive" className="w-full">
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
