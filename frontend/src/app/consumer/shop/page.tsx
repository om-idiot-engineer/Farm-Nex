"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  Filter, 
  ArrowLeft, 
  Leaf, 
  MapPin, 
  Star, 
  CheckCircle2, 
  X, 
  Plus, 
  Minus, 
  Truck,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { useRequiredUser } from "@/lib/auth/useRequiredUser";
import { getConsumerProducts, createConsumerOrder } from "@/lib/services/domain";
import { Button } from "@/components/ui/button";
import DemoNotice from "@/components/DemoNotice";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import TrustBadge from "@/components/TrustBadge";

export default function ConsumerShopPage() {
  const { user, loading } = useRequiredUser(["consumer", "admin", "farmer", "buyer", "fpo"]);
  const products = getConsumerProducts().data;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  if (loading) {
    return <LoadingSkeleton variant="detail" />;
  }

  const addToCart = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const clearCart = () => setCart({});

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const product = products.find(p => p.id === id)!;
    return { product, qty, subtotal: product.price * qty };
  });
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const firstProduct = cartItems[0].product;
    const res = createConsumerOrder({
      items: cartItems.map(item => ({
        productName: item.product.name,
        quantity: item.qty,
        unitPrice: item.product.price,
      })),
      total: cartTotal,
      status: "confirmed",
      producerName: firstProduct.producer,
      origin: firstProduct.origin,
      deliveryEstimate: "Delivery in 2 days",
    });

    setPlacedOrderId(res.data.id);
    setIsOrderPlaced(true);
    setCart({});
  };

  const categories = ["all", "Oils", "Flours", "Pulses", "Spices"];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.producer.toLowerCase().includes(search.toLowerCase()) ||
      p.origin.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/consumer" className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Fresh Market
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Farm-Direct Pantry Catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sustainably grown, unadulterated essentials packed at the harvest source and shipped directly to your door.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsCartOpen(true)}
            className="bg-primary text-primary-foreground relative"
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            Basket ({cartItemCount})
            {cartItemCount > 0 && (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-black text-foreground">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            )}
          </Button>
        </div>
      </div>

      <DemoNotice>
        Orders simulate direct consumer checkout and automatically generate a tracked parcel with harvest batch origin and farmer compensation.
      </DemoNotice>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search farm, crop, or oil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
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

              <div className="flex items-center gap-1.5">
                {cart[product.id] ? (
                  <div className="flex items-center gap-2 rounded-md border border-primary bg-background px-2 py-1">
                    <button 
                      onClick={() => removeFromCart(product.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-black text-primary">{cart[product.id]}</span>
                    <button 
                      onClick={() => addToCart(product.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => addToCart(product.id)} className="bg-primary text-primary-foreground text-xs">
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    Add
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-border bg-card p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">Your Farm Basket</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-semibold">Your basket is empty</p>
                  <p className="text-xs mt-1">Explore farm-direct staples and add unadulterated harvests.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 overflow-y-auto max-h-[60vh]">
                  {cartItems.map(({ product, qty, subtotal }) => (
                    <div key={product.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">From {product.producer}</p>
                        <p className="text-xs font-semibold text-primary mt-1">₹{product.price} × {qty} = ₹{subtotal.toLocaleString("en-IN")}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="rounded border border-input p-1 hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold">{qty}</span>
                        <button 
                          onClick={() => addToCart(product.id)}
                          className="rounded border border-input p-1 hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Farm Delivery:</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-foreground pt-1 border-t border-border">
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={clearCart} className="flex-1 text-xs">
                    Clear Basket
                  </Button>
                  <Button onClick={handleCheckout} className="flex-1 bg-primary text-primary-foreground text-xs">
                    Confirm Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Placed Success Modal */}
      {isOrderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-xl font-black text-foreground">Order Confirmed!</h3>
              <p className="text-xs font-mono text-muted-foreground mt-1">Order #{placedOrderId}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Thank you for supporting smallholder farmer families directly. Your unadulterated harvest will be freshly packed and dispatched with a batch traceability tag.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsOrderPlaced(false)} className="flex-1 text-xs">
                Continue Shopping
              </Button>
              <Button asChild className="flex-1 bg-primary text-primary-foreground text-xs">
                <Link href="/consumer/orders">
                  Track My Order
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
