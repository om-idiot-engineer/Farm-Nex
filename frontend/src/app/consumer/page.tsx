"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, MapPin, CheckCircle2, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getConsumerProducts, getConsumerOrders } from "@/lib/services/domain";
import type { ConsumerProduct, ConsumerOrder } from "@/lib/data/demo";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function ConsumerDashboard() {
  const { user, loading: userLoading, hasAccess } = useRequiredUser(["consumer"]);
  const [products, setProducts] = useState<ConsumerProduct[]>([]);
  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user || !hasAccess) return;
    try {
      setProducts(getConsumerProducts().data);
      setOrders(getConsumerOrders().data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user, userLoading, hasAccess]);

  if (userLoading || loading || !user || !hasAccess) return <LoadingSkeleton />;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1440px] mx-auto theme-buyer">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-extrabold tracking-tight">Farm-Fresh Produce</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Verified farm-to-table groceries sourced directly from local farmers.</p>
        </div>
        <Button asChild className="h-10 px-4 rounded-full font-semibold text-[13px]">
          <Link href="/deals">
            <ShoppingBag className="w-4 h-4 mr-2" /> My Orders
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-[16px]">Verified Farm Produce</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-32 bg-emerald-50 border-b border-zinc-100 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} className="w-full h-full object-cover" width={400} height={300} unoptimized />
                  ) : (
                    <span className="text-4xl">🌾</span>
                  )}
                  {product.category === 'Organic' && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-emerald-700 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> Organic
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-900">{product.name}</h4>
                      <p className="text-[12px] text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {product.origin}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-[15px]">₹{product.price}</div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">{product.unit}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-500">By {product.producer}</span>
                    <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 text-[11px]">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-[16px]">Recent Orders</h3>
          <div className="bg-white rounded-[20px] border border-zinc-200 p-4 shadow-sm space-y-3">
            {orders.length > 0 ? orders.map((order, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-[12px] bg-zinc-50 border border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[13px]">{order.items[0]?.productName} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</span>
                  <span className="font-black text-[13px]">₹{order.total}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {order.date}</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full capitalize">{order.status.replace('_', ' ')}</span>
                </div>
              </div>
            )) : (
              <div className="text-center text-zinc-500 text-[12px] py-4">No order history yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
