from datetime import datetime
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.core.seed_data import USERS_20_SEED

# Global Supabase client (initialized if credentials available)
supabase_client: Optional[Any] = None

try:
    from supabase import create_client, Client
    if settings.SUPABASE_URL and settings.SUPABASE_KEY:
        try:
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            print("Supabase client initialized successfully.")
        except Exception as e:
            print(
                f"Warning: Failed to initialize Supabase client: {e}. Falling back to memory store."
            )
except ImportError:
    pass

if not supabase_client:
    print("Running in Local Memory Datastore mode.")


class InMemoryStore:
    """
    In-memory state store providing complete zero-downtime testability
    and seamless fallback when Supabase cloud credentials are not yet configured.
    """

    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}
        self.farmer_profiles: Dict[str, Dict[str, Any]] = {}
        self.buyer_profiles: Dict[str, Dict[str, Any]] = {}
        self.fpo_profiles: Dict[str, Dict[str, Any]] = {}
        self.consumer_profiles: Dict[str, Dict[str, Any]] = {}
        self.crop_listings: Dict[str, Dict[str, Any]] = {}
        self.demand_posts: Dict[str, Dict[str, Any]] = {}
        self.matches: Dict[str, Dict[str, Any]] = {}
        self.trade_agreements: Dict[str, Dict[str, Any]] = {}
        self.market_prices: List[Dict[str, Any]] = []
        self.community_posts: Dict[str, Dict[str, Any]] = {}
        self.ratings: Dict[str, Dict[str, Any]] = {}
        self.otp_codes: Dict[str, str] = {}  # phone -> otp
        self.passwords: Dict[str, str] = {}  # email -> hashed_password
        self.conversations: Dict[str, Dict[str, Any]] = {}
        self.messages: Dict[str, Dict[str, Any]] = {}

        self._seed_default_state()

    def _seed_default_state(self):
        # Seed all 20+ authentic agricultural ecosystem users
        for u in USERS_20_SEED:
            uid = u["id"]
            self.users[uid] = {
                "id": uid,
                "auth_id": uid,
                "name": u["name"],
                "phone": u.get("phone"),
                "email": u.get("email"),
                "role": u["role"],
                "language_pref": u.get("language_pref", "hi"),
                "verified": u.get("verified", True),
                "created_at": datetime.now(),
            }

            # Pre-populate OTP codes (development code: '123456')
            if u.get("phone"):
                self.otp_codes[u["phone"]] = "123456"

            # Pre-populate passwords for accounts
            if u.get("email"):
                self.passwords[u["email"].lower()] = "farmnex123"

            # Store specialized profile records
            if "farmer_profile" in u:
                self.farmer_profiles[uid] = {
                    "user_id": uid,
                    "location": u["farmer_profile"]["location"],
                    "lat": u["farmer_profile"]["lat"],
                    "lng": u["farmer_profile"]["lng"],
                    "fpo_name": u["farmer_profile"].get("fpo_name"),
                    "updated_at": datetime.now(),
                }
            if "buyer_profile" in u:
                self.buyer_profiles[uid] = {
                    "user_id": uid,
                    "business_name": u["buyer_profile"]["business_name"],
                    "gst_verified": u["buyer_profile"].get("gst_verified", True),
                    "location": u["buyer_profile"]["location"],
                    "lat": u["buyer_profile"]["lat"],
                    "lng": u["buyer_profile"]["lng"],
                    "updated_at": datetime.now(),
                }
            if "fpo_profile" in u:
                self.fpo_profiles[uid] = {
                    "user_id": uid,
                    "organization_name": u["fpo_profile"]["organization_name"],
                    "district": u["fpo_profile"]["district"],
                    "member_count": u["fpo_profile"]["member_count"],
                    "updated_at": datetime.now(),
                }
            if "consumer_profile" in u:
                self.consumer_profiles[uid] = {
                    "user_id": uid,
                    "interests": u["consumer_profile"].get("interests", []),
                    "updated_at": datetime.now(),
                }

        # Seed realistic crop listings across farmers
        self.crop_listings["c-lot-001"] = {
            "id": "c-lot-001",
            "farmer_id": "f0000000-0000-0000-0000-000000000001",
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity": 250.0,
            "quality_grade": "Grade A",
            "moisture_percent": 11.2,
            "harvest_date": "2026-08-27",
            "location": "Indore, Madhya Pradesh",
            "lat": 22.7196,
            "lng": 75.8577,
            "expected_price": 5280.0,
            "status": "listed",
            "created_at": datetime.now(),
        }
        self.crop_listings["c-lot-002"] = {
            "id": "c-lot-002",
            "farmer_id": "f0000000-0000-0000-0000-000000000002",
            "crop_id": "c0000000-0000-0000-0000-000000000003",
            "quantity": 180.0,
            "quality_grade": "Grade A (29mm)",
            "moisture_percent": 8.2,
            "harvest_date": "2026-08-25",
            "location": "Khargone, Madhya Pradesh",
            "lat": 21.8234,
            "lng": 75.6179,
            "expected_price": 7150.0,
            "status": "listed",
            "created_at": datetime.now(),
        }
        self.crop_listings["c-lot-003"] = {
            "id": "c-lot-003",
            "farmer_id": "f0000000-0000-0000-0000-000000000004",
            "crop_id": "c0000000-0000-0000-0000-000000000002",
            "quantity": 420.0,
            "quality_grade": "Grade B (Lokwan)",
            "moisture_percent": 11.8,
            "harvest_date": "2026-04-22",
            "location": "Sehore, Madhya Pradesh",
            "lat": 23.2032,
            "lng": 77.0844,
            "expected_price": 2420.0,
            "status": "listed",
            "created_at": datetime.now(),
        }
        self.crop_listings["c-lot-004"] = {
            "id": "c-lot-004",
            "farmer_id": "f0000000-0000-0000-0000-000000000007",
            "crop_id": "c0000000-0000-0000-0000-000000000004",
            "quantity": 140.0,
            "quality_grade": "Export Grade G2",
            "moisture_percent": 6.8,
            "harvest_date": "2026-08-20",
            "location": "Mandsaur, Madhya Pradesh",
            "lat": 24.0722,
            "lng": 75.0689,
            "expected_price": 14200.0,
            "status": "listed",
            "created_at": datetime.now(),
        }

        # Seed Demand Posts from Commercial Buyers
        self.demand_posts["d0000000-0000-0000-0000-000000000001"] = {
            "id": "d0000000-0000-0000-0000-000000000001",
            "buyer_id": "b0000000-0000-0000-0000-000000000001",
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity_needed": 500.0,
            "quality_grade": "Grade A",
            "offered_price": 5350.0,
            "location": "Dewas Industrial Area, MP",
            "lat": 22.9676,
            "lng": 76.0534,
            "created_at": datetime.now(),
        }
        self.demand_posts["d0000000-0000-0000-0000-000000000002"] = {
            "id": "d0000000-0000-0000-0000-000000000002",
            "buyer_id": "b0000000-0000-0000-0000-000000000002",
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity_needed": 300.0,
            "quality_grade": "Grade A",
            "offered_price": 5480.0,
            "location": "Mandideep, Bhopal, MP",
            "lat": 23.0722,
            "lng": 77.5255,
            "created_at": datetime.now(),
        }
        self.demand_posts["d0000000-0000-0000-0000-000000000003"] = {
            "id": "d0000000-0000-0000-0000-000000000003",
            "buyer_id": "b0000000-0000-0000-0000-000000000003",
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity_needed": 150.0,
            "quality_grade": "Grade B",
            "offered_price": 5290.0,
            "location": "Ujjain Grain Market, MP",
            "lat": 23.1765,
            "lng": 75.7885,
            "created_at": datetime.now(),
        }

        # Seed Community Discussions across authentic farmers, FPOs, buyers & agronomy experts
        self.community_posts["post-001"] = {
            "id": "post-001",
            "user_id": "f0000000-0000-0000-0000-000000000001",
            "tag": "market",
            "content": "Soybean harvest started today across our Sanwer fields. Moisture is holding steady at 11.2% after morning drying. Total available produce is 250Q Grade A (JS-9560). Looking for buyers with direct farm-gate pickup this week.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-002"] = {
            "id": "post-002",
            "user_id": "f0000000-0000-0000-0000-000000000002",
            "tag": "market",
            "content": "First picking of DCH-32 Bt Cotton completed in Kasrawad. Staple length tested at 29mm with zero trash content. 180 Quintals ready at farm ginning bay. Any buyers picking up from Nimar corridor?",
            "created_at": datetime.now(),
        }
        self.community_posts["post-003"] = {
            "id": "post-003",
            "user_id": "b0000000-0000-0000-0000-000000000001",
            "tag": "market",
            "content": "COMMERCIAL PROCUREMENT TENDER: Agrocorp Dewas plant requires 500Q Grade A soybean. Moisture max 12%, oil content minimum 18.5%. Rate: ₹5,350/q with buyer-provided freight. Direct escrow settlement within 24 hours of weighbridge confirmation.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-004"] = {
            "id": "post-004",
            "user_id": "exp00000-0000-0000-0000-000000000001",
            "tag": "expert_verified",
            "content": "AGRONOMY ADVISORY (ICAR / JNKVV): For soybean stored beyond 7 days, recheck moisture before consignment dispatch. If moisture exceeds 12%, solvent processors will apply a ₹40/q deduction for weight loss during crushing. Keep bagged lots elevated on wooden pallets to prevent dampness migration from concrete floors.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-005"] = {
            "id": "post-005",
            "user_id": "f0000000-0000-0000-0000-000000000003",
            "tag": "market",
            "content": "Harvested 15 acres of Amleta white garlic and organic JS-9560 soybean in Sonkatch. Graded bulb size: 45mm–55mm. 100% natural shade cured with zero sulfur treatment. NPOP organic certification report attached.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-006"] = {
            "id": "post-006",
            "user_id": "fpo00000-0000-0000-0000-000000000001",
            "tag": "market",
            "content": "FPO COLLECTIVE DISPATCH: We have aggregated 740Q of Grade A soybean across 4 member clusters at our Rau center. Electronic weighbridge testing calibrated with 10.9% average moisture. Institutional millers can tender for direct dispatch.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-007"] = {
            "id": "post-007",
            "user_id": "b0000000-0000-0000-0000-000000000004",
            "tag": "market",
            "content": "DIRECT WHEAT PROCUREMENT: Sourcing 1,000 MT of pure Lokwan and Sharbati Wheat for our Pithampur flour milling unit. Moisture < 11.5%, minimum hectolitre weight 78 kg/hl. Immediate digital payments within 12 hours of unloading.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-008"] = {
            "id": "post-008",
            "user_id": "f0000000-0000-0000-0000-000000000007",
            "tag": "market",
            "content": "Mandsaur mandi season opening: 140 Quintals of Export Quality G2 Garlic sorted and packed in 50kg aerated mesh bags. Average bulb diameter 50mm+. Direct farm-gate pickup available near Daloda toll plaza.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-009"] = {
            "id": "post-009",
            "user_id": "f0000000-0000-0000-0000-000000000004",
            "tag": "machinery",
            "content": "CUSTOM HIRING ALERT: John Deere 5050D tractor with high-capacity pneumatic thresher available for custom hire in Sehore and Ashta tehsils starting Monday. High recovery rate with under 0.8% grain breakage. ₹1,400/hour with trained operator.",
            "created_at": datetime.now(),
        }
        self.community_posts["post-010"] = {
            "id": "post-010",
            "user_id": "exp00000-0000-0000-0000-000000000002",
            "tag": "expert_verified",
            "content": "SOIL HEALTH & MICRONUTRIENT ALERT: Post-monsoon soil test samples across Chambal and Malwa belts show zinc and sulfur depletion in continuous soybean-wheat cycles. Applying 25 kg/ha Zinc Sulfate during land prep will boost oil content by up to 2.2% in upcoming Rabi mustard.",
            "created_at": datetime.now(),
        }


db = InMemoryStore()
