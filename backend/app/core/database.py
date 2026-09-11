from datetime import datetime
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from app.core.config import settings

# Global Supabase client (initialized if credentials available)
supabase_client: Optional[Client] = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("Supabase client initialized successfully.")
    except Exception as e:
        print(
            f"Warning: Failed to initialize Supabase client: {e}. Falling back to memory store."
        )
else:
    print("No SUPABASE_URL configured. Running in Local Memory Datastore mode.")


class InMemoryStore:
    """
    In-memory state store providing complete zero-downtime testability
    and seamless fallback when Supabase cloud credentials are not yet configured.
    """

    def __init__(self):
        self.users: Dict[str, Dict[str, Any]] = {}
        self.farmer_profiles: Dict[str, Dict[str, Any]] = {}
        self.buyer_profiles: Dict[str, Dict[str, Any]] = {}
        self.crop_listings: Dict[str, Dict[str, Any]] = {}
        self.demand_posts: Dict[str, Dict[str, Any]] = {}
        self.matches: Dict[str, Dict[str, Any]] = {}
        self.trade_agreements: Dict[str, Dict[str, Any]] = {}
        self.market_prices: List[Dict[str, Any]] = []
        self.community_posts: Dict[str, Dict[str, Any]] = {}
        self.ratings: Dict[str, Dict[str, Any]] = {}
        self.otp_codes: Dict[str, str] = {}  # phone -> otp
        self.passwords: Dict[str, str] = {}  # email -> hashed_password

        self._seed_default_state()

    def _seed_default_state(self):
        # 1. Seed Demo Farmer (Ramesh Patel, Indore MP)
        farmer_id = "f0000000-0000-0000-0000-000000000001"
        self.users[farmer_id] = {
            "id": farmer_id,
            "auth_id": farmer_id,
            "name": "Ramesh Patel",
            "phone": "9876543210",
            "email": "ramesh@farmnex.in",
            "role": "farmer",
            "language_pref": "hi",
            "verified": True,
            "created_at": datetime.now(),
        }
        self.farmer_profiles[farmer_id] = {
            "user_id": farmer_id,
            "location": "Indore, Madhya Pradesh",
            "lat": 22.7196,
            "lng": 75.8577,
            "fpo_name": "Malwa Kisan Samriddhi FPO",
            "updated_at": datetime.now(),
        }

        # 2. Seed 3 Verified Bulk Buyers in MP for the Demo Storyline
        # Buyer 1: Agrocorp MP (Dewas - 38 km away, high price)
        buyer1_id = "b0000000-0000-0000-0000-000000000001"
        self.users[buyer1_id] = {
            "id": buyer1_id,
            "auth_id": buyer1_id,
            "name": "Agrocorp Central Processing",
            "phone": "9811111111",
            "email": "buyer1@agrocorp.in",
            "role": "buyer",
            "language_pref": "en",
            "verified": True,
            "created_at": datetime.now(),
        }
        self.buyer_profiles[buyer1_id] = {
            "user_id": buyer1_id,
            "business_name": "Agrocorp Central Processing Pvt Ltd",
            "gst_verified": True,
            "location": "Dewas Industrial Area, MP",
            "lat": 22.9676,
            "lng": 76.0534,
            "updated_at": datetime.now(),
        }

        # Buyer 2: Bhopal Solvex (Bhopal - 190 km away, highest gross price but higher transport)
        buyer2_id = "b0000000-0000-0000-0000-000000000002"
        self.users[buyer2_id] = {
            "id": buyer2_id,
            "auth_id": buyer2_id,
            "name": "Bhopal Solvex & Oils",
            "phone": "9822222222",
            "email": "procurement@bhopalsolvex.com",
            "role": "buyer",
            "language_pref": "en",
            "verified": True,
            "created_at": datetime.now(),
        }
        self.buyer_profiles[buyer2_id] = {
            "user_id": buyer2_id,
            "business_name": "Bhopal Solvex & Oils Ltd",
            "gst_verified": True,
            "location": "Mandideep, Bhopal, MP",
            "lat": 23.0722,
            "lng": 77.5255,
            "updated_at": datetime.now(),
        }

        # Buyer 3: Ujjain Feeds (Ujjain - 55 km away, moderate price)
        buyer3_id = "b0000000-0000-0000-0000-000000000003"
        self.users[buyer3_id] = {
            "id": buyer3_id,
            "auth_id": buyer3_id,
            "name": "Mahakal Feeds & Grain",
            "phone": "9833333333",
            "email": "trade@mahakalfeeds.com",
            "role": "buyer",
            "language_pref": "hi",
            "verified": True,
            "created_at": datetime.now(),
        }
        self.buyer_profiles[buyer3_id] = {
            "user_id": buyer3_id,
            "business_name": "Mahakal Feeds & Grain Mandi Hub",
            "gst_verified": True,
            "location": "Ujjain Grain Market, MP",
            "lat": 23.1765,
            "lng": 75.7885,
            "updated_at": datetime.now(),
        }

        # Seed Demand Posts from these 3 Buyers for Soybean
        # Demand 1: Dewas buyer offers ₹4,900/quintal for 150 quintals
        d1_id = "d0000000-0000-0000-0000-000000000001"
        self.demand_posts[d1_id] = {
            "id": d1_id,
            "buyer_id": buyer1_id,
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity_needed": 150.0,
            "quality_grade": "Grade A",
            "offered_price": 4900.0,
            "location": "Dewas Industrial Area, MP",
            "lat": 22.9676,
            "lng": 76.0534,
            "created_at": datetime.now(),
        }

        # Demand 2: Bhopal buyer offers ₹5,050/quintal for 200 quintals (higher raw price, but farther)
        d2_id = "d0000000-0000-0000-0000-000000000002"
        self.demand_posts[d2_id] = {
            "id": d2_id,
            "buyer_id": buyer2_id,
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity_needed": 200.0,
            "quality_grade": "Grade A",
            "offered_price": 5050.0,
            "location": "Mandideep, Bhopal, MP",
            "lat": 23.0722,
            "lng": 77.5255,
            "created_at": datetime.now(),
        }

        # Demand 3: Ujjain buyer offers ₹4,750/quintal for 80 quintals
        d3_id = "d0000000-0000-0000-0000-000000000003"
        self.demand_posts[d3_id] = {
            "id": d3_id,
            "buyer_id": buyer3_id,
            "crop_id": "c0000000-0000-0000-0000-000000000001",
            "quantity_needed": 80.0,
            "quality_grade": "Grade A",
            "offered_price": 4750.0,
            "location": "Ujjain Grain Market, MP",
            "lat": 23.1765,
            "lng": 75.7885,
            "created_at": datetime.now(),
        }

        # Seed 1 Admin User
        admin_id = "a0000000-0000-0000-0000-000000000001"
        self.users[admin_id] = {
            "id": admin_id,
            "auth_id": admin_id,
            "name": "Platform Admin",
            "phone": "9999999999",
            "email": "admin@farmnex.in",
            "role": "admin",
            "language_pref": "en",
            "verified": True,
            "created_at": datetime.now(),
        }

        # Seed 1 Community Post
        p_id = "c0000000-0000-0000-0000-000000000001"
        self.community_posts[p_id] = {
            "id": p_id,
            "user_id": farmer_id,
            "tag": "market",
            "content": "Soybean harvest starting next week in Malwa belt. Expected moisture content around 10-12%. What are the current rates at Dewas mandi?",
            "created_at": datetime.now(),
        }


db = InMemoryStore()
