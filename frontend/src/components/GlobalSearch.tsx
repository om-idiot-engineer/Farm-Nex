"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  Sprout,
  UserRound,
  X,
  Building2,
  FileText,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { searchFarmNex, type SearchResult } from "@/lib/services/domain";

const kindIcons = {
  listing: Sprout,
  requirement: Building2,
  profile: UserRound,
  post: FileText,
  location: MapPin,
};

const SUGGESTED_QUERIES = [
  "Soybean near Indore",
  "Wheat Grade A",
  "Dewas buyers",
  "Malwa FPO",
  "Cotton harvest",
];

export default function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setLoading(true);
      searchFarmNex(query)
        .then((response) => setResults(response.data))
        .finally(() => setLoading(false));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setQuery("");
  };

  const filteredResults =
    activeCategory === "all"
      ? results
      : results.filter((r) => {
          if (activeCategory === "produce") return r.kind === "listing";
          if (activeCategory === "demand") return r.kind === "requirement";
          if (activeCategory === "people") return r.kind === "profile";
          if (activeCategory === "posts") return r.kind === "post";
          return true;
        });

  // Grouping for 'all' mode
  const produceGroup = results.filter((r) => r.kind === "listing");
  const demandGroup = results.filter((r) => r.kind === "requirement");
  const peopleGroup = results.filter((r) => r.kind === "profile");
  const postGroup = results.filter((r) => r.kind === "post");

  return (
    <div className="relative w-full max-w-lg">
      <div className="flex h-10 items-center gap-2.5 border border-border bg-card/80 backdrop-blur-xs rounded-xl px-3.5 shadow-2xs transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-card">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && filteredResults[0]) navigate(filteredResults[0]);
          }}
          className="min-w-0 flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground font-medium"
          placeholder="Search crops, farmers, buyers, requirements..."
          aria-label="Search FarmNex"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden border border-border/70 bg-muted/40 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline font-mono">
            /
          </kbd>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-12 z-40 border border-border bg-card rounded-xl shadow-2xl p-3 animate-in fade-in-50 zoom-in-95 max-h-[26rem] flex flex-col">
            {/* Filter pills if search active */}
            {query.trim() && (
              <div className="flex items-center gap-1.5 pb-2.5 mb-2 border-b border-border overflow-x-auto text-xs shrink-0">
                {[
                  { id: "all", label: "All Results" },
                  { id: "produce", label: "Produce" },
                  { id: "demand", label: "Requirements" },
                  { id: "people", label: "Farmers & Buyers" },
                  { id: "posts", label: "Discussions" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* If no query, show suggestions */}
            {!query.trim() ? (
              <div className="space-y-3 py-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2">
                  Recommended Market Searches
                </p>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {SUGGESTED_QUERIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setQuery(s);
                        setOpen(true);
                      }}
                      className="text-xs bg-muted/30 border border-border hover:border-primary/40 px-3 py-1 rounded-full text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-2 p-2" aria-label="Searching">
                <div className="h-9 animate-pulse bg-muted/60 rounded-lg" />
                <div className="h-9 animate-pulse bg-muted/60 rounded-lg" />
                <div className="h-9 animate-pulse bg-muted/60 rounded-lg" />
              </div>
            ) : filteredResults.length ? (
              <div className="space-y-1 overflow-y-auto pr-1">
                {filteredResults.map((result) => {
                  const Icon = kindIcons[result.kind] || Search;
                  return (
                    <button
                      key={`${result.kind}-${result.id}`}
                      type="button"
                      onClick={() => navigate(result)}
                      className="flex w-full items-start gap-3 p-2.5 rounded-lg text-left hover:bg-muted/40 transition-colors group"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate">{result.title}</p>
                          {result.verified && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground/70 bg-muted/40 px-2 py-0.5 rounded self-center">
                        {result.kind === "requirement" ? "Demand" : result.kind}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No matching agricultural results found for &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
