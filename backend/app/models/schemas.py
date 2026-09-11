from datetime import date, datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, field_validator

# ----------------- Enums -----------------


class UserRole(str, Enum):
    FARMER = "farmer"
    BUYER = "buyer"
    ADMIN = "admin"


class CropListingStatus(str, Enum):
    LISTED = "listed"
    MATCHED = "matched"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"


class MatchStatus(str, Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class TradeStatus(str, Enum):
    MATCHED = "matched"
    TRADE_CONFIRMED = "trade_confirmed"
    PICKUP_SCHEDULED = "pickup_scheduled"
    PICKUP_COMPLETED = "pickup_completed"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    PAYMENT_CONFIRMED = "payment_confirmed"
    COMPLETED = "completed"


class CommunityTag(str, Enum):
    QUESTION = "question"
    MARKET = "market"
    MACHINERY = "machinery"
    EXPERT_VERIFIED = "expert_verified"


class QualityGrade(str, Enum):
    GRADE_A = "Grade A"
    GRADE_B = "Grade B"
    GRADE_C = "Grade C"
    FAQ = "FAQ (Fair Average Quality)"


# ----------------- User & Profile Schemas -----------------


class FarmerProfileBase(BaseModel):
    location: str
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    fpo_name: Optional[str] = None
    headline: Optional[str] = None
    about: Optional[str] = None
    crops: Optional[List[str]] = None
    farm_size_acres: Optional[float] = None
    soil_type: Optional[str] = None


class FarmerProfileOut(FarmerProfileBase):
    user_id: str
    updated_at: Optional[datetime] = None


class BuyerProfileBase(BaseModel):
    business_name: str
    gst_verified: bool = False
    location: Optional[str] = None
    lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    lng: Optional[float] = Field(None, ge=-180.0, le=180.0)
    headline: Optional[str] = None
    about: Optional[str] = None
    procurement_capacity: Optional[str] = None
    gst_number: Optional[str] = None
    commodities: Optional[List[str]] = None


class BuyerProfileOut(BuyerProfileBase):
    user_id: str
    updated_at: Optional[datetime] = None


class UserBase(BaseModel):
    name: str
    role: UserRole
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    language_pref: str = "hi"  # 'hi' or 'en'
    verified: bool = False
    headline: Optional[str] = None
    about: Optional[str] = None


class UserOut(UserBase):
    id: str
    created_at: datetime
    farmer_profile: Optional[FarmerProfileOut] = None
    buyer_profile: Optional[BuyerProfileOut] = None


# ----------------- Auth Schemas -----------------


class FarmerRegisterRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2)
    language_pref: str = "hi"
    location: str = Field(..., min_length=2)
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    fpo_name: Optional[str] = None
    headline: Optional[str] = None
    about: Optional[str] = None
    crops: Optional[List[str]] = None
    farm_size_acres: Optional[float] = None
    soil_type: Optional[str] = None


class BuyerRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)
    business_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    language_pref: str = "en"
    location: str = Field(..., min_length=2)
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    headline: Optional[str] = None
    about: Optional[str] = None
    procurement_capacity: Optional[str] = None
    gst_number: Optional[str] = None
    commodities: Optional[List[str]] = None


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    language_pref: Optional[str] = None
    headline: Optional[str] = None
    about: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = Field(None, ge=-90.0, le=90.0)
    lng: Optional[float] = Field(None, ge=-180.0, le=180.0)
    # Farmer specific
    fpo_name: Optional[str] = None
    crops: Optional[List[str]] = None
    farm_size_acres: Optional[float] = None
    soil_type: Optional[str] = None
    # Buyer specific
    business_name: Optional[str] = None
    procurement_capacity: Optional[str] = None
    gst_number: Optional[str] = None
    commodities: Optional[List[str]] = None


class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=6)


class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserOut


# ----------------- Crop Listing Schemas -----------------


class CropListingCreate(BaseModel):
    origin_post_id: Optional[str] = None
    crop_id: str
    quantity: float = Field(..., gt=0, description="Quantity in quintals")
    quality_grade: QualityGrade = QualityGrade.GRADE_A
    moisture_percent: Optional[float] = None
    harvest_date: date
    availability_date: Optional[date] = None
    location: str
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    expected_price: float = Field(
        ..., gt=0, description="Expected price per quintal in INR"
    )
    pickup_preference: str = "Either"  # "Buyer pickup", "I can deliver", "Either"
    payment_preference: str = "Immediate"  # "Immediate", "Within X days"
    photo_url: Optional[str] = None

    @field_validator("harvest_date")
    @classmethod
    def validate_harvest_date(cls, v: date) -> date:
        return v


class CropListingOut(BaseModel):
    origin_post_id: Optional[str] = None
    id: str
    farmer_id: str
    farmer_name: Optional[str] = None
    crop_id: str
    quantity: float
    quality_grade: str
    moisture_percent: Optional[float] = None
    harvest_date: date
    availability_date: Optional[date] = None
    location: str
    lat: float
    lng: float
    expected_price: float
    pickup_preference: str = "Either"
    payment_preference: str = "Immediate"
    photo_url: Optional[str] = None
    status: CropListingStatus
    created_at: datetime


# ----------------- Demand Post Schemas -----------------


class DemandPostCreate(BaseModel):
    origin_post_id: Optional[str] = None
    crop_id: str
    quantity_needed: float = Field(..., gt=0, description="Quantity needed in quintals")
    quality_grade: QualityGrade = QualityGrade.GRADE_A
    moisture_max: Optional[float] = None
    offered_price: float = Field(
        ..., gt=0, description="Offered price per quintal in INR"
    )
    payment_terms: str = "Immediate"
    location: str
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)


class DemandPostOut(BaseModel):
    origin_post_id: Optional[str] = None
    id: str
    buyer_id: str
    buyer_name: Optional[str] = None
    business_name: Optional[str] = None
    crop_id: str
    quantity_needed: float
    quality_grade: str
    moisture_max: Optional[float] = None
    offered_price: float
    payment_terms: str = "Immediate"
    location: str
    lat: float
    lng: float
    created_at: datetime


# ----------------- Logistics & Matching Schemas -----------------


class LogisticsEstimate(BaseModel):
    distance_km: float
    duration_hours: float
    rate_per_quintal_km: float
    total_logistics_cost: float
    cost_per_quintal: float
    origin: str
    destination: str


class MatchExplanation(BaseModel):
    net_realization_score: float
    price_score: float
    distance_score: float
    quantity_score: float
    quality_score: float
    reliability_score: float
    availability_score: float
    weights: Dict[str, float]
    formula: str


class BuyerMatchOpportunity(BaseModel):
    match_id: Optional[str] = None
    demand_id: str
    buyer_id: str
    buyer_name: str
    business_name: str
    buyer_verified: bool
    crop_id: str
    quantity_demanded: float
    quantity_matched: float
    offered_price_per_quintal: float

    # Logistics
    distance_km: float
    estimated_logistics_per_quintal: float
    estimated_total_logistics: float

    # Hero metric: Net Realization
    net_realization_per_quintal: float
    net_total_realization: float

    # Matching breakdown
    matching_score: float
    score_breakdown: MatchExplanation
    why_this_offer: List[str]
    status: MatchStatus


# ----------------- Trade Agreement Schemas -----------------


class TradeAgreementCreate(BaseModel):
    quality_spec: Optional[Dict[str, Any]] = None
    match_id: str
    delivery_date: date


class TradeEarningsBreakdown(BaseModel):
    gross_produce_value: float
    logistics_cost_deduction: float
    platform_fee: float
    net_farmer_earnings: float


class TradeAgreementOut(BaseModel):
    quality_spec: Optional[Dict[str, Any]] = None
    payment_status: str = "Not Started"
    delivery_confirmed_by_farmer_at: Optional[datetime] = None
    delivery_confirmed_by_buyer_at: Optional[datetime] = None
    id: str
    match_id: str
    listing_id: str
    demand_id: str
    farmer_id: str
    farmer_name: str
    buyer_id: str
    buyer_name: str
    crop_id: str
    quantity: float
    price_per_quintal: float
    delivery_date: date
    status: TradeStatus
    earnings_breakdown: TradeEarningsBreakdown
    created_at: datetime


# ----------------- Intelligence Schemas -----------------


class PriceDataPoint(BaseModel):
    date: date
    price: float
    volume_arrivals: Optional[float] = None
    source: str = "Agmarknet"


class PriceTrendResponse(BaseModel):
    crop_id: str
    region: str
    history: List[PriceDataPoint]
    currency: str = "INR"
    unit: str = "per quintal"
    data_source: str
    last_updated: datetime


class DemandForecastResponse(BaseModel):
    crop_id: str
    region: str
    historical_avg_price: float
    forecasted_next_30d_price: float
    price_direction: str  # "upward", "stable", "downward"
    confidence_level: str  # "high", "moderate", "low"
    methodology: str
    explanation: str
    formula: str


class WhyPriceMovedResponse(BaseModel):
    crop_id: str
    region: str
    period_change_percentage: float
    summary: str
    primary_factors: List[str]
    confidence_label: str  # "High Confidence (Rule-Based)", "Moderate"
    disclaimer: str


# ----------------- Community Schemas -----------------


class CommunityPostCreate(BaseModel):
    tag: CommunityTag = CommunityTag.QUESTION
    content: str = Field(..., min_length=5, max_length=2000)


class PostReplyItem(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    author_role: str
    content: str
    created_at: datetime

class CommunityPostOut(BaseModel):
    id: str
    user_id: str
    author_name: str
    author_role: str
    tag: str
    content: str
    expert_verified: bool = False
    like_count: int = 0
    has_liked: bool = False
    replies: List[PostReplyItem] = []
    media_urls: List[str] = []
    created_at: datetime


# ----------------- Admin KPI Schemas -----------------


class AdminKPIData(BaseModel):
    total_active_listings: int
    total_active_demands: int
    total_matched_trades: int
    total_farmers_connected: int
    total_buyers_connected: int
    total_estimated_logistics_savings_inr: float
    total_trade_volume_quintals: float
from datetime import datetime, date
from enum import Enum
from typing import Optional, List, Dict, Any, Any
from pydantic import BaseModel, Field, EmailStr, field_validator

# ----------------- New Enums -----------------

class CropCategory(str, Enum):
    CEREAL = "cereal"
    PULSE = "pulse"
    OILSEED = "oilseed"
    CASH_CROP = "cash_crop"
    VEGETABLE = "vegetable"
    FRUIT = "fruit"
    SPICE = "spice"
    OTHER = "other"

class DisputeReason(str, Enum):
    QUALITY_MISMATCH = "quality_mismatch"
    QUANTITY_MISMATCH = "quantity_mismatch"
    NON_PAYMENT = "non_payment"
    NON_DELIVERY = "non_delivery"
    OTHER = "other"

class DisputeStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"

# ----------------- New Schemas -----------------

class CropBase(BaseModel):
    name_en: str
    name_hi: str
    category: CropCategory
    icon: Optional[str] = None
    common_units: str = "quintal"
    is_active: bool = True

class CropOut(CropBase):
    id: str

class PostMedia(BaseModel):
    id: str
    url: str
    sort_order: int = 0
    alt_text: Optional[str] = None

class PostCommentBase(BaseModel):
    content: str
    parent_comment_id: Optional[str] = None

class PostCommentOut(PostCommentBase):
    id: str
    post_id: str
    user_id: str
    created_at: datetime
    edited_at: Optional[datetime] = None

class RatingCreate(BaseModel):
    ratee_id: str
    trade_agreement_id: Optional[str] = None
    stars: int = Field(..., ge=1, le=5)
    quality_score: Optional[int] = Field(None, ge=1, le=5)
    payment_or_reliability_score: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None

class RatingOut(RatingCreate):
    id: str
    rater_id: str
    created_at: datetime

class DisputeCreate(BaseModel):
    trade_agreement_id: str
    against_id: str
    reason_category: DisputeReason
    explanation: str
    photo_url: Optional[str] = None

class DisputeOut(DisputeCreate):
    id: str
    raiser_id: str
    status: DisputeStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None

class TradeAgreementEventCreate(BaseModel):
    event_type: str
    event_data: Optional[Dict[str, Any]] = None

class TradeAgreementEventOut(TradeAgreementEventCreate):
    id: str
    trade_agreement_id: str
    user_id: str
    created_at: datetime

class UserReliabilityScore(BaseModel):
    role: str
    total_transactions: int
    successful_transactions: int
    quality_consistency_percent: Optional[float] = None
    payment_reliability_percent: Optional[float] = None
    average_rating: float
    verification_status: bool

class VerificationRequestCreate(BaseModel):
    document_type: str
    document_url: str

class VerificationRequestOut(VerificationRequestCreate):
    id: str
    user_id: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class VerificationDecision(BaseModel):
    status: str = Field(..., description="Must be 'approved' or 'rejected'")
    admin_notes: Optional[str] = None
