import { REAL_ACCOUNTS_20, convertAccountToUserProfile, convertAccountToDemoProfile } from "./userDirectory";
export { REAL_ACCOUNTS_20 };
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
  hasLiked?: boolean;
  isVerified?: boolean;
  mediaUrl?: string;
  targetPrice?: string;
  quantitySpec?: string;
  actionText?: string;
  actionHref?: string;
  images?: string[];
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
  type: "interest" | "response" | "logistics" | "payment" | "market" | "network" | "trade";
  title: string;
  description: string;
  createdAt: string;
  href: string;
  unread: boolean;
  userId?: string; // optional for real-user notifications
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
  profileHandle?: string;
  memberSince?: string;
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
  connectionsCount?: number;
  certifications?: string[];
  reviews?: { author: string; role: string; comment: string; rating: number; date: string }[];
  avatarUrl?: string;
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  requesterName: string;
  requesterRole: string;
  requesterLocation: string;
  requesterAvatar?: string;
  requesterAvatarUrl?: string;
  recipientName: string;
  recipientRole: string;
  recipientLocation: string;
  recipientAvatar?: string;
  recipientAvatarUrl?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
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
  crop: "c0000000-0000-0000-0000-000000000001" | "c0000000-0000-0000-0000-000000000002" | "c0000000-0000-0000-0000-000000000003";
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
  crop_id?: string;
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
  farmer: convertAccountToUserProfile(REAL_ACCOUNTS_20[0]), // Ramesh Patel
  fpo: convertAccountToUserProfile(REAL_ACCOUNTS_20[8]),    // Malwa Kisan Samriddhi FPO
  buyer: convertAccountToUserProfile(REAL_ACCOUNTS_20[12]), // Anita Sharma (Agrocorp)
  consumer: convertAccountToUserProfile(REAL_ACCOUNTS_20[19]), // Meera Joshi
  admin: convertAccountToUserProfile(REAL_ACCOUNTS_20[21]), // Platform Admin
  expert: convertAccountToUserProfile(REAL_ACCOUNTS_20[17]), // Dr. Kavita Rao
};

export const demoProfiles: DemoProfile[] = REAL_ACCOUNTS_20.map(convertAccountToDemoProfile);

export const demoListings: CropListing[] = [
  {
    id: "demo-lot-fn-28492",
    farmer_id: "f0000000-0000-0000-0000-000000000001",
    farmer_name: "Ramesh Patel",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity: 250,
    quality_grade: "Grade A",
    moisture_percent: 11.2,
    harvest_date: "2026-08-27",
    availability_date: "2026-09-05",
    location: "Sanwer, Indore, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    expected_price: 5280,
    pickup_preference: "Buyer pickup",
    payment_preference: "Within 2 days",
    status: "listed",
    created_at: "2026-09-03T06:30:00.000Z",
  },
  {
    id: "demo-lot-cotton-devendra",
    farmer_id: "f0000000-0000-0000-0000-000000000002",
    farmer_name: "Devendra Mandloi",
    crop_id: "c0000000-0000-0000-0000-000000000003",
    quantity: 180,
    quality_grade: "Grade A (29mm Staple)",
    moisture_percent: 8.2,
    harvest_date: "2026-08-25",
    availability_date: "2026-09-06",
    location: "Kasrawad, Khargone, Madhya Pradesh",
    lat: 21.8234,
    lng: 75.6179,
    expected_price: 7150,
    pickup_preference: "Either",
    payment_preference: "Immediate",
    status: "listed",
    created_at: "2026-09-02T08:45:00.000Z",
  },
  {
    id: "demo-lot-garlic-sunita",
    farmer_id: "f0000000-0000-0000-0000-000000000003",
    farmer_name: "Sunita Verma",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity: 180,
    quality_grade: "Organic Grade A (Amleta)",
    moisture_percent: 10.8,
    harvest_date: "2026-08-25",
    availability_date: "2026-09-06",
    location: "Sonkatch, Dewas, Madhya Pradesh",
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
    farmer_id: "f0000000-0000-0000-0000-000000000004",
    farmer_name: "Rajesh Pawar",
    crop_id: "c0000000-0000-0000-0000-000000000002",
    quantity: 420,
    quality_grade: "Grade B (Lokwan)",
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
    id: "demo-lot-onion-mukesh",
    farmer_id: "f0000000-0000-0000-0000-000000000005",
    farmer_name: "Mukesh Choudhary",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity: 210,
    quality_grade: "Certified Seed Grade",
    moisture_percent: 10.5,
    harvest_date: "2026-08-28",
    availability_date: "2026-09-06",
    location: "Tarana, Ujjain, Madhya Pradesh",
    lat: 23.1765,
    lng: 75.7885,
    expected_price: 5380,
    pickup_preference: "Buyer pickup",
    payment_preference: "Immediate",
    status: "listed",
    created_at: "2026-09-01T14:10:00.000Z",
  },
  {
    id: "demo-lot-mustard-vikram",
    farmer_id: "f0000000-0000-0000-0000-000000000006",
    farmer_name: "Vikram Singh Solanki",
    crop_id: "Mustard",
    quantity: 340,
    quality_grade: "Pusa Mustard (41.8% Oil)",
    moisture_percent: 7.9,
    harvest_date: "2026-04-18",
    availability_date: "2026-09-09",
    location: "Chambal Valley, Kota, Rajasthan",
    lat: 25.2138,
    lng: 75.8648,
    expected_price: 6100,
    pickup_preference: "Either",
    payment_preference: "Within 3 days",
    status: "listed",
    created_at: "2026-08-30T11:00:00.000Z",
  },
  {
    id: "demo-lot-garlic-balram",
    farmer_id: "f0000000-0000-0000-0000-000000000007",
    farmer_name: "Balram Patidar",
    crop_id: "Garlic",
    quantity: 140,
    quality_grade: "Export Grade G2 (50mm+)",
    moisture_percent: 6.8,
    harvest_date: "2026-08-20",
    availability_date: "2026-09-07",
    location: "Daloda, Mandsaur, Madhya Pradesh",
    lat: 24.0722,
    lng: 75.0689,
    expected_price: 14200,
    pickup_preference: "Buyer pickup",
    payment_preference: "Immediate",
    status: "listed",
    created_at: "2026-08-29T12:30:00.000Z",
  },
  {
    id: "demo-lot-moong-anil",
    farmer_id: "f0000000-0000-0000-0000-000000000008",
    farmer_name: "Anil Dhangar",
    crop_id: "Moong",
    quantity: 260,
    quality_grade: "Summer Moong Grade 1",
    moisture_percent: 9.4,
    harvest_date: "2026-07-22",
    availability_date: "2026-09-08",
    location: "Timarni, Harda, Madhya Pradesh",
    lat: 22.3444,
    lng: 77.0982,
    expected_price: 8450,
    pickup_preference: "Buyer pickup",
    payment_preference: "Immediate",
    status: "listed",
    created_at: "2026-08-28T09:15:00.000Z",
  },
];

export const demoDemands: DemandPost[] = [
  {
    id: "demo-demand-agrocorp-500",
    buyer_id: "b0000000-0000-0000-0000-000000000001",
    buyer_name: "Anita Sharma (Agrocorp)",
    business_name: "Agrocorp Central Processing Pvt Ltd",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity_needed: 500,
    quality_grade: "Grade A",
    moisture_max: 12,
    offered_price: 5350,
    payment_terms: "Within 1 day",
    location: "Dewas Industrial Area, Madhya Pradesh",
    lat: 22.9676,
    lng: 76.0534,
    created_at: "2026-09-03T07:10:00.000Z",
  },
  {
    id: "demo-demand-bhopal-300",
    buyer_id: "b0000000-0000-0000-0000-000000000002",
    buyer_name: "Vikram Singh (Bhopal Solvex)",
    business_name: "Bhopal Solvex & Oils Ltd",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity_needed: 300,
    quality_grade: "Grade A",
    moisture_max: 12,
    offered_price: 5480,
    payment_terms: "Within 3 days",
    location: "Mandideep Industrial Estate, Bhopal, MP",
    lat: 23.0722,
    lng: 77.5255,
    created_at: "2026-09-02T11:00:00.000Z",
  },
  {
    id: "demo-demand-ujjain-150",
    buyer_id: "b0000000-0000-0000-0000-000000000003",
    buyer_name: "Suresh Singhal (Mahakal Feeds)",
    business_name: "Mahakal Feeds & Grain Mandi Hub",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity_needed: 150,
    quality_grade: "Grade B",
    moisture_max: 13,
    offered_price: 5290,
    payment_terms: "Immediate",
    location: "Ujjain Grain Market, Madhya Pradesh",
    lat: 23.1765,
    lng: 75.7885,
    created_at: "2026-09-01T09:30:00.000Z",
  },
  {
    id: "demo-demand-wheat-sehore",
    buyer_id: "b0000000-0000-0000-0000-000000000004",
    buyer_name: "Kailash Agarwal (Malwa Flour)",
    business_name: "Malwa Roller Flour Mills Ltd",
    crop_id: "c0000000-0000-0000-0000-000000000002",
    quantity_needed: 600,
    quality_grade: "Grade B (Lokwan/Sharbati)",
    moisture_max: 12,
    offered_price: 2480,
    payment_terms: "Within 1 day",
    location: "Pithampur Sector 3, Dhar, MP",
    lat: 22.6139,
    lng: 75.6822,
    created_at: "2026-08-31T12:00:00.000Z",
  },
  {
    id: "demo-demand-deccan-spices",
    buyer_id: "b0000000-0000-0000-0000-000000000005",
    buyer_name: "Rajiv Mehra (Deccan Spices)",
    business_name: "Deccan Spice & Commodity Exporters",
    crop_id: "Garlic",
    quantity_needed: 250,
    quality_grade: "Export Grade G2",
    moisture_max: 8,
    offered_price: 14200,
    payment_terms: "Within 2 days",
    location: "Neemuch Mandi Hub, Madhya Pradesh",
    lat: 24.4739,
    lng: 74.8703,
    created_at: "2026-08-30T10:00:00.000Z",
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
    crop_id: "c0000000-0000-0000-0000-000000000001",
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
    crop_id: "c0000000-0000-0000-0000-000000000001",
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
    crop_id: "c0000000-0000-0000-0000-000000000001",
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
    listing_id: "demo-lot-fn-28492",
    demand_id: "demo-demand-agrocorp-500",
    farmer_id: "f0000000-0000-0000-0000-000000000001",
    farmer_name: "Ramesh Patel",
    buyer_id: "b0000000-0000-0000-0000-000000000001",
    buyer_name: "Anita Sharma (Agrocorp)",
    crop_id: "c0000000-0000-0000-0000-000000000001",
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
    id: "demo-deal-fn-28514",
    orderNumber: "FN-DEAL-28514",
    match_id: "demo-match-cotton-1",
    listing_id: "demo-lot-cotton-devendra",
    demand_id: "demo-demand-deccan-spices",
    farmer_id: "f0000000-0000-0000-0000-000000000002",
    farmer_name: "Devendra Mandloi",
    buyer_id: "b0000000-0000-0000-0000-000000000005",
    buyer_name: "Rajiv Mehra (Deccan Spices)",
    crop_id: "c0000000-0000-0000-0000-000000000003",
    quantity: 180,
    price_per_quintal: 7150,
    delivery_date: "2026-09-06",
    status: "in_transit",
    pickupLocation: "Mandloi Agro Farm, Kasrawad, Khargone, MP",
    deliveryDestination: "Deccan Export Processing Unit, Neemuch Mandi Hub, MP",
    transporterName: "Nimar Shahi Freight Carrier",
    vehicleNumber: "MP-10-CB-4491",
    driverName: "Sandeep Patidar",
    driverPhone: "+91 98263 99812",
    earnings_breakdown: {
      gross_produce_value: 1287000,
      logistics_cost_deduction: 32400,
      platform_fee: 7800,
      net_farmer_earnings: 1246800,
    },
    documents: [
      { id: "doc-agr-03", name: "Long-Staple Cotton Supply Contract #28514.pdf", type: "agreement", date: "1 Sep 2026", fileSize: "204 KB", status: "verified" },
      { id: "doc-assay-03", name: "29mm Staple Fiber Test & Moisture Report.pdf", type: "quality", date: "2 Sep 2026", fileSize: "248 KB", status: "verified" },
      { id: "doc-weigh-03", name: "Kasrawad Mandi Electronic Weigh Slip.pdf", type: "weighbridge", date: "4 Sep 2026", fileSize: "162 KB", status: "verified" },
      { id: "doc-del-03", name: "E-Way Bill & Gate Dispatch Pass.pdf", type: "delivery", date: "4 Sep 2026", fileSize: "190 KB", status: "verified" },
    ],
    dispute: { hasDispute: false },
    created_at: "2026-09-01T11:15:00.000Z",
  },
  {
    id: "demo-deal-fn-28460",
    orderNumber: "FN-DEAL-28460",
    match_id: "demo-match-garlic-sunita",
    listing_id: "demo-lot-garlic-sunita",
    demand_id: "demo-demand-bhopal-solvex",
    farmer_id: "f0000000-0000-0000-0000-000000000003",
    farmer_name: "Sunita Verma",
    buyer_id: "b0000000-0000-0000-0000-000000000002",
    buyer_name: "Vikram Singh (Bhopal Solvex)",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity: 180,
    price_per_quintal: 5480,
    delivery_date: "2026-09-04",
    status: "payment_confirmed",
    pickupLocation: "Sonkatch Organic Cluster, Dewas, MP",
    deliveryDestination: "Mandideep Industrial Estate, Bhopal Solvex, MP",
    transporterName: "Bhopal Central Logistics",
    vehicleNumber: "MP-04-HE-7712",
    driverName: "Ramswaroop Gurjar",
    driverPhone: "+91 94250 81290",
    earnings_breakdown: {
      gross_produce_value: 986400,
      logistics_cost_deduction: 18000,
      platform_fee: 5900,
      net_farmer_earnings: 962500,
    },
    documents: [
      { id: "doc-agr-04", name: "Organic Soybean Trade Agreement.pdf", type: "agreement", date: "28 Aug 2026", fileSize: "195 KB", status: "verified" },
      { id: "doc-assay-04", name: "Zero Chemical Residue Lab Certificate.pdf", type: "quality", date: "29 Aug 2026", fileSize: "276 KB", status: "verified" },
      { id: "doc-weigh-04", name: "Dewas Hub Weighbridge Slip (18.0 MT).pdf", type: "weighbridge", date: "2 Sep 2026", fileSize: "148 KB", status: "verified" },
      { id: "doc-del-04", name: "Consignment Acceptance Proof.pdf", type: "delivery", date: "3 Sep 2026", fileSize: "172 KB", status: "verified" },
      { id: "doc-pay-04", name: "Escrow NEFT Settlement #AXIS8841029.pdf", type: "payment", date: "4 Sep 2026", fileSize: "135 KB", status: "verified" },
    ],
    dispute: { hasDispute: false },
    created_at: "2026-08-28T09:40:00.000Z",
  },
  {
    id: "demo-deal-fn-28533",
    orderNumber: "FN-DEAL-28533",
    match_id: "demo-match-fpo-pooled",
    listing_id: "demo-lot-fpo-malwa-740",
    demand_id: "demo-demand-agrocorp-500",
    farmer_id: "fpo00000-0000-0000-0000-000000000001",
    farmer_name: "Malwa Kisan Samriddhi FPO",
    buyer_id: "b0000000-0000-0000-0000-000000000001",
    buyer_name: "Anita Sharma (Agrocorp)",
    crop_id: "c0000000-0000-0000-0000-000000000001",
    quantity: 500,
    price_per_quintal: 5360,
    delivery_date: "2026-09-09",
    status: "trade_confirmed",
    pickupLocation: "Rau FPO Collection Center, Indore, MP",
    deliveryDestination: "Agrocorp Processing Plant 1, Dewas, MP",
    transporterName: "Interstate Agri Fleet",
    vehicleNumber: "MP-09-KA-9901",
    driverName: "Balwant Singh",
    driverPhone: "+91 98268 44219",
    earnings_breakdown: {
      gross_produce_value: 2680000,
      logistics_cost_deduction: 41000,
      platform_fee: 16000,
      net_farmer_earnings: 2623000,
    },
    documents: [
      { id: "doc-agr-05", name: "FPO Institutional Master Agreement.pdf", type: "agreement", date: "2 Sep 2026", fileSize: "230 KB", status: "verified" },
      { id: "doc-assay-05", name: "Composite Lot Assay (10.9% Moisture).pdf", type: "quality", date: "2 Sep 2026", fileSize: "215 KB", status: "verified" },
    ],
    dispute: { hasDispute: false },
    created_at: "2026-09-02T14:10:00.000Z",
  },
  {
    id: "demo-deal-fn-28310",
    orderNumber: "FN-DEAL-28310",
    match_id: "demo-match-prev",
    listing_id: "demo-lot-old",
    demand_id: "demo-demand-old",
    farmer_id: "f0000000-0000-0000-0000-000000000001",
    farmer_name: "Ramesh Patel",
    buyer_id: "b0000000-0000-0000-0000-000000000004",
    buyer_name: "Kailash Agarwal (Malwa Flour)",
    crop_id: "c0000000-0000-0000-0000-000000000002",
    quantity: 420,
    price_per_quintal: 2450,
    delivery_date: "2026-07-14",
    status: "completed",
    pickupLocation: "Ramesh Patel Farm, Sanwer, Indore, MP",
    deliveryDestination: "Malwa Roller Flour Mills Unit 1, Pithampur, MP",
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
  {
    id: "demo-deal-fn-28555",
    orderNumber: "FN-DEAL-28555",
    match_id: "demo-match-garlic-mandsaur",
    listing_id: "demo-lot-garlic-balram",
    demand_id: "demo-demand-deccan-spices",
    farmer_id: "f0000000-0000-0000-0000-000000000007",
    farmer_name: "Balram Patidar",
    buyer_id: "b0000000-0000-0000-0000-000000000005",
    buyer_name: "Rajiv Mehra (Deccan Spices)",
    crop_id: "Garlic",
    quantity: 140,
    price_per_quintal: 14200,
    delivery_date: "2026-09-12",
    status: "matched",
    pickupLocation: "Patidar Agro Yard, Daloda, Mandsaur, MP",
    deliveryDestination: "Deccan Export Hub, Neemuch Mandi, MP",
    transporterName: "Mandsaur Quick Freight",
    vehicleNumber: "MP-14-GA-1102",
    driverName: "Dinesh Patidar",
    driverPhone: "+91 94251 77319",
    earnings_breakdown: {
      gross_produce_value: 1988000,
      logistics_cost_deduction: 28000,
      platform_fee: 12000,
      net_farmer_earnings: 1948000,
    },
    documents: [
      { id: "doc-agr-06", name: "Export Garlic Forward Quote.pdf", type: "agreement", date: "4 Sep 2026", fileSize: "178 KB", status: "verified" },
    ],
    dispute: { hasDispute: false },
    created_at: "2026-09-04T10:15:00.000Z",
  },
];

export const demoPosts: NetworkPost[] = [
  {
    id: "post-net-01",
    user_id: "f0000000-0000-0000-0000-000000000001",
    author_name: "Ramesh Patel",
    author_role: "farmer",
    tag: "market",
    topic: "harvest",
    content: "Soybean harvest started today across our Sanwer fields. Moisture is holding steady at 11.2% after morning drying. Total available produce is 250Q Grade A (JS-9560). Looking for buyers with direct farm-gate pickup this week.",
    expert_verified: false,
    replies: [
      {
        id: "rep-01",
        post_id: "post-net-01",
        author_id: "fpo00000-0000-0000-0000-000000000001",
        author_name: "Malwa Kisan Samriddhi FPO",
        author_role: "fpo",
        content: "Rau collection center has calibrated electronic weighing bays open starting 6 September. Contact the pool manager to group with our 740Q lot.",
        created_at: "2026-09-03T08:10:00.000Z",
      },
      {
        id: "rep-02",
        post_id: "post-net-01",
        author_id: "b0000000-0000-0000-0000-000000000001",
        author_name: "Anita Sharma (Agrocorp)",
        author_role: "buyer",
        content: "We have an open procurement contract for 500Q Grade A soybean at ₹5,350/q. Dedicated truck can be scheduled within 48 hours with direct farm gate pickup.",
        created_at: "2026-09-03T08:35:00.000Z",
      },
    ],
    created_at: "2026-09-03T07:45:00.000Z",
    location: "Indore, Madhya Pradesh",
    reactions: 32,
    comments: 2,
    quantitySpec: "250Q Available",
    actionText: "View Produce Lot",
    actionHref: "/marketplace/listings/demo-lot-fn-28492",
  },
  {
    id: "post-net-02",
    user_id: "f0000000-0000-0000-0000-000000000002",
    author_name: "Devendra Mandloi",
    author_role: "farmer",
    tag: "market",
    topic: "market",
    content: "First picking of DCH-32 Bt Cotton completed in Kasrawad. Staple length tested at 29mm with zero trash content. 180 Quintals ready at farm ginning bay. Any buyers picking up from Nimar corridor?",
    expert_verified: false,
    replies: [
      {
        id: "rep-03",
        post_id: "post-net-02",
        author_id: "b0000000-0000-0000-0000-000000000005",
        author_name: "Rajiv Mehra (Deccan Spices)",
        author_role: "buyer",
        content: "Devendra ji, our export mill is offering ₹7,150/q for 29mm staple. Sending our quality inspector to your Kasrawad farm tomorrow morning.",
        created_at: "2026-09-03T09:15:00.000Z",
      },
      {
        id: "rep-04",
        post_id: "post-net-02",
        author_id: "exp00000-0000-0000-0000-000000000002",
        author_name: "Dr. B. L. Meena",
        author_role: "expert",
        content: "Excellent staple quality Devendra ji. Ensure moisture remains below 8.5% before packing in cotton tarpaulins to avoid lint discoloration.",
        created_at: "2026-09-03T10:00:00.000Z",
      },
    ],
    created_at: "2026-09-03T08:30:00.000Z",
    location: "Khargone, Madhya Pradesh",
    reactions: 27,
    comments: 2,
    quantitySpec: "180Q Ready",
    actionText: "View Cotton Lot",
    actionHref: "/marketplace",
  },
  {
    id: "post-net-03",
    user_id: "b0000000-0000-0000-0000-000000000001",
    author_name: "Anita Sharma (Agrocorp)",
    author_role: "buyer",
    tag: "market",
    topic: "procurement",
    content: "COMMERCIAL PROCUREMENT TENDER: Agrocorp Dewas plant requires 500Q Grade A soybean. Moisture max 12%, oil content minimum 18.5%. Rate: ₹5,350/q with buyer-provided freight. Direct escrow settlement within 24 hours of weighbridge confirmation.",
    expert_verified: false,
    replies: [
      {
        id: "rep-05",
        post_id: "post-net-03",
        author_id: "f0000000-0000-0000-0000-000000000001",
        author_name: "Ramesh Patel",
        author_role: "farmer",
        content: "I have 250Q ready in Sanwer at 11.2% moisture. Initiated trade agreement on platform.",
        created_at: "2026-09-03T09:00:00.000Z",
      },
      {
        id: "rep-06",
        post_id: "post-net-03",
        author_id: "fpo00000-0000-0000-0000-000000000001",
        author_name: "Malwa Kisan Samriddhi FPO",
        author_role: "fpo",
        content: "We can fulfill the remaining 250Q from our Rau hub. Sending composite moisture assay now.",
        created_at: "2026-09-03T09:25:00.000Z",
      },
    ],
    created_at: "2026-09-03T06:50:00.000Z",
    location: "Dewas Industrial Area, Madhya Pradesh",
    reactions: 48,
    comments: 4,
    targetPrice: "₹5,350/q",
    quantitySpec: "500Q Needed",
    actionText: "View Requirement",
    actionHref: "/marketplace/requirements/demo-demand-agrocorp-500",
  },
  {
    id: "post-net-04",
    user_id: "exp00000-0000-0000-0000-000000000001",
    author_name: "Dr. Kavita Rao",
    author_role: "expert",
    tag: "expert_verified",
    topic: "expert",
    content: "AGRONOMY ADVISORY (ICAR / JNKVV): For soybean stored beyond 7 days, recheck moisture before consignment dispatch. If moisture exceeds 12%, solvent processors will apply a ₹40/q deduction for weight loss during crushing. Keep bagged lots elevated on wooden pallets to prevent dampness migration from concrete floors.",
    expert_verified: true,
    replies: [
      {
        id: "rep-07",
        post_id: "post-net-04",
        author_id: "f0000000-0000-0000-0000-000000000004",
        author_name: "Rajesh Pawar",
        author_role: "farmer",
        content: "Dr. Kavita, does afternoon sun-drying for 3 hours impact oil percentage or germination capacity if sold as certified seed later?",
        created_at: "2026-09-02T16:20:00.000Z",
      },
      {
        id: "rep-08",
        post_id: "post-net-04",
        author_id: "exp00000-0000-0000-0000-000000000001",
        author_name: "Dr. Kavita Rao",
        author_role: "expert",
        content: "Rajesh ji, 3 hours of moderate afternoon aeration is safe if spread thinly (< 5cm depth) on clean tarpaulins. Avoid mid-day concrete exposure exceeding 42°C surface temperature.",
        created_at: "2026-09-02T17:05:00.000Z",
      },
    ],
    created_at: "2026-09-02T14:15:00.000Z",
    location: "College of Agriculture, Indore, MP",
    reactions: 74,
    comments: 5,
    actionText: "Consult Dr. Kavita",
    actionHref: "/network",
  },
  {
    id: "post-net-05",
    user_id: "f0000000-0000-0000-0000-000000000003",
    author_name: "Sunita Verma",
    author_role: "farmer",
    tag: "market",
    topic: "harvest",
    content: "Harvested 15 acres of Amleta white garlic and organic JS-9560 soybean in Sonkatch. Graded bulb size: 45mm–55mm. 100% natural shade cured with zero sulfur treatment. NPOP organic certification report attached.",
    expert_verified: false,
    replies: [
      {
        id: "rep-09",
        post_id: "post-net-05",
        author_id: "fpo00000-0000-0000-0000-000000000003",
        author_name: "Chamunda Mahila Kisan FPC",
        author_role: "fpo",
        content: "Sunita didi, our Sonkatch warehouse sorting line has booked your lot for the direct APEDA exporter shipment on Thursday.",
        created_at: "2026-09-02T11:40:00.000Z",
      },
      {
        id: "rep-10",
        post_id: "post-net-05",
        author_id: "con00000-0000-0000-0000-000000000001",
        author_name: "Meera Joshi",
        author_role: "consumer",
        content: "Can individual households in Indore place retail orders for this certified organic garlic? We buy in bulk for community kitchens.",
        created_at: "2026-09-02T12:10:00.000Z",
      },
    ],
    created_at: "2026-09-02T09:10:00.000Z",
    location: "Dewas, Madhya Pradesh",
    reactions: 39,
    comments: 3,
    quantitySpec: "180Q Graded",
    actionText: "View Organic Lot",
    actionHref: "/marketplace",
  },
  {
    id: "post-net-06",
    user_id: "fpo00000-0000-0000-0000-000000000001",
    author_name: "Malwa Kisan Samriddhi FPO",
    author_role: "fpo",
    tag: "market",
    topic: "market",
    images: ["https://images.unsplash.com/photo-1592982537447-6f296d1eb258?auto=format&fit=crop&q=80&w=400"],
    content: "FPO COLLECTIVE DISPATCH: We have aggregated 740Q of Grade A soybean across 4 member clusters at our Rau center. Electronic weighbridge testing calibrated with 10.9% average moisture. Institutional millers can tender for direct dispatch.",
    expert_verified: false,
    replies: [
      {
        id: "rep-11",
        post_id: "post-net-06",
        author_id: "b0000000-0000-0000-0000-000000000002",
        author_name: "Vikram Singh (Bhopal Solvex)",
        author_role: "buyer",
        content: "Interested in 300Q of this pooled lot. What is the average oil content from your composite lab assay?",
        created_at: "2026-09-02T12:45:00.000Z",
      },
    ],
    created_at: "2026-09-02T10:30:00.000Z",
    location: "Rau Collection Center, Indore, MP",
    reactions: 52,
    comments: 3,
    quantitySpec: "740Q Pooled",
    actionText: "Inspect Pooled Lot",
    actionHref: "/fpo",
  },
  {
    id: "post-net-07",
    user_id: "b0000000-0000-0000-0000-000000000004",
    author_name: "Kailash Agarwal (Malwa Flour)",
    author_role: "buyer",
    tag: "market",
    topic: "procurement",
    content: "DIRECT WHEAT PROCUREMENT: Sourcing 1,000 MT of pure Lokwan and Sharbati Wheat for our Pithampur flour milling unit. Moisture < 11.5%, minimum hectolitre weight 78 kg/hl. Immediate digital payments within 12 hours of unloading.",
    expert_verified: false,
    replies: [
      {
        id: "rep-12",
        post_id: "post-net-07",
        author_id: "f0000000-0000-0000-0000-000000000004",
        author_name: "Rajesh Pawar",
        author_role: "farmer",
        content: "Kailash ji, I have 420Q pneumatic-threshed Lokwan wheat stored at Sehore warehouse. Purity tested 99.2%. Rate quote submitted.",
        created_at: "2026-09-01T14:30:00.000Z",
      },
    ],
    created_at: "2026-09-01T11:20:00.000Z",
    location: "Pithampur Sector 3, Dhar, MP",
    reactions: 41,
    comments: 2,
    targetPrice: "₹2,480/q",
    quantitySpec: "1,000 MT Needed",
    actionText: "Send Offer",
    actionHref: "/marketplace",
  },
  {
    id: "post-net-08",
    user_id: "f0000000-0000-0000-0000-000000000007",
    author_name: "Balram Patidar",
    author_role: "farmer",
    tag: "market",
    topic: "harvest",
    content: "Mandsaur mandi season opening: 140 Quintals of Export Quality G2 Garlic sorted and packed in 50kg aerated mesh bags. Average bulb diameter 50mm+. Direct farm-gate pickup available near Daloda toll plaza.",
    expert_verified: false,
    replies: [
      {
        id: "rep-13",
        post_id: "post-net-08",
        author_id: "b0000000-0000-0000-0000-000000000005",
        author_name: "Rajiv Mehra (Deccan Spices)",
        author_role: "buyer",
        content: "Balram ji, we are exporting two containers to Dubai this week. We offer ₹14,200/q for G2 specification with weighbridge payment upon loading.",
        created_at: "2026-09-01T16:10:00.000Z",
      },
    ],
    created_at: "2026-09-01T13:00:00.000Z",
    location: "Mandsaur, Madhya Pradesh",
    reactions: 36,
    comments: 3,
    quantitySpec: "140Q Export Grade",
    actionText: "View Garlic Lot",
    actionHref: "/marketplace",
  },
  {
    id: "post-net-09",
    user_id: "f0000000-0000-0000-0000-000000000004",
    author_name: "Rajesh Pawar",
    author_role: "farmer",
    tag: "machinery",
    topic: "machinery",
    content: "CUSTOM HIRING ALERT: John Deere 5050D tractor with high-capacity pneumatic thresher available for custom hire in Sehore and Ashta tehsils starting Monday. High recovery rate with under 0.8% grain breakage. ₹1,400/hour with trained operator.",
    expert_verified: false,
    replies: [
      {
        id: "rep-14",
        post_id: "post-net-09",
        author_id: "f0000000-0000-0000-0000-000000000008",
        author_name: "Anil Dhangar",
        author_role: "farmer",
        content: "Rajesh bhai, can you schedule 2 days for our summer moong threshing near Harda border?",
        created_at: "2026-09-01T17:20:00.000Z",
      },
    ],
    created_at: "2026-09-01T15:00:00.000Z",
    location: "Sehore & Ashta, Madhya Pradesh",
    reactions: 23,
    comments: 2,
    targetPrice: "₹1,400/hr",
    actionText: "Book Machine",
    actionHref: "/network",
  },
  {
    id: "post-net-10",
    user_id: "b0000000-0000-0000-0000-000000000003",
    author_name: "Suresh Singhal (Mahakal Feeds)",
    author_role: "buyer",
    tag: "market",
    topic: "procurement",
    content: "POULTRY & FEED PROCUREMENT: Procuring 150 MT high-protein coarse grains and broken pulses (Gram, Maize, Soybean grits) at Ujjain Mandi hub. Daily processing capacity 600 MT. Immediate digital cash settlement upon electronic weighment.",
    expert_verified: false,
    replies: [],
    created_at: "2026-08-31T10:45:00.000Z",
    location: "Ujjain Grain Market, Madhya Pradesh",
    reactions: 31,
    comments: 1,
    targetPrice: "₹5,290/q",
    quantitySpec: "150 MT Needed",
    actionText: "View Tender",
    actionHref: "/marketplace",
  },
  {
    id: "post-net-11",
    user_id: "fpo00000-0000-0000-0000-000000000002",
    author_name: "Narmada Valley Farmers Producer Co",
    author_role: "fpo",
    tag: "market",
    topic: "market",
    content: "NABARD SUPPORTED POOLING: 520 member farmers of Narmada Valley FPC have aggregated 320 MT of prime Summer Moong (green gram) at Harda central warehouse. Cleaned on modern gravity separators. Mandi millers and FMCG packaging firms can place bulk bids.",
    expert_verified: false,
    replies: [
      {
        id: "rep-15",
        post_id: "post-net-11",
        author_id: "b0000000-0000-0000-0000-000000000001",
        author_name: "Anita Sharma (Agrocorp)",
        author_role: "buyer",
        content: "Our pulse processing division can take 150 MT. We will send our logistics team for moisture inspection on Friday.",
        created_at: "2026-08-31T14:10:00.000Z",
      },
    ],
    created_at: "2026-08-31T09:15:00.000Z",
    location: "Harda & Hoshangabad, Madhya Pradesh",
    reactions: 44,
    comments: 2,
    quantitySpec: "320 MT Pooled",
    actionText: "View FPO Pool",
    actionHref: "/fpo",
  },
  {
    id: "post-net-12",
    user_id: "exp00000-0000-0000-0000-000000000002",
    author_name: "Dr. B. L. Meena",
    author_role: "expert",
    tag: "expert_verified",
    topic: "expert",
    content: "SOIL HEALTH & MICRONUTRIENT ALERT: Post-monsoon soil test samples across Chambal and Malwa belts show zinc and sulfur depletion in continuous soybean-wheat cycles. Applying 25 kg/ha Zinc Sulfate during land prep will boost oil content by up to 2.2% in upcoming Rabi mustard.",
    expert_verified: true,
    replies: [
      {
        id: "rep-16",
        post_id: "post-net-12",
        author_id: "f0000000-0000-0000-0000-000000000006",
        author_name: "Vikram Singh Solanki",
        author_role: "farmer",
        content: "Thank you Dr. Meena. Should we broadcast zinc before pre-sowing irrigation or mix with basal DAP?",
        created_at: "2026-08-30T16:50:00.000Z",
      },
    ],
    created_at: "2026-08-30T15:00:00.000Z",
    location: "Agriculture University, Kota, Rajasthan",
    reactions: 68,
    comments: 4,
    actionText: "Ask Dr. Meena",
    actionHref: "/network",
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
      crop: "c0000000-0000-0000-0000-000000000001",
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
      crop: "c0000000-0000-0000-0000-000000000001",
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
    href: "/deals/demo-deal-fn-28492",
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
    href: "/buyer/requirements/rfq-1008",
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
  { id: "m-ramesh", name: "Ramesh Patel", verified: true, village: "Sanwer", phone: "9876543210", crops: ["c0000000-0000-0000-0000-000000000001", "c0000000-0000-0000-0000-000000000002"], availableQuantity: 250, deliveredQuantity: 680, pendingQuantity: 250, joinedDate: "Jan 2024" },
  { id: "m-sunita", name: "Sunita Verma", verified: true, village: "Dewas Road", phone: "9826011223", crops: ["c0000000-0000-0000-0000-000000000001"], availableQuantity: 180, deliveredQuantity: 420, pendingQuantity: 180, joinedDate: "Mar 2024" },
  { id: "m-rajesh", name: "Rajesh Pawar", verified: false, village: "Depalpur", phone: "9425099881", crops: ["c0000000-0000-0000-0000-000000000002", "Onion"], availableQuantity: 420, deliveredQuantity: 310, pendingQuantity: 420, joinedDate: "Aug 2024" },
  { id: "m-anil", name: "Anil Jat", verified: true, village: "Rau", phone: "9827055443", crops: ["c0000000-0000-0000-0000-000000000001", "c0000000-0000-0000-0000-000000000002"], availableQuantity: 310, deliveredQuantity: 510, pendingQuantity: 90, joinedDate: "Feb 2024" },
  { id: "m-kailash", name: "Kailash Solanki", verified: true, village: "Manpur", phone: "9977012345", crops: ["Cotton", "Gram"], availableQuantity: 190, deliveredQuantity: 280, pendingQuantity: 190, joinedDate: "May 2024" },
];

export const demoSupplyLots: FpoSupplyLot[] = [
  { id: "pool-soy-01", crop: "c0000000-0000-0000-0000-000000000001", quantity: 740, quality: "Grade A", moisture: "10.8–11.6%", members: 4, collectionCenter: "Rau Collection Center", availableDate: "6 Sep 2026", status: "pooled", targetPrice: 5350 },
  { id: "pool-wheat-02", crop: "c0000000-0000-0000-0000-000000000002", quantity: 560, quality: "Grade B", moisture: "11.4–12.1%", members: 6, collectionCenter: "Sanwer Collection Center", availableDate: "8 Sep 2026", status: "partially_allocated", targetPrice: 2450 },
  { id: "pool-cotton-03", crop: "Cotton", quantity: 280, quality: "Grade A", moisture: "8.2–8.8%", members: 3, collectionCenter: "Sanwer Collection Center", availableDate: "12 Sep 2026", status: "pooled", targetPrice: 7200 },
];

export const demoCollectionCenters: FpoCollectionCenter[] = [
  { id: "cc-rau", name: "Rau Regional Collection Center", district: "Indore", capacityQuintals: 5000, currentHoldingsQuintals: 2150, contactPerson: "Gopal Sharma", contactPhone: "+91 98261 55001", activeBatches: 3 },
  { id: "cc-sanwer", name: "Sanwer Agri-Logistics Hub", district: "Indore", capacityQuintals: 3500, currentHoldingsQuintals: 1420, contactPerson: "Nitin Bhati", contactPhone: "+91 94250 88219", activeBatches: 2 },
];

export const demoLogisticsBatches: FpoLogisticsBatch[] = [
  { id: "batch-101", crop: "c0000000-0000-0000-0000-000000000001", quantity: 250, collectionCenter: "Rau Regional Collection Center", destination: "Dewas Industrial Area", buyerName: "Agrocorp Central Processing", vehicleNumber: "MP-09-GH-8214", driverName: "Dharmendra Yadav", driverPhone: "+91 94251 44810", scheduledPickup: "8 Sep 2026", status: "scheduled" },
  { id: "batch-102", crop: "c0000000-0000-0000-0000-000000000002", quantity: 300, collectionCenter: "Sanwer Agri-Logistics Hub", destination: "Bhopal Warehouse", buyerName: "Central Grain Foods Ltd", vehicleNumber: "MP-09-KL-4091", driverName: "Mukesh Chouhan", driverPhone: "+91 98260 12040", scheduledPickup: "10 Sep 2026", status: "scheduled" },
];

export const demoRequirements: ProcurementRequirement[] = [
  {
    id: "rfq-1008",
    title: "Grade A Soybean for September Crushing Run",
    crop: "c0000000-0000-0000-0000-000000000001",
    crop_id: "c0000000-0000-0000-0000-000000000001",
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
    crop: "c0000000-0000-0000-0000-000000000002",
    crop_id: "c0000000-0000-0000-0000-000000000002",
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

export const demoAdminUsers: AdminUserItem[] = REAL_ACCOUNTS_20.map((u, i) => ({
  id: u.id,
  name: u.name,
  role: u.role,
  location: u.location,
  phone: u.phone,
  joinedDate: u.memberSince,
  verified: u.verified,
  status: "active" as const,
  tradeCount: parseInt(u.stats[0]?.value || "10", 10),
  documentType: u.role === "buyer" ? "GSTIN Certificate" : u.role === "fpo" ? "FPO Certificate" : "Aadhaar KYC",
  documentId: `DOC-${u.role.toUpperCase()}-${1000 + i}`,
}));

export const demoAdminDisputes: AdminDisputeCase[] = [
  { id: "DSP-401", orderNumber: "FN-DEAL-27902", dealId: "FN-DEAL-27902", crop: "c0000000-0000-0000-0000-000000000001", parties: "Suresh Patidar vs Ujjain Solvex", raisedBy: "Suresh Patidar", against: "Ujjain Solvex", reason: "Discrepancy in recorded moisture percentage (11.4% field vs 12.8% factory gate)", amount: 48200, disputedAmount: 48200, status: "Under Review", filedDate: "28 Aug 2026", createdAt: "28 Aug 2026" },
  { id: "DSP-398", orderNumber: "FN-DEAL-26810", dealId: "FN-DEAL-26810", crop: "c0000000-0000-0000-0000-000000000002", parties: "Kisan Morcha FPO vs Malwa Flour", raisedBy: "Kisan Morcha FPO", against: "Malwa Flour", reason: "Transporter delay of 48 hours causing demurrage charges", amount: 15400, disputedAmount: 15400, status: "Resolved", filedDate: "12 Jul 2026", createdAt: "12 Jul 2026" },
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
