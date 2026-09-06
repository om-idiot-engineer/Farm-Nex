"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ShoppingCart, 
  Leaf, 
  MapPin, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Award,
  Heart,
  QrCode
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getConsumerProducts } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function ConsumerHomePage() {
  const { user, loading, hasAccess } = useRequiredUser(["consumer", "admin", "farmer", "buyer", "fpo"]);
  const products = getConsumerProducts().data;

  const [cart, setCart] = useState<Record<string, number>>({});
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);

  if (loading) {
    return <LoadingSkeleton variant="detail" />;
  }

  const addToCart = (productId: string) => {
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const categories = [
    { name: "Vegetables", count: "18 lots", icon: "🥦", href: "/consumer/shop?category=Vegetables" },
    { name: "Fruits", count: "12 lots", icon: "🍎", href: "/consumer/shop?category=Fruits" },
    { name: "Grains", count: "14 varieties", icon: "🌾", href: "/consumer/shop?category=Grains" },
    { name: "Pulses", count: "16 varieties", icon: "🫘", href: "/consumer/shop?category=Pulses" },
    { name: "Spices", count: "9 origins", icon: "🌶️", href: "/consumer/shop?category=Spices" },
    { name: "Organic", count: "21 certified", icon: "🌱", href: "/consumer/shop?category=Organic" },
  ];

  return (
    <div className="space-y-10 pb-16 max-w-7xl mx-auto py-4">
      {/* Consumer Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 text-white sm:p-10 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur-sm border border-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Direct from Verified Indian Farms · 100% Traceable
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
            Fresh produce. Better prices. Direct from the source.
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
            Sourced directly from verified farmer producer collectives across Madhya Pradesh. Zero warehouse hoarding, fair farm-gate realizations, and digital batch traceability.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold h-11 px-6 shadow-sm">
              <Link href="/consumer/shop">
                Shop Fresh Catalog <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white h-11 px-6">
              <Link href="/consumer/discover">
                Meet the Farmers
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <DemoNotice>
        Consumer catalog demonstrates direct-from-origin purchasing: each harvest lot carries verifiable soil test profiles and FPO source provenance.
      </DemoNotice>

      {/* Browse by Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Browse by Category</h2>
          <Link href="/consumer/shop" className="text-xs font-bold text-primary hover:underline">
            All categories →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
              <p className="text-xs font-bold text-foreground mt-1">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.count}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Fresh Near You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-black text-foreground">Fresh Near You</h2>
            <p className="text-xs text-muted-foreground">Directly sourced harvest batches from local growers and FPOs</p>
          </div>
          <Button variant="outline" asChild size="sm" className="font-bold text-xs h-8">
            <Link href="/consumer/shop">View Catalog ({products.length})</Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-md">
              <div>
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 rounded-md bg-background/95 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                    {product.category}
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-background/95 px-2 py-0.5 text-xs font-bold text-amber-600 backdrop-blur-xs">
                    <Star className="h-3 w-3 fill-current" />
                    {product.rating}
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="font-bold text-foreground text-base line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      From: <strong className="text-foreground">{product.producer}</strong> ({product.origin})
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1.5 border-y border-border/70">
                    <span className="text-muted-foreground">Available: <strong>{product.stockQuintals || 45} Quintals</strong></span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      ✓ Verified Source
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-border mt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Direct Price</span>
                  <p className="text-lg font-black text-primary">₹{product.price}<span className="text-xs font-normal text-muted-foreground"> / {product.unit}</span></p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => addToCart(product.id)} className="h-8 text-xs font-bold px-2.5">
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                  <Button size="sm" asChild className="h-8 text-xs font-bold px-3">
                    <Link href={`/consumer/shop`}>
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Indicator */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-4 rounded-xl border border-primary/40 bg-card p-4 shadow-2xl backdrop-blur-md sm:right-10">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{itemCount} items in basket</p>
              <p className="text-xs font-black text-primary">₹{cartTotal.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-primary text-primary-foreground">
            <Link href="/consumer/shop">
              Checkout
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
