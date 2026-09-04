"use client";

import React from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Download, 
  QrCode,
  Package,
  ArrowRight
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getConsumerOrders } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function ConsumerOrdersPage() {
  const { user, loading } = useRequiredUser(["consumer", "admin", "farmer", "buyer", "fpo"]);
  const ordersResult = getConsumerOrders();

  if (loading) {
    return <LoadingSkeleton variant="detail" />;
  }

  const orders = ordersResult.data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/consumer" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Fresh Market
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            My Farm-Direct Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track packages from the harvest origin to your doorstep, view batch traceability certificates, and review previous orders.
          </p>
        </div>

        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/consumer/shop">
            Shop More Harvests
          </Link>
        </Button>
      </div>

      <DemoNotice>
        Orders show real-time fulfillment stages: Confirmed → Harvest Packed → In Transit → Delivered.
      </DemoNotice>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-bold text-foreground">No orders placed yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Discover fresh cold-pressed oils and stone-ground grains.</p>
            <Button asChild size="sm" className="mt-4 bg-primary text-primary-foreground text-xs">
              <Link href="/consumer/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Order #{order.id}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{order.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Grown by <strong className="text-foreground">{order.producerName}</strong> ({order.origin})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    order.status === "delivered" 
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  }`}>
                    {order.status === "delivered" ? <CheckCircle2 className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-base font-black text-foreground">₹{order.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {item.quantity} × {item.productName}
                    </span>
                    <span>₹{(item.quantity * item.unitPrice).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              {/* Footer info & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {order.deliveryEstimate}
                </span>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href={`/profile/usr-farmer-01`}>
                      Farm Origin Profile
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-primary text-primary-foreground text-xs">
                    <Link href="/consumer/shop">
                      Reorder
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
