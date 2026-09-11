const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getErrorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }

  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "We could not find that information.";
  if (status >= 500) return "The service is temporarily unavailable. Please try again.";

  return "We could not complete that request. Please try again.";
}

export interface UserProfile {
  id: string;
  name: string;
  role: "farmer" | "fpo" | "buyer" | "consumer" | "admin" | "expert";
  phone?: string;
  email?: string;
  language_pref: string;
  verified: boolean;
  created_at: string;
  farmer_profile?: {
    location: string;
    lat: number;
    lng: number;
    fpo_name?: string;
  };
  buyer_profile?: {
    business_name: string;
    gst_verified: boolean;
    location?: string;
    lat?: number;
    lng?: number;
  };
  fpo_profile?: {
    organization_name: string;
    district: string;
    member_count: number;
  };
  consumer_profile?: {
    interests: string[];
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export const api = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("farmnex_token");
  },

  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("farmnex_token", token);
    }
  },

  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("farmnex_token");
      localStorage.removeItem("farmnex_user");
    }
  },

  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("farmnex_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserProfile;
    } catch {
      localStorage.removeItem("farmnex_user");
      return null;
    }
  },

  setCurrentUser(user: UserProfile) {
    if (typeof window !== "undefined") {
      localStorage.setItem("farmnex_user", JSON.stringify(user));
    }
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
        }
        let payload: unknown = null;
        try {
          payload = await response.json();
        } catch {
          // Keep the user-facing message stable when the server returns non-JSON.
        }
        throw new ApiError(getErrorMessage(response.status, payload), response.status);
      }

      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError("The request took too long. Check your connection and try again.", 408);
      }
      throw new ApiError("We could not reach FarmNex. Check your connection and try again.", 0);
    } finally {
      clearTimeout(timeout);
    }
  },

  // Auth endpoints
  async sendFarmerOTP(phone: string) {
    return this.request<{ success: boolean; phone: string; message: string; is_registered: boolean }>(
      "/auth/farmer/send-otp",
      { method: "POST", body: JSON.stringify({ phone }) }
    );
  },

  async verifyFarmerOTP(phone: string, otp: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/farmer/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    });
    this.setToken(res.access_token);
    this.setCurrentUser(res.user);
    return res;
  },

  async registerFarmer(data: {
    phone: string;
    name: string;
    language_pref: string;
    location: string;
    lat: number;
    lng: number;
    fpo_name?: string;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/farmer/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    this.setCurrentUser(res.user);
    return res;
  },

  async loginBuyer(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/buyer/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    this.setCurrentUser(res.user);
    return res;
  },

  async registerBuyer(data: {
    email: string;
    password: string;
    name: string;
    business_name: string;
    phone?: string;
    language_pref: string;
    location: string;
    lat: number;
    lng: number;
  }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/buyer/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    this.setCurrentUser(res.user);
    return res;
  },

  async getMe(): Promise<UserProfile> {
    const user = await this.request<UserProfile>("/auth/me");
    this.setCurrentUser(user);
    return user;
  },

  // Marketplace: Crop Listings
  async createCropListing(data: {
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
  }): Promise<CropListing> {
    return this.request<CropListing>("/marketplace/listings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMyCropListings(): Promise<CropListing[]> {
    return this.request<CropListing[]>("/marketplace/listings/my");
  },

  async getAllCropListings(crop_id?: string): Promise<CropListing[]> {
    const query = crop_id ? `?crop_id=${crop_id}` : "";
    return this.request<CropListing[]>(`/marketplace/listings${query}`);
  },

  async deleteCropListing(listingId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/marketplace/listings/${listingId}`, {
      method: "DELETE",
    });
  },

  async getTrendingCrops(region: string = "Madhya Pradesh"): Promise<any> {
    return this.request<any>(`/intelligence/trending?region=${encodeURIComponent(region)}`);
  },

  async getMatchingSuggestions(): Promise<any[]> {
    return this.request<any[]>("/matching/suggestions");
  },

  // Marketplace: Demand Posts
  async createDemandPost(data: {
    crop_id: string;
    quantity_needed: number;
    quality_grade: string;
    moisture_max?: number | null;
    offered_price: number;
    payment_terms?: string;
    location: string;
    lat: number;
    lng: number;
  }): Promise<DemandPost> {
    return this.request<DemandPost>("/marketplace/demands", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMyDemands(): Promise<DemandPost[]> {
    return this.request<DemandPost[]>("/marketplace/demands/my");
  },

  async getAllDemands(crop_id?: string): Promise<DemandPost[]> {
    const query = crop_id ? `?crop_id=${crop_id}` : "";
    return this.request<DemandPost[]>(`/marketplace/demands${query}`);
  },

  async deleteDemandPost(demandId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/marketplace/demands/${demandId}`, {
      method: "DELETE",
    });
  },

  // Matching & Best Buyers
  async getBuyerMatchOpportunities(listingId: string): Promise<BuyerMatchOpportunity[]> {
    return this.request<BuyerMatchOpportunity[]>(`/matching/best-buyers/${listingId}`);
  },

  async acceptBuyerMatch(listingId: string, demandId: string): Promise<TradeAgreement> {
    return this.request<TradeAgreement>(`/matching/accept?listing_id=${listingId}&demand_id=${demandId}`, {
      method: "POST",
    });
  },

  // Market Intelligence
  async getPriceTrend(crop_id: string, region: string = "Madhya Pradesh", timeframe: string = "6m"): Promise<PriceTrendResponse> {
    return this.request<PriceTrendResponse>(`/intelligence/price-trend?crop_id=${crop_id}&region=${encodeURIComponent(region)}&timeframe=${timeframe}`);
  },

  async getDemandForecast(crop_id: string, region: string = "Madhya Pradesh"): Promise<DemandForecastResponse> {
    return this.request<DemandForecastResponse>(`/intelligence/demand-forecast?crop_id=${crop_id}&region=${encodeURIComponent(region)}`);
  },

  async getWhyPriceMoved(crop_id: string, region: string = "Madhya Pradesh"): Promise<WhyPriceMovedResponse> {
    return this.request<WhyPriceMovedResponse>(`/intelligence/why-price-moved?crop_id=${crop_id}&region=${encodeURIComponent(region)}`);
  },

  // Trade Agreements / Orders
  async getUserAgreements(): Promise<TradeAgreement[]> {
    return this.request<TradeAgreement[]>("/marketplace/agreements");
  },

  async getAgreementDetail(agreementId: string): Promise<TradeAgreement> {
    return this.request<TradeAgreement>(`/marketplace/agreements/${agreementId}`);
  },

  async updateAgreementStatus(agreementId: string, newStatus: string): Promise<TradeAgreement> {
    return this.request<TradeAgreement>(`/marketplace/agreements/${agreementId}/status?new_status=${newStatus}`, {
      method: "PATCH",
    });
  },

  // Community Board
  async getCommunityPosts(tag?: string): Promise<CommunityPostItem[]> {
    const query = tag && tag !== "all" ? `?tag=${tag}` : "";
    return this.request<CommunityPostItem[]>(`/community/posts${query}`);
  },

  async createCommunityPost(data: { tag: string; content: string }): Promise<CommunityPostItem> {
    return this.request<CommunityPostItem>("/community/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async addPostReply(postId: string, content: string): Promise<PostReplyItem> {
    return this.request<PostReplyItem>(`/community/posts/${postId}/reply`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  // Admin Portal
  async getAdminStats(): Promise<AdminKPIData> {
    return this.request<AdminKPIData>("/admin/stats");
  },


  async confirmDelivery(agreementId: string) {
    return this.request<any>(`/marketplace/agreements/${agreementId}/delivery`, { method: "PATCH" });
  },
  async confirmPayment(agreementId: string) {
    return this.request<any>(`/marketplace/agreements/${agreementId}/payment`, { method: "PATCH" });
  },
  async rateTransaction(agreementId: string, stars: number, review: string) {
    return this.request<any>(`/marketplace/agreements/${agreementId}/rate`, {
      method: "POST",
      body: JSON.stringify({ stars, review })
    });
  },

  async getUserReliability(userId: string) {
    return this.request<any>(`/users/${userId}/reliability`);
  },

  async getHeatmapData() {
    return this.request<any>(`/intelligence/heatmap`);
  },

  async getAdminMapNodes(): Promise<AdminMapResponse> {
    return this.request<AdminMapResponse>("/admin/map-nodes");
  },

  async getVerificationQueue() {
    return this.request<any>("/verification/admin/queue");
  },

  async decideVerification(requestId: string, status: string, notes: string) {
    return this.request<any>(`/verification/admin/${requestId}/decide`, {
      method: "POST",
      body: JSON.stringify({ status, admin_notes: notes })
    });
  },

  async likePost(postId: string) {
    return this.request<any>(`/community/posts/${postId}/like`, { method: "POST" });
  },

  async unlikePost(postId: string) {
    return this.request<any>(`/community/posts/${postId}/like`, { method: "DELETE" });
  },

  async replyToPost(postId: string, content: string) {
    return this.request<any>(`/community/posts/${postId}/reply`, {
      method: "POST",
      body: JSON.stringify({ content })
    });
  }
};

export interface AdminKPIData {
  total_active_listings: number;
  total_active_demands: number;
  total_matched_trades: number;
  total_farmers_connected: number;
  total_buyers_connected: number;
  total_estimated_logistics_savings_inr: number;
  total_trade_volume_quintals: number;
}

export interface MapNode {
  id: string;
  type: "supply" | "demand";
  lat: number;
  lng: number;
  title: string;
  location: string;
  status?: string;
  buyer_name?: string;
}

export interface AdminMapResponse {
  region: string;
  bounds: {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
  };
  supply_nodes: MapNode[];
  demand_nodes: MapNode[];
}

export interface PostReplyItem {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

export interface CommunityPostItem {
  id: string;
  user_id: string;
  author_name: string;
  author_role: string;
  tag: "question" | "market" | "machinery" | "expert_verified";
  content: string;
  expert_verified: boolean;
  replies: PostReplyItem[];
  created_at: string;
}

export interface PriceDataPoint {
  date: string;
  price: number;
  volume_arrivals?: number;
  source: string;
}

export interface PriceTrendResponse {
  crop_id: string;
  region: string;
  history: PriceDataPoint[];
  currency: string;
  unit: string;
  data_source: string;
  last_updated: string;
}

export interface DemandForecastResponse {
  crop_id: string;
  region: string;
  historical_avg_price: number;
  forecasted_next_30d_price: number;
  price_direction: "upward" | "stable" | "downward";
  confidence_level: string;
  methodology: string;
  explanation: string;
  formula: string;
}

export interface WhyPriceMovedResponse {
  crop_id: string;
  region: string;
  period_change_percentage: number;
  summary: string;
  primary_factors: string[];
  confidence_label: string;
  disclaimer: string;
}

export interface MatchExplanation {
  net_realization_score: number;
  price_score: number;
  distance_score: number;
  quantity_score: number;
  quality_score: number;
  reliability_score: number;
  availability_score: number;
  weights: Record<string, number>;
  formula: string;
}

export interface BuyerMatchOpportunity {
  match_id: string;
  demand_id: string;
  buyer_id: string;
  buyer_name: string;
  business_name: string;
  buyer_verified: boolean;
  crop_id: string;
  quantity_demanded: number;
  quantity_matched: number;
  offered_price_per_quintal: number;
  distance_km: number;
  estimated_logistics_per_quintal: number;
  estimated_total_logistics: number;
  net_realization_per_quintal: number;
  net_total_realization: number;
  matching_score: number;
  score_breakdown: MatchExplanation;
  why_this_offer: string[];
  status: "proposed" | "accepted" | "rejected";
}

export interface TradeEarningsBreakdown {
  gross_produce_value: number;
  logistics_cost_deduction: number;
  platform_fee: number;
  net_farmer_earnings: number;
}

export interface TradeAgreement {
  id: string;
  match_id: string;
  listing_id: string;
  demand_id: string;
  farmer_id: string;
  farmer_name: string;
  buyer_id: string;
  buyer_name: string;
  crop_id: string;
  quantity: number;
  price_per_quintal: number;
  delivery_date: string;
  status: "matched" | "trade_confirmed" | "pickup_scheduled" | "pickup_completed" | "in_transit" | "delivered" | "payment_confirmed" | "completed";
  earnings_breakdown: TradeEarningsBreakdown;
  created_at: string;
}

export interface CropListing {
  id: string;
  farmer_id: string;
  farmer_name?: string;
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
  pickup_preference: string;
  payment_preference: string;
  photo_url?: string;
  status: "listed" | "matched" | "in_transit" | "delivered";
  created_at: string;
}

export interface DemandPost {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  business_name?: string;
  crop_id: string;
  quantity_needed: number;
  quality_grade: string;
  moisture_max?: number | null;
  offered_price: number;
  payment_terms: string;
  location: string;
  lat: number;
  lng: number;
  created_at: string;
}
