import {
  api,
  DEMO_MODE,
  type AdminKPIData,
  type AdminMapResponse,
  type BuyerMatchOpportunity,
  type CommunityPostItem,
  type CropListing,
  type DemandForecastResponse,
  type DemandPost,
  type PriceTrendResponse,
  type TradeAgreement,
  type UserProfile,
  type WhyPriceMovedResponse,
} from "@/lib/api";
import {
  DEMO_SOURCE_LABEL,
  demoAgreements,
  demoConversations,
  demoDemands,
  demoListings,
  demoNotifications,
  demoPosts,
  demoUsers,
  demoMembers,
  demoProducts,
  demoRequirements,
  demoSupplyLots,
  demoCollectionCenters,
  demoLogisticsBatches,
  demoConsumerOrders,
  demoAdminUsers,
  demoAdminDisputes,
  demoProfiles,
  type AppNotification,
  type AppRole,
  type Conversation,
  type ConversationMessage,
  type FpoMember,
  type FpoSupplyLot,
  type FpoCollectionCenter,
  type FpoLogisticsBatch,
  type NetworkPost,
  type ProcurementRequirement,
  type ConsumerProduct,
  type ConsumerOrder,
  type ExtendedTradeAgreement,
  type AdminUserItem,
  type AdminDisputeCase,
  type DemoProfile,
} from "@/lib/data/demo";

export type DataSource = "api" | "demo";

export interface ServiceResult<T> {
  data: T;
  source: DataSource;
}

export interface SearchResult {
  id: string;
  kind: "listing" | "requirement" | "profile" | "post" | "location";
  title: string;
  subtitle: string;
  href: string;
  verified?: boolean;
}

export interface CreateListingInput {
  crop_id: string;
  quantity: number;
  quality_grade: string;
  moisture_percent?: number | null;
  harvest_date: string;
  availability_date?: string | null;
  location: string;
  lat: number;
  lng: number;
  expected_price: number;
  pickup_preference?: string;
  payment_preference?: string;
  photo_url?: string;
}

export interface CreateDemandInput {
  crop_id: string;
  quantity_needed: number;
  quality_grade: string;
  moisture_max?: number | null;
  offered_price: number;
  payment_terms?: string;
  location: string;
  lat: number;
  lng: number;
}

const LOCAL_KEYS = {
  listings: "farmnex_demo_listings",
  demands: "farmnex_demo_demands",
  agreements: "farmnex_demo_agreements",
  posts: "farmnex_demo_posts",
  messages: "farmnex_demo_messages",
  notifications: "farmnex_demo_notifications",
  members: "farmnex_demo_fpo_members",
  pools: "farmnex_demo_fpo_pools",
  rfqs: "farmnex_demo_rfqs",
  cart: "farmnex_demo_cart",
  consumerOrders: "farmnex_demo_con_orders",
  savedItems: "farmnex_demo_saved_items",
  adminUsers: "farmnex_demo_admin_users",
  adminDisputes: "farmnex_demo_admin_disputes",
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

function demoFallback<T>(data: T): ServiceResult<T> {
  return { data, source: "demo" };
}

async function fetchApiOrDemo<T>(apiCall: () => Promise<T>, demoData: T): Promise<ServiceResult<T>> {
  try {
    const data = await apiCall();
    return { data, source: "api" };
  } catch (error) {
    if (DEMO_MODE) return demoFallback(demoData);
    throw error;
  }
}

function localListings() {
  return readLocal<CropListing[]>(LOCAL_KEYS.listings, []);
}

function localDemands() {
  return readLocal<DemandPost[]>(LOCAL_KEYS.demands, []);
}

function localAgreements() {
  return readLocal<ExtendedTradeAgreement[]>(LOCAL_KEYS.agreements, demoAgreements);
}

function localPosts() {
  return readLocal<NetworkPost[]>(LOCAL_KEYS.posts, demoPosts);
}

function localMessages() {
  return readLocal<Conversation[]>(LOCAL_KEYS.messages, demoConversations);
}

function localNotifications() {
  return readLocal<AppNotification[]>(LOCAL_KEYS.notifications, demoNotifications);
}

function localMembers() {
  return readLocal<FpoMember[]>(LOCAL_KEYS.members, demoMembers);
}

function localSupplyLots() {
  return readLocal<FpoSupplyLot[]>(LOCAL_KEYS.pools, demoSupplyLots);
}

function localRfqs() {
  return readLocal<ProcurementRequirement[]>(LOCAL_KEYS.rfqs, demoRequirements);
}

function localConsumerOrders() {
  return readLocal<ConsumerOrder[]>(LOCAL_KEYS.consumerOrders, demoConsumerOrders);
}

function localAdminUsers() {
  return readLocal<AdminUserItem[]>(LOCAL_KEYS.adminUsers, demoAdminUsers);
}

function localAdminDisputes() {
  return readLocal<AdminDisputeCase[]>(LOCAL_KEYS.adminDisputes, demoAdminDisputes);
}

function combineListings(listings: CropListing[]) {
  const extra = localListings();
  return [...extra, ...listings.filter((listing) => !extra.some((item) => item.id === listing.id))];
}

function combineDemands(demands: DemandPost[]) {
  const extra = localDemands();
  return [...extra, ...demands.filter((demand) => !extra.some((item) => item.id === demand.id))];
}

function combineAgreements(agreements: TradeAgreement[]): ExtendedTradeAgreement[] {
  const extra = localAgreements();
  const converted = agreements.map((a): ExtendedTradeAgreement => {
    const matched = extra.find((e) => e.id === a.id);
    if (matched) return matched;
    return {
      ...a,
      orderNumber: `FN-DEAL-${a.id.slice(0, 5).toUpperCase()}`,
      pickupLocation: "Sanwer, Indore, Madhya Pradesh",
      deliveryDestination: "Dewas Industrial Area, MP",
      documents: [
        { id: `doc-${a.id}-1`, name: `Contract #${a.id.slice(0, 6)}.pdf`, type: "agreement", date: a.created_at.slice(0, 10), fileSize: "180 KB", status: "verified" },
      ],
      dispute: { hasDispute: false },
    };
  });
  return [...extra, ...converted.filter((item) => !extra.some((e) => e.id === item.id))];
}

function currentUserId() {
  return api.getCurrentUser()?.id;
}

function findListing(id: string): CropListing {
  const list = [...localListings(), ...demoListings];
  return list.find((listing) => listing.id === id) || demoListings[0];
}

function findDemand(id: string): DemandPost {
  const list = [...localDemands(), ...demoDemands];
  return list.find((demand) => demand.id === id) || demoDemands[0];
}

function findAgreement(id: string): ExtendedTradeAgreement {
  const list = localAgreements();
  return list.find((agreement) => agreement.id === id) || demoAgreements[0];
}

export async function getCurrentUser(): Promise<ServiceResult<UserProfile | null>> {
  const stored = api.getCurrentUser();
  if (!api.getToken()) {
    return stored ? demoFallback(stored) : { data: null, source: "api" };
  }

  try {
    return { data: await api.getMe(), source: "api" };
  } catch (error) {
    if (stored) return demoFallback(stored);
    return demoFallback(demoUsers.farmer);
  }
}

export function getDemoUser(role: AppRole): ServiceResult<UserProfile> {
  return demoFallback(demoUsers[role] || demoUsers.farmer);
}

export async function getFarmerListings(): Promise<ServiceResult<CropListing[]>> {
  const result = await fetchApiOrDemo(() => api.getMyCropListings(), demoListings);
  const userId = currentUserId();
  const listings = combineListings(result.data).filter((listing) => !userId || listing.farmer_id === userId);
  if (result.source === "api" && listings.length === 0 && DEMO_MODE) {
    return demoFallback(demoListings.filter((listing) => listing.farmer_id === userId));
  }
  return { data: listings.length > 0 ? listings : demoListings.filter((l) => l.farmer_id === demoUsers.farmer.id), source: result.source };
}

export function getMarketListings(): ServiceResult<CropListing[]> {
  return demoFallback(combineListings(demoListings));
}

export async function getMarketplaceListings(crop_id?: string): Promise<ServiceResult<CropListing[]>> {
  const result = await fetchApiOrDemo(() => api.getAllCropListings(crop_id), demoListings);
  const filtered = crop_id ? result.data.filter((listing) => listing.crop_id === crop_id) : result.data;
  const data = combineListings(filtered);
  if (result.source === "api" && data.length === 0 && DEMO_MODE) return demoFallback(demoListings);
  return { data, source: result.source };
}

export async function getListingDetail(id: string): Promise<ServiceResult<CropListing>> {
  try {
    const listings = await api.getAllCropListings();
    const found = listings.find((l) => l.id === id);
    if (found) return { data: found, source: "api" };
    throw new Error("Not found");
  } catch {
    return demoFallback(findListing(id));
  }
}

export function getDemands(): ServiceResult<DemandPost[]> {
  return demoFallback(combineDemands(demoDemands));
}

export async function getDemandPosts(crop_id?: string): Promise<ServiceResult<DemandPost[]>> {
  const result = await fetchApiOrDemo(() => api.getAllDemands(crop_id), demoDemands);
  const filtered = crop_id ? result.data.filter((demand) => demand.crop_id === crop_id) : result.data;
  const data = combineDemands(filtered);
  if (result.source === "api" && data.length === 0 && DEMO_MODE) return demoFallback(demoDemands);
  return { data, source: result.source };
}

export async function getDemandDetail(id: string): Promise<ServiceResult<DemandPost>> {
  try {
    const demands = await api.getAllDemands();
    const found = demands.find((d) => d.id === id);
    if (found) return { data: found, source: "api" };
    throw new Error("Not found");
  } catch {
    return demoFallback(findDemand(id));
  }
}

export async function getBuyerDemands(): Promise<ServiceResult<DemandPost[]>> {
  const result = await fetchApiOrDemo(() => api.getMyDemands(), demoDemands);
  const userId = currentUserId();
  const list = combineDemands(result.data).filter((demand) => !userId || demand.buyer_id === userId);
  return { data: list.length ? list : demoDemands.filter((d) => d.buyer_id === demoUsers.buyer.id), source: result.source };
}

export async function createListing(input: CreateListingInput, owner: UserProfile): Promise<ServiceResult<CropListing>> {
  try {
    return { data: await api.createCropListing(input), source: "api" };
  } catch (error) {
    if (!DEMO_MODE) throw error;
    const listing: CropListing = {
      id: `demo-local-lot-${Date.now()}`,
      farmer_id: owner.id,
      farmer_name: owner.name,
      crop_id: input.crop_id,
      quantity: input.quantity,
      quality_grade: input.quality_grade,
      moisture_percent: input.moisture_percent,
      harvest_date: input.harvest_date,
      availability_date: input.availability_date,
      location: input.location,
      lat: input.lat,
      lng: input.lng,
      expected_price: input.expected_price,
      pickup_preference: input.pickup_preference || "Buyer pickup",
      payment_preference: input.payment_preference || "Within 2 days",
      photo_url: input.photo_url,
      status: "listed",
      created_at: new Date().toISOString(),
    };
    writeLocal(LOCAL_KEYS.listings, [listing, ...localListings()]);
    return demoFallback(listing);
  }
}

export async function removeListing(id: string): Promise<ServiceResult<boolean>> {
  try {
    await api.deleteCropListing(id);
    return { data: true, source: "api" };
  } catch (error) {
    if (!DEMO_MODE) throw error;
    writeLocal(LOCAL_KEYS.listings, localListings().filter((listing) => listing.id !== id));
    return demoFallback(true);
  }
}

export async function createDemand(input: CreateDemandInput, owner: UserProfile): Promise<ServiceResult<DemandPost>> {
  try {
    return { data: await api.createDemandPost(input), source: "api" };
  } catch (error) {
    if (!DEMO_MODE) throw error;
    const demand: DemandPost = {
      id: `demo-local-demand-${Date.now()}`,
      buyer_id: owner.id,
      buyer_name: owner.name,
      business_name: owner.buyer_profile?.business_name || owner.name,
      crop_id: input.crop_id,
      quantity_needed: input.quantity_needed,
      quality_grade: input.quality_grade,
      moisture_max: input.moisture_max,
      offered_price: input.offered_price,
      payment_terms: input.payment_terms || "Immediate",
      location: input.location,
      lat: input.lat,
      lng: input.lng,
      created_at: new Date().toISOString(),
    };
    writeLocal(LOCAL_KEYS.demands, [demand, ...localDemands()]);
    return demoFallback(demand);
  }
}

export async function removeDemand(id: string): Promise<ServiceResult<boolean>> {
  try {
    await api.deleteDemandPost(id);
    return { data: true, source: "api" };
  } catch (error) {
    if (!DEMO_MODE) throw error;
    writeLocal(LOCAL_KEYS.demands, localDemands().filter((demand) => demand.id !== id));
    return demoFallback(true);
  }
}

function matchesForListing(listing: CropListing): BuyerMatchOpportunity[] {
  const demands = combineDemands(demoDemands).filter((demand) => demand.crop_id === listing.crop_id);

  return demands
    .map((demand): BuyerMatchOpportunity => {
      const quantityMatched = Math.min(listing.quantity, demand.quantity_needed);
      const latDistance = (listing.lat - demand.lat) * 111;
      const lngDistance = (listing.lng - demand.lng) * 102;
      const distanceKm = Math.max(1, Math.round(Math.hypot(latDistance, lngDistance)));
      const logisticsPerQuintal = Math.round(48 + distanceKm * 0.72);
      const netPerQuintal = demand.offered_price - logisticsPerQuintal - 35;
      const quantityScore = Math.round((quantityMatched / listing.quantity) * 100);
      const qualityScore = demand.quality_grade === listing.quality_grade ? 100 : 78;
      const distanceScore = Math.max(45, 100 - Math.round(distanceKm / 4));
      const priceScore = Math.min(100, Math.max(45, Math.round((demand.offered_price / listing.expected_price) * 85)));
      const netScore = Math.min(100, Math.max(45, Math.round((netPerQuintal / listing.expected_price) * 100)));
      const reliabilityScore = demand.buyer_id.startsWith("demo-") ? 98 : 88;
      const matchingScore = Math.round(netScore * 0.45 + priceScore * 0.2 + distanceScore * 0.15 + quantityScore * 0.08 + qualityScore * 0.05 + reliabilityScore * 0.05 + 95 * 0.02);

      return {
        match_id: `demo-match-${listing.id}-${demand.id}`,
        demand_id: demand.id,
        buyer_id: demand.buyer_id,
        buyer_name: demand.buyer_name || "Verified buyer",
        business_name: demand.business_name || demand.buyer_name || "Verified buyer",
        buyer_verified: true,
        crop_id: listing.crop_id,
        quantity_demanded: demand.quantity_needed,
        quantity_matched: quantityMatched,
        offered_price_per_quintal: demand.offered_price,
        distance_km: distanceKm,
        estimated_logistics_per_quintal: logisticsPerQuintal,
        estimated_total_logistics: logisticsPerQuintal * quantityMatched,
        net_realization_per_quintal: netPerQuintal,
        net_total_realization: netPerQuintal * quantityMatched,
        matching_score: matchingScore,
        score_breakdown: {
          net_realization_score: netScore,
          price_score: priceScore,
          distance_score: distanceScore,
          quantity_score: quantityScore,
          quality_score: qualityScore,
          reliability_score: reliabilityScore,
          availability_score: 95,
          weights: { net_realization: 0.45, price: 0.2, distance: 0.15, quantity: 0.08, quality: 0.05, reliability: 0.05, availability: 0.02 },
          formula: "Net realization (45%) + Price (20%) + Distance (15%) + Full quantity fit (8%) + Grade A match (5%) + Reliability (5%)",
        },
        why_this_offer: [
          netPerQuintal >= listing.expected_price ? "Above your expected farm-gate rate" : "Competitive net realization after freight",
          `${distanceKm} km estimated transport distance`,
          quantityMatched === listing.quantity ? "Can take your full listed lot" : `Can take ${quantityMatched}Q of your lot`,
          "Direct pickup available at farm gate",
        ],
        status: "proposed",
      };
    })
    .sort((first, second) => second.net_realization_per_quintal - first.net_realization_per_quintal);
}

export async function getBuyerMatches(listingId: string): Promise<ServiceResult<BuyerMatchOpportunity[]>> {
  const listing = findListing(listingId);
  return fetchApiOrDemo(() => api.getBuyerMatchOpportunities(listingId), matchesForListing(listing));
}

export async function acceptBuyerMatch(listingId: string, demandId: string, owner: UserProfile): Promise<ServiceResult<ExtendedTradeAgreement>> {
  try {
    const raw = await api.acceptBuyerMatch(listingId, demandId);
    const extended: ExtendedTradeAgreement = {
      ...raw,
      orderNumber: `FN-DEAL-${Date.now().toString().slice(-5)}`,
      pickupLocation: owner.farmer_profile?.location || "Sanwer, Indore, Madhya Pradesh",
      deliveryDestination: "Dewas Industrial Area, MP",
      documents: [
        { id: `doc-${raw.id}-1`, name: `Contract #${raw.id.slice(0, 6)}.pdf`, type: "agreement", date: new Date().toLocaleDateString("en-IN"), fileSize: "185 KB", status: "verified" },
        { id: `doc-${raw.id}-2`, name: "Field Quality Assay Certificate.pdf", type: "quality", date: new Date().toLocaleDateString("en-IN"), fileSize: "198 KB", status: "verified" },
      ],
      dispute: { hasDispute: false },
    };
    return { data: extended, source: "api" };
  } catch (error) {
    if (!DEMO_MODE) throw error;
    const listing = findListing(listingId);
    const demand = findDemand(demandId);
    const quantity = Math.min(listing.quantity, demand.quantity_needed);
    const gross = quantity * demand.offered_price;
    const freight = quantity * 82;
    const agreement: ExtendedTradeAgreement = {
      id: `demo-local-deal-${Date.now()}`,
      orderNumber: `FN-DEAL-${Date.now().toString().slice(-5)}`,
      match_id: `demo-local-match-${Date.now()}`,
      listing_id: listingId,
      demand_id: demandId,
      farmer_id: owner.id,
      farmer_name: owner.name,
      buyer_id: demand.buyer_id,
      buyer_name: demand.business_name || "Agrocorp Central Processing",
      crop_id: listing.crop_id,
      quantity,
      price_per_quintal: demand.offered_price,
      delivery_date: "2026-09-08",
      status: "matched",
      pickupLocation: listing.location,
      deliveryDestination: demand.location,
      transporterName: "Malwa Freight Logistics",
      vehicleNumber: "MP-09-GH-8214",
      driverName: "Dharmendra Yadav",
      driverPhone: "+91 94251 44810",
      earnings_breakdown: {
        gross_produce_value: gross,
        logistics_cost_deduction: freight,
        platform_fee: gross * 0.01,
        net_farmer_earnings: gross - freight - gross * 0.01,
      },
      documents: [
        { id: `doc-agr-${Date.now()}`, name: "Trade Agreement.pdf", type: "agreement", date: new Date().toLocaleDateString("en-IN"), fileSize: "184 KB", status: "verified" },
        { id: `doc-ass-${Date.now()}`, name: "Field Quality Assay Report.pdf", type: "quality", date: new Date().toLocaleDateString("en-IN"), fileSize: "210 KB", status: "verified" },
      ],
      dispute: { hasDispute: false },
      created_at: new Date().toISOString(),
    };
    writeLocal(LOCAL_KEYS.agreements, [agreement, ...localAgreements()]);
    return demoFallback(agreement);
  }
}

export async function getAgreements(): Promise<ServiceResult<ExtendedTradeAgreement[]>> {
  const result = await fetchApiOrDemo(() => api.getUserAgreements(), demoAgreements);
  const userId = currentUserId();
  const data = combineAgreements(result.data).filter((agreement) => !userId || agreement.farmer_id === userId || agreement.buyer_id === userId);
  return { data: data.length ? data : demoAgreements, source: result.source };
}

export async function getAgreement(id: string): Promise<ServiceResult<ExtendedTradeAgreement>> {
  try {
    const raw = await api.getAgreementDetail(id);
    const existing = findAgreement(id);
    return { data: { ...existing, ...raw }, source: "api" };
  } catch (error) {
    if (!DEMO_MODE) throw error;
    return demoFallback(findAgreement(id));
  }
}

export async function updateAgreementStatus(id: string, status: string): Promise<ServiceResult<ExtendedTradeAgreement>> {
  try {
    const raw = await api.updateAgreementStatus(id, status);
    const updated = { ...findAgreement(id), ...raw, status: status as ExtendedTradeAgreement["status"] };
    return { data: updated, source: "api" };
  } catch (error) {
    if (!DEMO_MODE) throw error;
    const agreement = { ...findAgreement(id), status: status as ExtendedTradeAgreement["status"] };
    const agreements = localAgreements().map((item) => (item.id === id ? agreement : item));
    writeLocal(LOCAL_KEYS.agreements, agreements);
    return demoFallback(agreement);
  }
}

export async function raiseDealDispute(id: string, reason: string): Promise<ServiceResult<ExtendedTradeAgreement>> {
  const agreement = findAgreement(id);
  const updated: ExtendedTradeAgreement = {
    ...agreement,
    dispute: {
      hasDispute: true,
      reason,
      status: "under_review",
      openedAt: new Date().toISOString(),
    },
  };
  const list = localAgreements().map((item) => (item.id === id ? updated : item));
  writeLocal(LOCAL_KEYS.agreements, list);

  // Also add to admin disputes
  const newDisputeCase: AdminDisputeCase = {
    id: `DSP-${Date.now().toString().slice(-3)}`,
    orderNumber: updated.orderNumber,
    crop: updated.crop_id,
    parties: `${updated.farmer_name} vs ${updated.buyer_name}`,
    reason,
    amount: updated.earnings_breakdown.gross_produce_value,
    status: "Under Review",
    filedDate: new Date().toLocaleDateString("en-IN"),
  };
  writeLocal(LOCAL_KEYS.adminDisputes, [newDisputeCase, ...localAdminDisputes()]);

  return demoFallback(updated);
}

function makeDemoTrend(crop_id: string): PriceTrendResponse {
  const base = crop_id === "soybean" ? 5420 : crop_id === "wheat" ? 2385 : 7160;
  const history = Array.from({ length: 30 }, (_, index) => {
    const date = new Date("2026-08-05T00:00:00.000Z");
    date.setUTCDate(date.getUTCDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      price: Math.round(base - 120 + index * 4.2 + Math.sin(index / 3) * 18),
      volume_arrivals: Math.round(840 - index * 6 + Math.cos(index / 2) * 45),
      source: DEMO_SOURCE_LABEL,
    };
  });
  return { crop_id, region: "Madhya Pradesh", history, currency: "INR", unit: "per quintal", data_source: DEMO_SOURCE_LABEL, last_updated: "2026-09-04T06:00:00.000Z" };
}

export async function getMarketTrend(crop_id: string, timeframe = "6m"): Promise<ServiceResult<PriceTrendResponse>> {
  return fetchApiOrDemo(() => api.getPriceTrend(crop_id, "Madhya Pradesh", timeframe), makeDemoTrend(crop_id));
}

export async function getMarketForecast(crop_id: string): Promise<ServiceResult<DemandForecastResponse>> {
  const base = crop_id === "soybean" ? 5420 : crop_id === "wheat" ? 2385 : 7160;
  const fallback: DemandForecastResponse = {
    crop_id,
    region: "Madhya Pradesh",
    historical_avg_price: base - 45,
    forecasted_next_30d_price: base + 85,
    price_direction: "upward",
    confidence_level: "Model output (historical arrivals & seasonal pattern)",
    methodology: "30-Day Moving Average + Exponential Smoothing (alpha = 0.3)",
    explanation: "Moderate upward trend observed as regional crushing plants ramp up seasonal inventory. Farm-gate prices in Malwa are holding 2.5% above the minimum support baseline.",
    formula: "Forecast = 0.65 * ExpSmooth(recent 14d, alpha=0.3) + 0.35 * MovingAvg(30d)",
  };
  return fetchApiOrDemo(() => api.getDemandForecast(crop_id, "Madhya Pradesh"), fallback);
}

export async function getMarketExplanation(crop_id: string): Promise<ServiceResult<WhyPriceMovedResponse>> {
  const fallback: WhyPriceMovedResponse = {
    crop_id,
    region: "Madhya Pradesh",
    period_change_percentage: 1.8,
    summary: `${crop_id[0].toUpperCase() + crop_id.slice(1)} benchmark rates in Madhya Pradesh improved +1.8% over the past week due to steady solvent plant inquiries and moderate initial arrivals.`,
    primary_factors: [
      "Early harvest arrivals in Dewas and Indore mandis are 12% lower than corresponding week last year.",
      "Local solvent extractors operating at 85% capacity with active restocking tenders.",
      "Moisture quality in early lots is averaging a dry 11.0%–11.5%, attracting direct processor pickups.",
    ],
    confidence_label: "Market Advisory Factor Analysis",
    disclaimer: "Real-time mandi data synthesized from Agmarknet MP nodes and platform transactions.",
  };
  return fetchApiOrDemo(() => api.getWhyPriceMoved(crop_id, "Madhya Pradesh"), fallback);
}

export async function getNetworkPosts(topic?: string): Promise<ServiceResult<NetworkPost[]>> {
  const local = localPosts();
  const filtered = topic && topic !== "all" ? local.filter((p) => p.topic === topic || p.tag === topic) : local;
  return demoFallback(filtered);
}

export async function getPostDetail(id: string): Promise<ServiceResult<NetworkPost>> {
  const post = localPosts().find((p) => p.id === id) || demoPosts[0];
  return demoFallback(post);
}

export async function createNetworkPost(
  input: { tag: string; content: string; topic: NetworkPost["topic"]; quantitySpec?: string; targetPrice?: string; mediaUrl?: string },
  owner: UserProfile
): Promise<ServiceResult<NetworkPost>> {
  const post: NetworkPost = {
    id: `demo-post-${Date.now()}`,
    user_id: owner.id,
    author_name: owner.name,
    author_role: owner.role,
    tag: input.tag as NetworkPost["tag"],
    topic: input.topic,
    content: input.content,
    expert_verified: owner.role === "expert",
    replies: [],
    created_at: new Date().toISOString(),
    location: owner.farmer_profile?.location || owner.buyer_profile?.location || "Indore, MP",
    reactions: 0,
    comments: 0,
    quantitySpec: input.quantitySpec,
    targetPrice: input.targetPrice,
    mediaUrl: input.mediaUrl,
  };
  const list = [post, ...localPosts()];
  writeLocal(LOCAL_KEYS.posts, list);
  return demoFallback(post);
}

export async function replyToPost(postId: string, content: string, owner: UserProfile): Promise<ServiceResult<NetworkPost["replies"][number]>> {
  const reply = {
    id: `demo-reply-${Date.now()}`,
    post_id: postId,
    author_id: owner.id,
    author_name: owner.name,
    author_role: owner.role,
    content,
    created_at: new Date().toISOString(),
  };
  const list = localPosts().map((p) => (p.id === postId ? { ...p, comments: (p.comments || 0) + 1, replies: [...(p.replies || []), reply] } : p));
  writeLocal(LOCAL_KEYS.posts, list);
  return demoFallback(reply);
}

export async function togglePostReaction(postId: string): Promise<ServiceResult<number>> {
  let newReactions = 0;
  const list = localPosts().map((p) => {
    if (p.id === postId) {
      newReactions = (p.reactions || 0) + 1;
      return { ...p, reactions: newReactions };
    }
    return p;
  });
  writeLocal(LOCAL_KEYS.posts, list);
  return demoFallback(newReactions);
}

export async function getMessages(): Promise<ServiceResult<Conversation[]>> {
  return demoFallback(localMessages());
}

export async function getConversation(id: string): Promise<ServiceResult<Conversation>> {
  const conversation = localMessages().find((c) => c.id === id) || demoConversations[0];
  return demoFallback(conversation);
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  kind: ConversationMessage["kind"] = "text",
  offerData?: ConversationMessage["offerData"]
): Promise<ServiceResult<ConversationMessage>> {
  const message: ConversationMessage = {
    id: `demo-message-${Date.now()}`,
    senderId,
    body,
    createdAt: new Date().toISOString(),
    kind,
    offerData,
  };
  const conversations = localMessages().map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, lastMessage: body, updatedAt: message.createdAt, messages: [...conversation.messages, message], unread: 0 }
      : conversation
  );
  writeLocal(LOCAL_KEYS.messages, conversations);
  return demoFallback(message);
}

export async function getNotifications(): Promise<ServiceResult<AppNotification[]>> {
  return demoFallback(localNotifications());
}

export async function markNotificationsRead(): Promise<ServiceResult<boolean>> {
  writeLocal(LOCAL_KEYS.notifications, localNotifications().map((notification) => ({ ...notification, unread: false })));
  return demoFallback(true);
}

export async function searchFarmNex(query: string): Promise<ServiceResult<SearchResult[]>> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return demoFallback([]);
  const listings = combineListings(demoListings).filter((l) => `${l.crop_id} ${l.location} ${l.farmer_name}`.toLowerCase().includes(normalized));
  const demands = combineDemands(demoDemands).filter((d) => `${d.crop_id} ${d.location} ${d.business_name}`.toLowerCase().includes(normalized));
  const profiles = demoProfiles.filter((p) => `${p.name} ${p.headline} ${p.location} ${p.crops.join(" ")}`.toLowerCase().includes(normalized));
  const posts = localPosts().filter((p) => `${p.content} ${p.location} ${p.author_name}`.toLowerCase().includes(normalized));

  const results: SearchResult[] = [
    ...listings.map((l) => ({
      id: l.id,
      kind: "listing" as const,
      title: `${l.crop_id[0].toUpperCase() + l.crop_id.slice(1)} · ${l.quantity}Q`,
      subtitle: `${l.location} · ₹${l.expected_price}/q · ${l.quality_grade}`,
      href: `/marketplace/listings/${l.id}`,
      verified: true,
    })),
    ...demands.map((d) => ({
      id: d.id,
      kind: "requirement" as const,
      title: `${d.business_name || "Buyer"} needs ${d.quantity_needed}Q ${d.crop_id}`,
      subtitle: `${d.location} · Offer ₹${d.offered_price.toLocaleString("en-IN")}/q`,
      href: `/marketplace/requirements/${d.id}`,
      verified: true,
    })),
    ...profiles.map((p) => ({
      id: p.id,
      kind: "profile" as const,
      title: p.name,
      subtitle: `${p.headline} · ${p.location}`,
      href: `/profile/${p.id}`,
      verified: p.verified,
    })),
    ...posts.map((p) => ({
      id: p.id,
      kind: "post" as const,
      title: p.author_name,
      subtitle: p.content.slice(0, 80),
      href: `/network/${p.id}`,
      verified: p.expert_verified,
    })),
  ];
  return demoFallback(results);
}

// FPO Methods
export function getFpoMembers(): ServiceResult<FpoMember[]> {
  return demoFallback(localMembers());
}

export function addFpoMember(member: Omit<FpoMember, "id">): ServiceResult<FpoMember> {
  const newMember: FpoMember = { ...member, id: `m-${Date.now()}` };
  const list = [newMember, ...localMembers()];
  writeLocal(LOCAL_KEYS.members, list);
  return demoFallback(newMember);
}

export function getFpoSupply(): ServiceResult<FpoSupplyLot[]> {
  return demoFallback(localSupplyLots());
}

export function createFpoSupplyLot(lot: Omit<FpoSupplyLot, "id">): ServiceResult<FpoSupplyLot> {
  const newLot: FpoSupplyLot = { ...lot, id: `pool-${Date.now()}` };
  const list = [newLot, ...localSupplyLots()];
  writeLocal(LOCAL_KEYS.pools, list);
  return demoFallback(newLot);
}

export function getFpoCollectionCenters(): ServiceResult<FpoCollectionCenter[]> {
  return demoFallback(demoCollectionCenters);
}

export function getFpoLogistics(): ServiceResult<FpoLogisticsBatch[]> {
  return demoFallback(demoLogisticsBatches);
}

// Buyer Procurement RFQ Methods
export function getProcurementRequirements(): ServiceResult<ProcurementRequirement[]> {
  return demoFallback(localRfqs());
}

export function getProcurementRequirement(id: string): ServiceResult<ProcurementRequirement> {
  const rfq = localRfqs().find((r) => r.id === id) || demoRequirements[0];
  return demoFallback(rfq);
}

export function createProcurementRfq(rfq: Partial<ProcurementRequirement>): ServiceResult<ProcurementRequirement> {
  const newRfq: ProcurementRequirement = {
    id: `rfq-${Date.now().toString().slice(-4)}`,
    title: rfq.title || `${rfq.quantity || rfq.quantityQuintals || 100}Q ${rfq.crop || rfq.crop_id || "Produce"}`,
    crop: (rfq.crop as any) || "soybean",
    crop_id: rfq.crop_id || (rfq.crop as any) || "Soybean",
    quantity: rfq.quantity || rfq.quantityQuintals || 100,
    quantityQuintals: rfq.quantityQuintals || rfq.quantity || 100,
    quantityUnit: rfq.quantityUnit || "Q",
    quality: rfq.quality || "Grade A",
    moisture: rfq.moisture || `≤ ${rfq.maxMoisturePercentage || 12}%`,
    maxMoisturePercentage: rfq.maxMoisturePercentage || 12,
    priceRange: rfq.priceRange || `₹${rfq.targetPricePerQuintal || 5300}/q`,
    targetPricePerQuintal: rfq.targetPricePerQuintal || 5300,
    destination: rfq.destination || rfq.deliveryDestination || "Dewas Facility",
    deliveryDestination: rfq.deliveryDestination || rfq.destination || "Dewas Facility",
    neededBy: rfq.neededBy || rfq.deadline || "Within 7 days",
    deadline: rfq.deadline || rfq.neededBy || "Within 7 days",
    paymentTerms: rfq.paymentTerms || "Within 24 hours of weighment",
    status: (rfq.status as any) || "Broadcast",
    responseCount: 0,
    notes: rfq.notes,
    matchedSuppliers: [
      {
        id: `match-${Date.now()}-1`,
        sellerId: demoUsers.farmer.id,
        sellerName: "Ramesh Patel",
        sellerRole: "farmer",
        verified: true,
        location: "Indore (38 km)",
        distanceKm: 38,
        availableQuantity: 250,
        expectedPrice: 5280,
        qualityFitPercentage: 96,
        reliabilityScore: 98,
        lotId: demoListings[0].id,
      },
    ],
  };
  const list = [newRfq, ...localRfqs()];
  writeLocal(LOCAL_KEYS.rfqs, list);
  return demoFallback(newRfq);
}

// Consumer Marketplace Methods
export function getConsumerProducts(): ServiceResult<ConsumerProduct[]> {
  return demoFallback(demoProducts);
}

export function getConsumerProduct(id: string): ServiceResult<ConsumerProduct> {
  const prod = demoProducts.find((p) => p.id === id) || demoProducts[0];
  return demoFallback(prod);
}

export function getConsumerOrders(): ServiceResult<ConsumerOrder[]> {
  return demoFallback(localConsumerOrders());
}

export function createConsumerOrder(order: Omit<ConsumerOrder, "id" | "date">): ServiceResult<ConsumerOrder> {
  const newOrder: ConsumerOrder = {
    ...order,
    id: `ORD-CON-${Date.now().toString().slice(-4)}`,
    date: new Date().toLocaleDateString("en-IN"),
  };
  const list = [newOrder, ...localConsumerOrders()];
  writeLocal(LOCAL_KEYS.consumerOrders, list);
  return demoFallback(newOrder);
}

// Admin Methods
export async function getAdminOverview(): Promise<ServiceResult<AdminKPIData>> {
  const fallback: AdminKPIData = {
    total_active_listings: demoListings.length,
    total_active_demands: demoDemands.length,
    total_matched_trades: demoAgreements.length,
    total_farmers_connected: 248,
    total_buyers_connected: 42,
    total_estimated_logistics_savings_inr: 186400,
    total_trade_volume_quintals: 9240,
  };
  return fetchApiOrDemo(() => api.getAdminStats(), fallback);
}

export async function getAdminMap(): Promise<ServiceResult<AdminMapResponse>> {
  const fallback: AdminMapResponse = {
    region: "Madhya Pradesh",
    bounds: { min_lat: 21, max_lat: 26.5, min_lng: 74, max_lng: 82.5 },
    supply_nodes: demoListings.map((listing) => ({
      id: listing.id,
      type: "supply" as const,
      lat: listing.lat,
      lng: listing.lng,
      title: `${listing.crop_id} · ${listing.quantity}Q`,
      location: listing.location,
      status: listing.status,
    })),
    demand_nodes: demoDemands.map((demand) => ({
      id: demand.id,
      type: "demand" as const,
      lat: demand.lat,
      lng: demand.lng,
      title: `${demand.crop_id} · ${demand.quantity_needed}Q`,
      location: demand.location,
      buyer_name: demand.business_name,
    })),
  };
  return fetchApiOrDemo(() => api.getAdminMapNodes(), fallback);
}

export function getAdminUsers(): ServiceResult<AdminUserItem[]> {
  return demoFallback(localAdminUsers());
}

export function approveAdminUser(userId: string): ServiceResult<boolean> {
  const list = localAdminUsers().map((u) => (u.id === userId ? { ...u, verified: true, status: "active" as const } : u));
  writeLocal(LOCAL_KEYS.adminUsers, list);
  return demoFallback(true);
}

export function getAdminDisputes(): ServiceResult<AdminDisputeCase[]> {
  return demoFallback(localAdminDisputes());
}

export function resolveAdminDispute(disputeId: string): ServiceResult<boolean> {
  const list = localAdminDisputes().map((d) => (d.id === disputeId ? { ...d, status: "Resolved" as const } : d));
  writeLocal(LOCAL_KEYS.adminDisputes, list);
  return demoFallback(true);
}

export function getProfile(id: string): ServiceResult<DemoProfile> {
  const profile = demoProfiles.find((p) => p.id === id) || demoProfiles[0];
  return demoFallback(profile);
}

export function getDataSourceLabel(source: DataSource) {
  return source === "api" ? "Backend data" : DEMO_SOURCE_LABEL;
}



const demoReliabilityScores: Record<string, any> = {
  "f0000000-0000-0000-0000-000000000001": {
    role: "farmer",
    total_transactions: 12,
    successful_transactions: 11,
    quality_consistency_percent: 92,
    average_rating: 4.6,
    verification_status: true
  },
  "b0000000-0000-0000-0000-000000000001": {
    role: "buyer",
    total_transactions: 45,
    successful_transactions: 44,
    payment_reliability_percent: 98,
    average_rating: 4.8,
    verification_status: true
  }
};


export async function getUserReliabilityScore(userId: string) {
  try {
    const res = await api.getUserReliability(userId);
    return res;
  } catch (err) {
    console.warn("Failed to fetch reliability score, using fallback:", err);
    return demoReliabilityScores[userId] || {
      role: "farmer",
      total_transactions: 0,
      successful_transactions: 0,
      average_rating: 0,
      verification_status: false
    };
  }
}


export async function getHeatmapData() {
  try {
    const res = await api.getHeatmapData();
    return res;
  } catch (err) {
    console.warn("Failed to fetch heatmap data:", err);
    return [];
  }
}


export async function confirmOrderDelivery(agreementId: string) {
  try {
    const res = await api.confirmDelivery(agreementId);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function confirmOrderPayment(agreementId: string) {
  try {
    const res = await api.confirmPayment(agreementId);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function rateOrderTransaction(agreementId: string, stars: number, review: string) {
  try {
    const res = await api.rateTransaction(agreementId, stars, review);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
