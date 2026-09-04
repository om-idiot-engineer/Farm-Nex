import type {
  BuyerMatchOpportunity,
  CommunityPostItem,
  CropListing,
  DemandPost,
  TradeAgreement,
  UserProfile,
} from "@/lib/api";

export type AppRole = "farmer" | "fpo" | "buyer" | "consumer" | "admin" | "expert";

export interface FpoMember {
  id: string;
  name: string;
  verified: boolean;
  village: string;
  phone?: string;
  crops: string[];
  availableQuantity: number;
  deliveredQuantity: number;
  pendingQuantity: number;
  joinedDate?: string;
  landAreaAcres?: number;
}

export interface FpoSupplyLot {
  id: string;
  crop: string;
  quantity: number;
  quality: string;
  moisture: string;
  members: number;
  collectionCenter: string;
  availableDate: string;
  status: "pooled" | "partially_allocated" | "contracted";
  targetPrice?: number;
}

export interface FpoCollectionCenter {
  id: string;
  name: string;
  district: string;
  village?: string;
  capacityQuintals: number;
  currentHoldingsQuintals: number;
  currentStock?: number;
  contactPerson: string;
  contactPhone: string;
  phone?: string;
  activeBatches: number;
}

export interface FpoLogisticsBatch {
  id: string;
  crop: string;
  quantity: number;
  collectionCenter: string;
  destination: string;
  buyerName: string;
  transporter?: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  scheduledPickup: string;
  status: "scheduled" | "loaded" | "in_transit" | "delivered";
}

export interface ConsumerProduct {
  id: string;
  name: string;
  category: string;
  producer: string;
  producerId: string;
  origin: string;
  price: number;
  unit: string;
  image: string;
  harvestNote: string;
  delivery: string;
  verified: boolean;
  rating: number;
  stockQuintals?: number;
  traceabilityBatch?: string;
}

export interface ConsumerOrder {
  id: string;
  date: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
  total: number;
  status: "confirmed" | "packed" | "in_transit" | "delivered";
  producerName: string;
  origin: string;
  deliveryEstimate: string;
}

export interface NetworkPost extends CommunityPostItem {
  location?: string;
  topic: "market" | "question" | "harvest" | "procurement" | "machinery" | "logistics" | "expert";
  reactions: number;
  comments: number;
  saved?: boolean;
  following?: boolean;
  mediaUrl?: string;
  targetPrice?: string;
  quantitySpec?: string;
  actionText?: string;
  actionHref?: string;
}

export interface ConversationMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  kind?: "text" | "offer" | "counter_offer" | "acceptance" | "system";
  offerData?: {
    rate: number;
    quantity: number;
    pickup: string;
    payment: string;
  };
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  participantVerified: boolean;
  lastMessage: string;
  updatedAt: string;
  unread: number;
  context?: {
    label: string;
    crop: string;
    quantity: number;
    quality: string;
    offer: number;
    location: string;
    payment: string;
    listingId?: string;
    demandId?: string;
  };
  messages: ConversationMessage[];
}

export interface AppNotification {
  id: string;
  type: "interest" | "response" | "logistics" | "payment" | "market" | "network";
  title: string;
  description: string;
  createdAt: string;
  href: string;
  unread: boolean;
}

export interface DemoProfile {
  id: string;
  role: AppRole;
  name: string;
  headline: string;
  location: string;
  verified: boolean;
  avatar: string;
  about: string;
  crops: string[];
  stats: { label: string; value: string }[];
  activity: string[];
  fpo?: string;
  business?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  procurementCapacity?: string;
  paymentReliability?: string;
  rating?: number;
  completedDealsCount?: number;
  farmSizeAcres?: number;
  soilType?: string;
  reviews?: { author: string; role: string; comment: string; rating: number; date: string }[];
}

export interface RfqSupplierMatch {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRole: "farmer" | "fpo";
  verified: boolean;
  location: string;
  distanceKm: number;
  availableQuantity: number;
  expectedPrice: number;
  qualityFitPercentage: number;
  reliabilityScore: number;
  lotId: string;
}

export interface ProcurementRequirement {
  id: string;
  title: string;
  crop: "soybean" | "wheat" | "cotton";
  quantity: number;
  quantityUnit: string;
  quality: string;
  moisture: string;
  priceRange: string;
  destination: string;
  neededBy: string;
  paymentTerms: string;
  status: "Draft" | "Broadcast" | "Responses" | "Shortlisted" | "Negotiating" | "Awarded" | "Fulfillment" | "Completed";
  responseCount: number;
  matchedSuppliers?: RfqSupplierMatch[];
  notes?: string;
  commodity?: string;
  quantityQuintals?: number;
  targetPricePerQuintal?: number;
  maxMoisturePercentage?: number;
  deliveryDestination?: string;
  deadline?: string;
}

export interface DealDocument {
  id: string;
  name: string;
  type: "agreement" | "weighbridge" | "quality" | "delivery" | "payment";
  date: string;
  fileSize: string;
  status: "verified" | "pending";
}

export interface DealDispute {
  hasDispute: boolean;
  reason?: string;
  status?: "under_review" | "resolved" | "dismissed";
  openedAt?: string;
  resolutionNote?: string;
}

export interface ExtendedTradeAgreement extends TradeAgreement {
  orderNumber: string;
  pickupLocation: string;
  deliveryDestination: string;
  transporterName?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  documents: DealDocument[];
  dispute?: DealDispute;
  agreed_quantity?: number;
  agreed_price?: number;
  destination?: string;
  net_farmer_realization?: number;
}

export interface AdminDisputeCase {
  id: string;
  orderNumber: string;
  crop: string;
  parties: string;
  reason: string;
  amount: number;
  status: "Open" | "Under Review" | "Resolved";
  filedDate: string;
  dealId?: string;
  disputedAmount?: number;
  raisedBy?: string;
  against?: string;
  createdAt?: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  role: AppRole;
  location: string;
  phone?: string;
  joinedDate: string;
  verified: boolean;
  status: "active" | "pending_verification" | "flagged";
  tradeCount: number;
  documentType?: string;
  documentId?: string;
}

export const DEMO_SOURCE_LABEL = "Demo workspace";

export const demoUsers: Record<AppRole, UserProfile> = {
  farmer: {
    id: "demo-farmer-ramesh",
    name: "Ramesh Patel",
    role: "farmer",
    phone: "9876543210",
    email: "ramesh@farmnex.demo",
    language_pref: "en",
    verified: true,
    created_at: "2025-06-12T09:00:00.000Z",
    farmer_profile: {
      location: "Indore, Madhya Pradesh",
      lat: 22.7196,
      lng: 75.8577,
      fpo_name: "Malwa Kisan Samriddhi FPO",
    },
  },
  fpo: {
    id: "demo-fpo-malwa",
    name: "Malwa Kisan Samriddhi FPO",
    role: "fpo",
    language_pref: "en",
    verified: true,
    created_at: "2024-08-04T09:00:00.000Z",
    fpo_profile: { organization_name: "Malwa Kisan Samriddhi FPO", district: "Indore", member_count: 248 },
  },
  buyer: {
    id: "demo-buyer-agrocorp",
    name: "Anita Sharma",
    role: "buyer",
    phone: "9811111111",
    email: "buyer1@agrocorp.in",
    language_pref: "en",
    verified: true,
    created_at: "2025-03-18T09:00:00.000Z",
    buyer_profile: {
      business_name: "Agrocorp Central Processing Pvt Ltd",
      gst_verified: true,
      location: "Dewas Industrial Area, Madhya Pradesh",
      lat: 22.9676,
      lng: 76.0534,
    },
  },
  consumer: {
    id: "demo-consumer-meera",
    name: "Meera Joshi",
    role: "consumer",
    email: "meera@farmnex.demo",
    language_pref: "en",
    verified: false,
    created_at: "2026-01-10T09:00:00.000Z",
    consumer_profile: { interests: ["traceable produce", "cold-pressed oils", "millets"] },
  },
  admin: {
    id: "demo-admin-operations",
    name: "FarmNex Operations",
    role: "admin",
    email: "operations@farmnex.demo",
    language_pref: "en",
    verified: true,
    created_at: "2024-01-10T09:00:00.000Z",
  },
  expert: {
    id: "demo-expert-dr-kavita",
    name: "Dr. Kavita Rao",
    role: "expert",
    email: "kavita.agronomy@farmnex.demo",
    language_pref: "en",
    verified: true,
    created_at: "2024-05-15T09:00:00.000Z",
  },
};

export const demoProfiles: DemoProfile[] = [
  {
    id: demoUsers.farmer.id,
    role: "farmer",
    name: "Ramesh Patel",
    headline: "Soybean & Wheat Grower | Malwa Belt",
    location: "Indore, Madhya Pradesh",
    verified: true,
    avatar: "RP",
    about: "Growing high-oil soybean and certified sharbati wheat across 18 acres in Sanwer tehsil. Active member of Malwa Kisan Samriddhi FPO focused on standardized quality and honest net realization.",
    crops: ["Soybean", "Wheat", "Gram"],
    fpo: "Malwa Kisan Samriddhi FPO",
    stats: [
      { label: "Completed trades", value: "18" },
      { label: "Delivery reliability", value: "98%" },
      { label: "Buyer rating", value: "4.9 / 5" },
      { label: "Active harvest", value: "250Q Soybean" },
    ],
    farmSizeAcres: 18,
    soilType: "Deep Black Cotton Soil (Vertisol)",
    paymentReliability: "Direct bank settlement",
    rating: 4.9,
    completedDealsCount: 18,
    activity: [
      "Harvested 250Q Grade A soybean at 11.2% moisture",
      "Compared 3 buyer offers on FarmNex; best net ₹5,233/q",
      "Supplied 420Q Sharbati wheat to Central Flour Lines in April",
    ],
    reviews: [
      { author: "Anita Sharma (Agrocorp)", role: "Bulk Buyer", comment: "Excellent moisture consistency and clean bagging. Exactly as assayed.", rating: 5, date: "Aug 2026" },
      { author: "Vikram Singh (Bhopal Solvex)", role: "Bulk Buyer", comment: "Prompt loading and prompt communication on vehicle dispatch.", rating: 5, date: "May 2026" },
    ],
  },
  {
    id: demoUsers.buyer.id,
    role: "buyer",
    name: "Agrocorp Central Processing",
    headline: "Integrated Oilseed Crushing & Refined Solvent Plant",
    location: "Dewas Industrial Area, Madhya Pradesh",
    verified: true,
    avatar: "AC",
    about: "Agrocorp operates a 1,200 MT/day processing mill in Dewas. We source Grade A soybean and mustard directly from farmers and FPOs with guaranteed transparent weighing, instant assay slips, and payment within 24 hours.",
    crops: ["Soybean", "Mustard"],
    business: "Agrocorp Central Processing Pvt Ltd",
    gstNumber: "23AAACA1122D1Z4",
    procurementCapacity: "35,000 Quintals / Month",
    paymentReliability: "99.4% on-time settlement (< 24h)",
    rating: 4.85,
    completedDealsCount: 142,
    stats: [
      { label: "Deals fulfilled", value: "142" },
      { label: "Settlement speed", value: "Under 24h" },
      { label: "Procured volume", value: "48,200Q" },
      { label: "Verified facility", value: "FSSAI & GST" },
    ],
    activity: [
      "Posted procurement RFQ: 500Q Soybean @ ₹5,350/q with buyer pickup",
      "Accepted 250Q soybean lot from Ramesh Patel (Sanwer)",
      "Settled ₹13,08,250 net farmer payout for consignment #FN-28410",
    ],
    reviews: [
      { author: "Ramesh Patel", role: "Farmer", comment: "Weighbridge was exact and payment hit account the next morning without deductions.", rating: 5, date: "Jul 2026" },
      { author: "Malwa Kisan Samriddhi FPO", role: "FPO", comment: "Reliable institutional buyer with fair moisture tolerance allowances.", rating: 5, date: "Jun 2026" },
    ],
  },
  {
    id: "demo-fpo-malwa",
    role: "fpo",
    name: "Malwa Kisan Samriddhi FPO",
    headline: "Farmer Producer Organisation | 248 Member Smallholders",
    location: "Indore & Sanwer, Madhya Pradesh",
    verified: true,
    avatar: "MK",
    about: "Registered under Companies Act with 248 verified smallholder members. We operate 2 collection centers in Rau and Sanwer, offering centralized cleaning, grading, digital moisture assays, and collective bargaining for bulk processor contracts.",
    crops: ["Soybean", "Wheat", "Onion", "Gram"],
    stats: [
      { label: "Active members", value: "248" },
      { label: "Pooled volume", value: "1,840Q" },
      { label: "Contracts closed", value: "31" },
      { label: "Collection points", value: "2 Centers" },
    ],
    activity: [
      "Aggregated 740Q Grade A soybean pool across 4 member clusters",
      "Opened early wheat procurement reservations for November sowing",
      "Scheduled 2 multi-axle trucks for dispatch to Dewas processor",
    ],
    reviews: [
      { author: "Agrocorp Central Processing", role: "Bulk Buyer", comment: "Consolidated quality is uniform across all bags. Saves us 3 days of mandi lot sampling.", rating: 5, date: "Aug 2026" },
    ],
  },
  {
    id: demoUsers.consumer.id,
    role: "consumer",
    name: "Meera Joshi",
    headline: "Home Cook & Supporter of Traceable Indian Agriculture",
    location: "Indore, Madhya Pradesh",
    verified: false,
    avatar: "MJ",
    about: "Passionate about chemical-free grains, traditional cold-pressed oils, and understanding the families who grow our food.",
    crops: ["Cold-pressed oils", "Unpolished pulses", "Millets"],
    stats: [
      { label: "Orders placed", value: "12" },
      { label: "Producers supported", value: "6 FPOs" },
      { label: "Following", value: "18 Farms" },
    ],
    activity: [
      "Purchased 5L Cold-Pressed Soybean Oil from Malwa FPO",
      "Followed Sehore Gram Collective",
      "Left 5-star review for Malwa Kodo Millet",
    ],
  },
  {
    id: "demo-expert-dr-kavita",
    role: "expert",
    name: "Dr. Kavita Rao",
    headline: "Senior Agronomist & Post-Harvest Quality Consultant",
    location: "College of Agriculture, Indore, MP",
    verified: true,
    avatar: "KR",
    about: "Ph.D. in Agronomy with 16 years advising central Indian farmers on oilseed quality, post-harvest drying, pest mitigation, and mandi assay compliance.",
    crops: ["Soybean", "Wheat", "Mustard"],
    stats: [
      { label: "Questions answered", value: "140+" },
      { label: "Farmers assisted", value: "1,200+" },
      { label: "Advisories verified", value: "88" },
    ],
    activity: [
      "Published advisory on post-rain soybean drying protocols",
      "Verified moisture testing accuracy standards for Dewas mandi lots",
      "Answered query on rust management in early wheat varieties",
    ],
  },
];

export const demoListings: CropListing[] = [
  {
    id: "demo-lot-fn-28492",
    farmer_id: demoUsers.farmer.id,
    farmer_name: "Ramesh Patel",
    commodity: "soybean",
    quantity: 250,
    quality_grade: "Grade A",
    moisture_percent: 11.2,
    harvest_date: "2026-08-27",
    availability_date: "2026-09-05",
    location: "Indore, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    expected_price: 5280,
    pickup_preference: "Buyer pickup",
    payment_preference: "Within 2 days",
    status: "listed",
    created_at: "2026-09-03T06:30:00.000Z",
  },
  {
    id: "demo-lot-fn-28473",
    farmer_id: "demo-farmer-sunita",
    farmer_name: "Sunita Verma",
    commodity: "soybean",
    quantity: 180,
    quality_grade: "Grade A",
    moisture_percent: 10.8,
    harvest_date: "2026-08-25",
    availability_date: "2026-09-06",
    location: "Dewas, Madhya Pradesh",
    lat: 22.9676,
    lng: 76.0534,
    expected_price: 5310,
    pickup_preference: "Either",
    payment_preference: "Immediate",
    status: "listed",
    created_at: "2026-09-02T08:45:00.000Z",
  },
  {
    id: "demo-lot-fn-28411",
    farmer_id: "demo-farmer-rajesh",
    farmer_name: "Rajesh Pawar",
    commodity: "wheat",
    quantity: 420,
    quality_grade: "Grade B",
    moisture_percent: 11.8,
    harvest_date: "2026-04-22",
    availability_date: "2026-09-08",
    location: "Sehore, Madhya Pradesh",
    lat: 23.2032,
    lng: 77.0844,
    expected_price: 2420,
    pickup_preference: "Buyer pickup",
    payment_preference: "Within 5 days",
    status: "listed",
    created_at: "2026-09-01T10:20:00.000Z",
  },
  {
    id: "demo-lot-fn-28399",
    farmer_id: "demo-farmer-anil",
    farmer_name: "Anil Jat",
    commodity: "cotton",
    quantity: 120,
    quality_grade: "Grade A",
    moisture_percent: 8.5,
    harvest_date: "2026-08-15",
    availability_date: "2026-09-07",
    location: "Khargone, Madhya Pradesh",
    lat: 21.8234,
    lng: 75.6179,
    expected_price: 7150,
    pickup_preference: "Buyer pickup",
    payment_preference: "Immediate",
    status: "listed",
    created_at: "2026-08-30T14:10:00.000Z",
  },
];

export const demoDemands: DemandPost[] = [
  {
    id: "demo-demand-agrocorp-500",
    buyer_id: demoUsers.buyer.id,
    buyer_name: "Anita Sharma",
    business_name: "Agrocorp Central Processing",
    commodity: "soybean",
    quantity_needed: 500,
    quality_grade: "Grade A",
    moisture_max: 12,
    offered_price: 5350,
    payment_terms: "Within 1 day",
    location: "Dewas, Madhya Pradesh",
    lat: 22.9676,
    lng: 76.0534,
    created_at: "2026-09-03T07:10:00.000Z",
  },
  {
    id: "demo-demand-bhopal-300",
    buyer_id: "demo-buyer-bhopal",
    buyer_name: "Vikram Singh",
    business_name: "Bhopal Solvex & Oils",
    commodity: "soybean",
    quantity_needed: 300,
    quality_grade: "Grade A",
    moisture_max: 12,
    offered_price: 5480,
    payment_terms: "Within 3 days",
    location: "Mandideep, Madhya Pradesh",
    lat: 23.0722,
    lng: 77.5255,
    created_at: "2026-09-02T11:00:00.000Z",
  },
  {
    id: "demo-demand-ujjain-150",
    buyer_id: "demo-buyer-ujjain",
    buyer_name: "Mahakal Feeds",
    business_name: "Mahakal Feeds & Grain",
    commodity: "soybean",
    quantity_needed: 150,
    quality_grade: "Grade B",
    moisture_max: 13,
    offered_price: 5290,
    payment_terms: "Immediate",
    location: "Ujjain, Madhya Pradesh",
    lat: 23.1765,
    lng: 75.7885,
    created_at: "2026-09-01T09:30:00.000Z",
  },
  {
    id: "demo-demand-wheat-sehore",
    buyer_id: "demo-buyer-bhopal",
    buyer_name: "Central Grain Foods",
    business_name: "Central Grain Foods Ltd",
    commodity: "wheat",
    quantity_needed: 600,
    quality_grade: "Grade B",
    moisture_max: 12,
    offered_price: 2480,
    payment_terms: "Within 5 days",
    location: "Bhopal, Madhya Pradesh",
    lat: 23.2599,
    lng: 77.4126,
    created_at: "2026-08-31T12:00:00.000Z",
  },
];

export const demoMatches: BuyerMatchOpportunity[] = [
  {
    match_id: "demo-match-1",
    demand_id: "demo-demand-agrocorp-500",
    buyer_id: demoUsers.buyer.id,
    buyer_name: "Anita Sharma",
    business_name: "Agrocorp Central Processing",
    buyer_verified: true,
    commodity: "soybean",
    quantity_demanded: 500,
    quantity_matched: 250,
    offered_price_per_quintal: 5350,
    distance_km: 38,
    estimated_logistics_per_quintal: 82,
    estimated_total_logistics: 20500,
    net_realization_per_quintal: 5233,
    net_total_realization: 1308250,
    matching_score: 96,
    score_breakdown: {
      net_realization_score: 98,
      price_score: 92,
      distance_score: 94,
      quantity_score: 100,
      quality_score: 100,
      reliability_score: 98,
      availability_score: 95,
      weights: { net_realization: 0.45, price: 0.2, distance: 0.15, quantity: 0.08, quality: 0.05, reliability: 0.05, availability: 0.02 },
      formula: "Net realization (45%) + Price (20%) + Distance (15%) + Full quantity fit (8%) + Grade A match (5%) + Reliability (5%)",
    },
    why_this_offer: [
      "Highest estimated net realization (₹5,233/q after freight)",
      "Can take your full listed lot of 250 Quintals",
      "Direct buyer pickup provided from your Indore farm-gate",
      "99.4% on-time payment track record (settles within 24 hours)",
      "Short 38 km transport distance minimizes weight-loss risk",
    ],
    status: "proposed",
  },
  {
    match_id: "demo-match-2",
    demand_id: "demo-demand-ujjain-150",
    buyer_id: "demo-buyer-ujjain",
    buyer_name: "Mahakal Feeds",
    business_name: "Mahakal Feeds & Grain",
    buyer_verified: true,
    commodity: "soybean",
    quantity_demanded: 150,
    quantity_matched: 150,
    offered_price_per_quintal: 5290,
    distance_km: 57,
    estimated_logistics_per_quintal: 95,
    estimated_total_logistics: 14250,
    net_realization_per_quintal: 5160,
    net_total_realization: 774000,
    matching_score: 88,
    score_breakdown: {
      net_realization_score: 89,
      price_score: 87,
      distance_score: 85,
      quantity_score: 75,
      quality_score: 100,
      reliability_score: 92,
      availability_score: 95,
      weights: { net_realization: 0.45, price: 0.2, distance: 0.15, quantity: 0.08, quality: 0.05, reliability: 0.05, availability: 0.02 },
      formula: "Net realization (45%) + Price (20%) + Distance (15%) + Partial quantity (8%)",
    },
    why_this_offer: [
      "Immediate cash/UPI settlement upon weighing",
      "57 km transport distance to Ujjain feed mill",
      "Note: Can only take 150Q of your 250Q lot (partial match)",
    ],
    status: "proposed",
  },
  {
    match_id: "demo-match-3",
    demand_id: "demo-demand-bhopal-300",
    buyer_id: "demo-buyer-bhopal",
    buyer_name: "Vikram Singh",
    business_name: "Bhopal Solvex & Oils",
    buyer_verified: true,
    commodity: "soybean",
    quantity_demanded: 300,
    quantity_matched: 250,
    offered_price_per_quintal: 5480,
    distance_km: 178,
    estimated_logistics_per_quintal: 286,
    estimated_total_logistics: 71500,
    net_realization_per_quintal: 5159,
    net_total_realization: 1289750,
    matching_score: 84,
    score_breakdown: {
      net_realization_score: 88,
      price_score: 99,
      distance_score: 60,
      quantity_score: 100,
      quality_score: 100,
      reliability_score: 88,
      availability_score: 95,
      weights: { net_realization: 0.45, price: 0.2, distance: 0.15, quantity: 0.08, quality: 0.05, reliability: 0.05, availability: 0.02 },
      formula: "High headline rate (₹5,480) offset by ₹286/q freight over 178 km",
    },
    why_this_offer: [
      "Higher headline price (₹5,480/q) looks attractive",
      "However, ₹286/q long-haul freight lowers your net realization",
      "Buyer requires 3-day verification settlement",
    ],
    status: "proposed",
  },
];

export const demoAgreements: ExtendedTradeAgreement[] = [
  {
    id: "demo-deal-fn-28492",
    orderNumber: "FN-DEAL-28492",
    match_id: "demo-match-1",
    listing_id: demoListings[0].id,
    demand_id: demoDemands[0].id,
    farmer_id: demoUsers.farmer.id,
    farmer_name: "Ramesh Patel",
    buyer_id: demoUsers.buyer.id,
    buyer_name: "Agrocorp Central Processing",
    commodity: "soybean",
    quantity: 250,
    price_per_quintal: 5350,
    delivery_date: "2026-09-08",
    status: "pickup_scheduled",
    pickupLocation: "Ramesh Patel Farm, Sanwer Tehsil, Indore, MP",
    deliveryDestination: "Agrocorp Mill Unit 2, Dewas Industrial Area, MP",
    transporterName: "Malwa Express Freight Logistics",
    vehicleNumber: "MP-09-GH-8214 (12-Wheel Multi-Axle)",
    driverName: "Dharmendra Yadav",
    driverPhone: "+91 94251 44810",
    earnings_breakdown: {
      gross_produce_value: 1337500,
      logistics_cost_deduction: 20500,
      platform_fee: 8750,
      net_farmer_earnings: 1308250,
    },
    documents: [
      { id: "doc-agr-01", name: "Direct Trade Agreement #28492.pdf", type: "agreement", date: "3 Sep 2026", fileSize: "184 KB", status: "verified" },
      { id: "doc-assay-01", name: "Field Quality Assay Certificate (11.2% Moisture).pdf", type: "quality", date: "3 Sep 2026", fileSize: "210 KB", status: "verified" },
      { id: "doc-weigh-01", name: "Weighbridge Slip (Pending Loading).pdf", type: "weighbridge", date: "Scheduled 8 Sep", fileSize: "Pending", status: "pending" },
      { id: "doc-del-01", name: "Delivery Proof & Gate Pass.pdf", type: "delivery", date: "Pending Delivery", fileSize: "Pending", status: "pending" },
      { id: "doc-pay-01", name: "Bank Settlement Escrow Receipt.pdf", type: "payment", date: "Pending Acceptance", fileSize: "Pending", status: "pending" },
    ],
    dispute: {
      hasDispute: false,
    },
    created_at: "2026-09-03T08:20:00.000Z",
  },
  {
    id: "demo-deal-fn-28310",
    orderNumber: "FN-DEAL-28310",
    match_id: "demo-match-prev",
    listing_id: "demo-lot-old",
    demand_id: "demo-demand-old",
    farmer_id: demoUsers.farmer.id,
    farmer_name: "Ramesh Patel",
    buyer_id: demoUsers.buyer.id,
    buyer_name: "Agrocorp Central Processing",
    commodity: "wheat",
    quantity: 420,
    price_per_quintal: 2450,
    delivery_date: "2026-07-14",
    status: "completed",
    pickupLocation: "Ramesh Patel Farm, Sanwer, Indore, MP",
    deliveryDestination: "Agrocorp Mill Unit 1, Dewas, MP",
    transporterName: "Kisan Cargo Transporters",
    vehicleNumber: "MP-09-KL-4091",
    driverName: "Mukesh Chouhan",
    driverPhone: "+91 98260 12040",
    earnings_breakdown: {
      gross_produce_value: 1029000,
      logistics_cost_deduction: 34440,
      platform_fee: 7200,
      net_farmer_earnings: 987360,
    },
    documents: [
      { id: "doc-agr-02", name: "Signed Trade Agreement.pdf", type: "agreement", date: "10 Jul 2026", fileSize: "192 KB", status: "verified" },
      { id: "doc-weigh-02", name: "Certified Mandi Weighbridge Slip.pdf", type: "weighbridge", date: "14 Jul 2026", fileSize: "145 KB", status: "verified" },
      { id: "doc-del-02", name: "Signed Consignment Receipt.pdf", type: "delivery", date: "14 Jul 2026", fileSize: "168 KB", status: "verified" },
      { id: "doc-pay-02", name: "NEFT Bank Reference #UTIB98217412.pdf", type: "payment", date: "15 Jul 2026", fileSize: "120 KB", status: "verified" },
    ],
    dispute: {
      hasDispute: false,
    },
    created_at: "2026-07-10T11:00:00.000Z",
  },
];

export const demoPosts: NetworkPost[] = [
  {
    id: "demo-post-harvest-ramesh",
    user_id: demoUsers.farmer.id,
    author_name: "Ramesh Patel",
    author_role: "farmer",
    tag: "market",
    topic: "harvest",
    content: "Soybean harvest started today across our Sanwer fields. Moisture is holding steady at 11.2% after morning drying. Total available produce is 250Q Grade A. Looking for buyers with direct farm-gate pickup this week.",
    expert_verified: false,
    replies: [
      {
        id: "demo-reply-1",
        post_id: "demo-post-harvest-ramesh",
        author_id: "demo-fpo-malwa",
        author_name: "Malwa Kisan Samriddhi FPO",
        author_role: "fpo",
        content: "Rau collection center has calibrated weighing bays open on 6 September. Contact the pool manager to group with our 740Q lot.",
        created_at: "2026-09-03T08:10:00.000Z",
      },
      {
        id: "demo-reply-2",
        post_id: "demo-post-harvest-ramesh",
        author_id: demoUsers.buyer.id,
        author_name: "Agrocorp Central Processing",
        author_role: "buyer",
        content: "We have an open procurement contract for 500Q Grade A soybean at ₹5,350/q. Pickup can be scheduled within 48 hours.",
        created_at: "2026-09-03T08:35:00.000Z",
      },
    ],
    created_at: "2026-09-03T07:45:00.000Z",
    location: "Indore, Madhya Pradesh",
    reactions: 28,
    comments: 2,
    quantitySpec: "250Q Available",
    actionText: "View Lot",
    actionHref: "/marketplace/listings/demo-lot-fn-28492",
  },
  {
    id: "demo-post-requirement-agrocorp",
    user_id: demoUsers.buyer.id,
    author_name: "Agrocorp Central Processing",
    author_role: "buyer",
    tag: "market",
    topic: "procurement",
    content: "URGENT SOURCING: Looking for 500Q soybean for our Dewas extraction mill. Grade A, moisture max 12%. Target price: ₹5,350/q. Dedicated multi-axle freight pickup provided by buyer. Payment settled within 24h of weighment.",
    expert_verified: false,
    replies: [
      {
        id: "demo-reply-3",
        post_id: "demo-post-requirement-agrocorp",
        author_id: demoUsers.farmer.id,
        author_name: "Ramesh Patel",
        author_role: "farmer",
        content: "I have 250Q ready in Sanwer at 11.2% moisture. Sent an inquiry via messages.",
        created_at: "2026-09-03T08:50:00.000Z",
      },
    ],
    created_at: "2026-09-03T06:50:00.000Z",
    location: "Dewas, Madhya Pradesh",
    reactions: 34,
    comments: 5,
    targetPrice: "₹5,350/q",
    quantitySpec: "500Q Needed",
    actionText: "View Requirement",
    actionHref: "/marketplace/requirements/demo-demand-agrocorp-500",
  },
  {
    id: "demo-post-expert-moisture",
    user_id: "demo-expert-dr-kavita",
    author_name: "Dr. Kavita Rao",
    author_role: "expert",
    tag: "expert_verified",
    topic: "expert",
    content: "AGRONOMY ADVISORY: For soybean stored beyond 7 days, recheck moisture before consignment dispatch. If moisture exceeds 12%, processors will deduct up to ₹40/q for weight loss during crushing. Keep bagged lots elevated on wooden pallets to prevent dampness migration from concrete floors.",
    expert_verified: true,
    replies: [
      {
        id: "demo-reply-4",
        post_id: "demo-post-expert-moisture",
        author_id: "m-anil",
        author_name: "Anil Jat",
        author_role: "farmer",
        content: "Thank you doctor. Does sun-drying for 4 hours affect germination if sold as seed later?",
        created_at: "2026-09-02T16:20:00.000Z",
      },
    ],
    created_at: "2026-09-02T14:15:00.000Z",
    location: "College of Agriculture, Indore",
    reactions: 62,
    comments: 8,
    actionText: "Ask Dr. Kavita",
    actionHref: "/network",
  },
  {
    id: "demo-post-fpo-pool",
    user_id: "demo-fpo-malwa",
    author_name: "Malwa Kisan Samriddhi FPO",
    author_role: "fpo",
    tag: "market",
    topic: "market",
    content: "FPO ANNOUNCEMENT: We have successfully pooled 740Q of Grade A soybean across 4 member clusters at Rau center. Institutional buyers can tender for the full lot with single-point inspection and dispatch scheduling.",
    expert_verified: false,
    replies: [],
    created_at: "2026-09-02T10:30:00.000Z",
    location: "Rau Collection Center, Indore",
    reactions: 41,
    comments: 3,
    quantitySpec: "740Q Pooled",
    actionText: "Inspect Pooled Lot",
    actionHref: "/fpo",
  },
  {
    id: "demo-post-machinery",
    user_id: "m-rajesh",
    author_name: "Rajesh Pawar",
    author_role: "farmer",
    tag: "machinery",
    topic: "machinery",
    content: "John Deere 5050D with high-capacity thresher available for custom hiring in Sehore and Ashta tehsils starting next Monday. Clean threshing with minimal grain breakage. ₹1,400/hour.",
    expert_verified: false,
    replies: [],
    created_at: "2026-09-01T15:00:00.000Z",
    location: "Sehore, Madhya Pradesh",
    reactions: 19,
    comments: 4,
  },
];

export const demoConversations: Conversation[] = [
  {
    id: "demo-conversation-agrocorp",
    participantId: demoUsers.buyer.id,
    participantName: "Agrocorp Central Processing",
    participantRole: "Verified Bulk Processor",
    participantVerified: true,
    lastMessage: "We can schedule pickup for 8 September morning with truck MP-09-GH-8214.",
    updatedAt: "2026-09-03T09:32:00.000Z",
    unread: 1,
    context: {
      label: "Regarding Soybean Lot #FN-28492",
      crop: "Soybean",
      quantity: 250,
      quality: "Grade A · 11.2% moisture",
      offer: 5350,
      location: "Sanwer to Dewas (38 km)",
      payment: "Direct bank transfer within 24h",
      listingId: "demo-lot-fn-28492",
      demandId: "demo-demand-agrocorp-500",
    },
    messages: [
      {
        id: "m1",
        senderId: demoUsers.farmer.id,
        body: "Hello Anita ji, I have listed 250Q Grade A soybean at 11.2% moisture from Sanwer. Are you accepting lots this week?",
        createdAt: "2026-09-03T08:58:00.000Z",
        kind: "text",
      },
      {
        id: "m2",
        senderId: demoUsers.buyer.id,
        body: "Yes Ramesh ji. We have checked your assay. We offer ₹5,350/quintal with buyer-provided freight pickup from your farm gate.",
        createdAt: "2026-09-03T09:10:00.000Z",
        kind: "offer",
        offerData: {
          rate: 5350,
          quantity: 250,
          pickup: "Farm-gate pickup provided by Agrocorp",
          payment: "Within 24h of weighbridge verification",
        },
      },
      {
        id: "m3",
        senderId: demoUsers.farmer.id,
        body: "The rate is acceptable. Net realization works out to ₹5,233/q after the freight adjustment. Please confirm the pickup date.",
        createdAt: "2026-09-03T09:20:00.000Z",
        kind: "text",
      },
      {
        id: "m4",
        senderId: demoUsers.buyer.id,
        body: "We can schedule pickup for 8 September morning with truck MP-09-GH-8214. The driver Dharmendra will call ahead.",
        createdAt: "2026-09-03T09:32:00.000Z",
        kind: "text",
      },
    ],
  },
  {
    id: "demo-conversation-malwa",
    participantId: "demo-fpo-malwa",
    participantName: "Malwa Kisan Samriddhi FPO",
    participantRole: "Verified FPO Partner",
    participantVerified: true,
    lastMessage: "Your 250Q lot is now linked with our collective dispatch.",
    updatedAt: "2026-09-02T13:15:00.000Z",
    unread: 0,
    context: {
      label: "FPO Pooling Coordination",
      crop: "Soybean",
      quantity: 250,
      quality: "Grade A",
      offer: 5320,
      location: "Rau Center",
      payment: "Member ledger settlement",
    },
    messages: [
      { id: "m5", senderId: "demo-fpo-malwa", body: "Ramesh ji, please send your moisture test report to the FPO desk.", createdAt: "2026-09-02T11:00:00.000Z", kind: "text" },
      { id: "m6", senderId: demoUsers.farmer.id, body: "Done. Report uploaded; moisture is 11.2%.", createdAt: "2026-09-02T12:00:00.000Z", kind: "text" },
      { id: "m7", senderId: "demo-fpo-malwa", body: "Your 250Q lot is now linked with our collective dispatch.", createdAt: "2026-09-02T13:15:00.000Z", kind: "text" },
    ],
  },
];

export const demoNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "interest",
    title: "Buyer interested in your soybean lot",
    description: "Agrocorp Central Processing reviewed lot #FN-28492 and offered ₹5,350/q with pickup.",
    createdAt: "2026-09-03T09:10:00.000Z",
    href: "/messages/demo-conversation-agrocorp",
    unread: true,
  },
  {
    id: "n2",
    type: "logistics",
    title: "Pickup scheduled for 8 September",
    description: "Multi-axle truck MP-09-GH-8214 assigned for your 250Q consignment to Dewas.",
    createdAt: "2026-09-03T08:25:00.000Z",
    href: "/orders/demo-deal-fn-28492",
    unread: true,
  },
  {
    id: "n3",
    type: "market",
    title: "Soybean crossed your alert threshold",
    description: "Madhya Pradesh mandi benchmark rate reached ₹5,420/q (+1.8% this week).",
    createdAt: "2026-09-02T16:10:00.000Z",
    href: "/farmer/market",
    unread: false,
  },
  {
    id: "n4",
    type: "response",
    title: "Your buyer RFQ received 3 new responses",
    description: "Local farmers and Malwa FPO submitted matching Grade A soybean lots.",
    createdAt: "2026-09-02T12:00:00.000Z",
    href: "/buyer/procurement/rfq-1008",
    unread: false,
  },
  {
    id: "n5",
    type: "network",
    title: "Dr. Kavita Rao answered a moisture question",
    description: "Senior Agronomist posted post-harvest storage guidelines for Indore region.",
    createdAt: "2026-09-02T14:15:00.000Z",
    href: "/network/demo-post-expert-moisture",
    unread: false,
  },
];

export const demoMembers: FpoMember[] = [
  { id: "m-ramesh", name: "Ramesh Patel", verified: true, village: "Sanwer", phone: "9876543210", crops: ["Soybean", "Wheat"], availableQuantity: 250, deliveredQuantity: 680, pendingQuantity: 250, joinedDate: "Jan 2024" },
  { id: "m-sunita", name: "Sunita Verma", verified: true, village: "Dewas Road", phone: "9826011223", crops: ["Soybean"], availableQuantity: 180, deliveredQuantity: 420, pendingQuantity: 180, joinedDate: "Mar 2024" },
  { id: "m-rajesh", name: "Rajesh Pawar", verified: false, village: "Depalpur", phone: "9425099881", crops: ["Wheat", "Onion"], availableQuantity: 420, deliveredQuantity: 310, pendingQuantity: 420, joinedDate: "Aug 2024" },
  { id: "m-anil", name: "Anil Jat", verified: true, village: "Rau", phone: "9827055443", crops: ["Soybean", "Wheat"], availableQuantity: 310, deliveredQuantity: 510, pendingQuantity: 90, joinedDate: "Feb 2024" },
  { id: "m-kailash", name: "Kailash Solanki", verified: true, village: "Manpur", phone: "9977012345", crops: ["Cotton", "Gram"], availableQuantity: 190, deliveredQuantity: 280, pendingQuantity: 190, joinedDate: "May 2024" },
];

export const demoSupplyLots: FpoSupplyLot[] = [
  { id: "pool-soy-01", crop: "Soybean", quantity: 740, quality: "Grade A", moisture: "10.8–11.6%", members: 4, collectionCenter: "Rau Collection Center", availableDate: "6 Sep 2026", status: "pooled", targetPrice: 5350 },
  { id: "pool-wheat-02", crop: "Wheat", quantity: 560, quality: "Grade B", moisture: "11.4–12.1%", members: 6, collectionCenter: "Sanwer Collection Center", availableDate: "8 Sep 2026", status: "partially_allocated", targetPrice: 2450 },
  { id: "pool-cotton-03", crop: "Cotton", quantity: 280, quality: "Grade A", moisture: "8.2–8.8%", members: 3, collectionCenter: "Sanwer Collection Center", availableDate: "12 Sep 2026", status: "pooled", targetPrice: 7200 },
];

export const demoCollectionCenters: FpoCollectionCenter[] = [
  { id: "cc-rau", name: "Rau Regional Collection Center", district: "Indore", capacityQuintals: 5000, currentHoldingsQuintals: 2150, contactPerson: "Gopal Sharma", contactPhone: "+91 98261 55001", activeBatches: 3 },
  { id: "cc-sanwer", name: "Sanwer Agri-Logistics Hub", district: "Indore", capacityQuintals: 3500, currentHoldingsQuintals: 1420, contactPerson: "Nitin Bhati", contactPhone: "+91 94250 88219", activeBatches: 2 },
];

export const demoLogisticsBatches: FpoLogisticsBatch[] = [
  { id: "batch-101", crop: "Soybean", quantity: 250, collectionCenter: "Rau Regional Collection Center", destination: "Dewas Industrial Area", buyerName: "Agrocorp Central Processing", vehicleNumber: "MP-09-GH-8214", driverName: "Dharmendra Yadav", driverPhone: "+91 94251 44810", scheduledPickup: "8 Sep 2026", status: "scheduled" },
  { id: "batch-102", crop: "Wheat", quantity: 300, collectionCenter: "Sanwer Agri-Logistics Hub", destination: "Bhopal Warehouse", buyerName: "Central Grain Foods Ltd", vehicleNumber: "MP-09-KL-4091", driverName: "Mukesh Chouhan", driverPhone: "+91 98260 12040", scheduledPickup: "10 Sep 2026", status: "scheduled" },
];

export const demoRequirements: ProcurementRequirement[] = [
  {
    id: "rfq-1008",
    title: "Grade A Soybean for September Crushing Run",
    crop: "soybean",
    commodity: "Soybean",
    quantity: 500,
    quantityQuintals: 500,
    quantityUnit: "Q",
    quality: "Grade A",
    moisture: "≤ 12%",
    maxMoisturePercentage: 12,
    priceRange: "₹5,300–₹5,400/q",
    targetPricePerQuintal: 5350,
    destination: "Dewas Extraction Plant",
    deliveryDestination: "Dewas Extraction Plant",
    neededBy: "12 Sep 2026",
    deadline: "12 Sep 2026",
    paymentTerms: "Within 24 hours of weighment",
    status: "Responses",
    responseCount: 3,
    matchedSuppliers: [
      { id: "match-s1", sellerId: demoUsers.farmer.id, sellerName: "Ramesh Patel", sellerRole: "farmer", verified: true, location: "Indore (38 km)", distanceKm: 38, availableQuantity: 250, expectedPrice: 5280, qualityFitPercentage: 98, reliabilityScore: 98, lotId: demoListings[0].id },
      { id: "match-s2", sellerId: "demo-fpo-malwa", sellerName: "Malwa Kisan Samriddhi FPO", sellerRole: "fpo", verified: true, location: "Rau (42 km)", distanceKm: 42, availableQuantity: 500, expectedPrice: 5350, qualityFitPercentage: 95, reliabilityScore: 96, lotId: "pool-soy-01" },
      { id: "match-s3", sellerId: "demo-farmer-sunita", sellerName: "Sunita Verma", sellerRole: "farmer", verified: true, location: "Dewas (12 km)", distanceKm: 12, availableQuantity: 180, expectedPrice: 5310, qualityFitPercentage: 92, reliabilityScore: 94, lotId: demoListings[1].id },
    ],
  },
  {
    id: "rfq-1004",
    title: "Certified Sharbati Wheat for Premium Flour Line",
    crop: "wheat",
    commodity: "Wheat",
    quantity: 800,
    quantityQuintals: 800,
    quantityUnit: "Q",
    quality: "Grade B",
    moisture: "≤ 12%",
    maxMoisturePercentage: 12,
    priceRange: "₹2,420–₹2,500/q",
    targetPricePerQuintal: 2460,
    destination: "Bhopal Central Warehouse",
    deliveryDestination: "Bhopal Central Warehouse",
    neededBy: "18 Sep 2026",
    deadline: "18 Sep 2026",
    paymentTerms: "Within 5 days",
    status: "Broadcast",
    responseCount: 1,
    matchedSuppliers: [
      { id: "match-s4", sellerId: "demo-farmer-rajesh", sellerName: "Rajesh Pawar", sellerRole: "farmer", verified: false, location: "Sehore (32 km)", distanceKm: 32, availableQuantity: 420, expectedPrice: 2420, qualityFitPercentage: 90, reliabilityScore: 88, lotId: demoListings[2].id },
    ],
  },
];

export const demoProducts: ConsumerProduct[] = [
  {
    id: "product-oil-01",
    name: "Pure Wood-Pressed Soybean Oil",
    category: "Oils",
    producer: "Malwa Kisan Samriddhi FPO",
    producerId: "demo-fpo-malwa",
    origin: "Sanwer & Indore, Madhya Pradesh",
    price: 285,
    unit: "1 Litre Bottle",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80",
    harvestNote: "Cold extracted from 2026 chemical-free Malwa yellow soybean. Unrefined and unbleached.",
    delivery: "Dispatches in 24 hours · Delivery in 2–4 days",
    verified: true,
    rating: 4.85,
    stockQuintals: 45,
    traceabilityBatch: "FPO-SOY-2026-B1",
  },
  {
    id: "product-wheat-02",
    name: "Stone-Ground Sharbati Wheat Atta",
    category: "Grains & Flour",
    producer: "Ramesh Patel Farm",
    producerId: demoUsers.farmer.id,
    origin: "Sanwer, Indore, Madhya Pradesh",
    price: 340,
    unit: "5 kg Bag",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
    harvestNote: "100% genuine MP Sharbati wheat grown in deep vertisol soil. Slow stone-milled to retain wheat germ.",
    delivery: "Dispatches in 24 hours · Delivery in 2–3 days",
    verified: true,
    rating: 4.9,
    stockQuintals: 60,
    traceabilityBatch: "RP-WHEAT-2026-A2",
  },
  {
    id: "product-millet-03",
    name: "Organically Grown Kodo Millet",
    category: "Millets",
    producer: "Narmada Valley Farmers Collective",
    producerId: "demo-fpo-malwa",
    origin: "Harda, Madhya Pradesh",
    price: 160,
    unit: "1 kg Pack",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
    harvestNote: "Husked and cleaned using gentle mechanical grading. High in dietary fiber and mineral content.",
    delivery: "Dispatches in 48 hours · Delivery in 3–5 days",
    verified: true,
    rating: 4.7,
    stockQuintals: 25,
    traceabilityBatch: "NV-KODO-2026-03",
  },
  {
    id: "product-dal-04",
    name: "Unpolished Desi Toor Dal",
    category: "Pulses",
    producer: "Sehore Gram Collective",
    producerId: "demo-fpo-malwa",
    origin: "Sehore, Madhya Pradesh",
    price: 195,
    unit: "1 kg Pack",
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80",
    harvestNote: "Split in traditional farm chakki without artificial oil or water polishing.",
    delivery: "Dispatches in 24 hours · Delivery in 2–4 days",
    verified: true,
    rating: 4.8,
    stockQuintals: 30,
    traceabilityBatch: "SGC-TOOR-2026-01",
  },
];

export const demoConsumerOrders: ConsumerOrder[] = [
  {
    id: "ORD-CON-9021",
    date: "2 Sep 2026",
    items: [
      { productName: "Pure Wood-Pressed Soybean Oil", quantity: 2, unitPrice: 285 },
      { productName: "Stone-Ground Sharbati Wheat Atta", quantity: 1, unitPrice: 340 },
    ],
    total: 910,
    status: "in_transit",
    producerName: "Malwa Kisan Samriddhi FPO & Ramesh Patel",
    origin: "Indore, MP",
    deliveryEstimate: "Expected by 5 Sep 2026",
  },
  {
    id: "ORD-CON-8840",
    date: "18 Aug 2026",
    items: [{ productName: "Organically Grown Kodo Millet", quantity: 2, unitPrice: 160 }],
    total: 320,
    status: "delivered",
    producerName: "Narmada Valley Farmers Collective",
    origin: "Harda, MP",
    deliveryEstimate: "Delivered on 21 Aug 2026",
  },
];

export const demoAdminUsers: AdminUserItem[] = [
  { id: demoUsers.farmer.id, name: "Ramesh Patel", role: "farmer", location: "Indore, MP", phone: "9876543210", joinedDate: "12 Jun 2025", verified: true, status: "active", tradeCount: 18, documentType: "Aadhaar KYC", documentId: "XXXX-XXXX-8912" },
  { id: demoUsers.buyer.id, name: "Anita Sharma (Agrocorp)", role: "buyer", location: "Dewas, MP", phone: "9811111111", joinedDate: "18 Mar 2025", verified: true, status: "active", tradeCount: 142, documentType: "GSTIN Certificate", documentId: "23AABCA1234F1Z5" },
  { id: "demo-fpo-malwa", name: "Malwa Kisan Samriddhi FPO", role: "fpo", location: "Indore, MP", phone: "9826155001", joinedDate: "04 Aug 2024", verified: true, status: "active", tradeCount: 31, documentType: "FPO Certificate", documentId: "U01111MP2024PTC012345" },
  { id: "demo-farmer-rajesh", name: "Rajesh Pawar", role: "farmer", location: "Sehore, MP", phone: "9425099881", joinedDate: "20 Aug 2026", verified: false, status: "pending_verification", tradeCount: 1, documentType: "Aadhaar & Khasra", documentId: "MP-KHS-2026-8812" },
  { id: "demo-buyer-bhopal", name: "Vikram Singh (Bhopal Solvex)", role: "buyer", location: "Mandideep, MP", phone: "9893012345", joinedDate: "10 Feb 2025", verified: true, status: "active", tradeCount: 29, documentType: "GSTIN Certificate", documentId: "23BBBCD5678F1Z2" },
];

export const demoAdminDisputes: AdminDisputeCase[] = [
  { id: "DSP-401", orderNumber: "FN-DEAL-27902", dealId: "FN-DEAL-27902", crop: "Soybean", parties: "Suresh Patidar vs Ujjain Solvex", raisedBy: "Suresh Patidar", against: "Ujjain Solvex", reason: "Discrepancy in recorded moisture percentage (11.4% field vs 12.8% factory gate)", amount: 48200, disputedAmount: 48200, status: "Under Review", filedDate: "28 Aug 2026", createdAt: "28 Aug 2026" },
  { id: "DSP-398", orderNumber: "FN-DEAL-26810", dealId: "FN-DEAL-26810", crop: "Wheat", parties: "Kisan Morcha FPO vs Malwa Flour", raisedBy: "Kisan Morcha FPO", against: "Malwa Flour", reason: "Transporter delay of 48 hours causing demurrage charges", amount: 15400, disputedAmount: 15400, status: "Resolved", filedDate: "12 Jul 2026", createdAt: "12 Jul 2026" },
];

export function getDemoProfile(id: string) {
  return demoProfiles.find((profile) => profile.id === id) || demoProfiles[0];
}

export function getDemoListing(id: string) {
  return demoListings.find((listing) => listing.id === id) || demoListings[0];
}

export function getDemoDemand(id: string) {
  return demoDemands.find((demand) => demand.id === id) || demoDemands[0];
}

export function getDemoAgreement(id: string) {
  return demoAgreements.find((agreement) => agreement.id === id) || demoAgreements[0];
}

export function getDemoPost(id: string) {
  return demoPosts.find((post) => post.id === id) || demoPosts[0];
}

export function getDemoConversation(id: string) {
  return demoConversations.find((conversation) => conversation.id === id) || demoConversations[0];
}
