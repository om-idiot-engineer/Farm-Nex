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
    { name: "Cold-Pressed Oils", count: "12 products", icon: "🌱", href: "/consumer/shop?category=Oils" },
    { name: "Stone-Ground Flours", count: "8 products", icon: "🌾", href: "/consumer/shop?category=Flours" },
    { name: "Heirloom Pulses", count: "14 products", icon: "🫘", href: "/consumer/shop?category=Pulses" },
    { name: "Single-Origin Spices", count: "9 products", icon: "🌿", href: "/consumer/shop?category=Spices" },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 text-white sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-200 backdrop-blur-sm border border-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            100% Farm-Direct · Traceable Origin
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Know exactly who grew your food.
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
            Pure, unadulterated cold-pressed oils, stone-milled flours, and heirloom grains sourced directly from verified farmer collectives without chemical processing or middleman hoarding.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold">
              <Link href="/consumer/shop">
                Shop Farm-Direct Catalog <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/consumer/discover">
                Discover Grower Stories
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <DemoNotice>
        Consumer purchases demonstrate end-to-end batch traceability: view farmer soil profiles, harvest dates, and digital laboratory purity certificates.
      </DemoNotice>

      {/* Category Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <span className="text-2xl">{c.icon}</span>
            <div>
              <p className="text-xs font-bold text-foreground">{c.name}</p>
              <p className="text-[11px] text-muted-foreground">{c.count}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Farm-Direct Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground">Featured Traceable Harvests</h2>
            <p className="text-xs text-muted-foreground">Every package includes a verifiable batch QR code linking directly to the farmer&apos;s field</p>
          </div>
          <Button variant="outline" asChild size="sm">
            <Link href="/consumer/shop">View All ({products.length})</Link>
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div>
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 rounded bg-background/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                    {product.category}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-background/90 px-2 py-0.5 text-xs font-bold text-amber-600 backdrop-blur-xs">
                    <Star className="h-3 w-3 fill-current" />
                    {product.rating}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-foreground text-base line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Leaf className="h-3 w-3 text-emerald-600" />
                    {product.harvestNote}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" />
                    {product.origin}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <Link href={`/profile/${product.producerId}`} className="font-semibold text-primary hover:underline flex items-center gap-1">
                      {product.producer}
                      {product.verified && <CheckCircle2 className="h-3 w-3 text-primary" />}
                    </Link>
                    <span className="text-muted-foreground">{product.delivery}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border p-4 bg-muted/20">
                <div>
                  <p className="text-lg font-black text-foreground">₹{product.price.toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground">per {product.unit}</p>
                </div>
                <Button size="sm" onClick={() => addToCart(product.id)} className="bg-primary text-primary-foreground text-xs">
                  <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                  Add to Basket
                </Button>
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
