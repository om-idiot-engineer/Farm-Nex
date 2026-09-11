import type { UserProfile } from "@/lib/api";
import type { DemoProfile, AppRole } from "./demo";

export interface TestUserAccount {
  id: string;
  name: string;
  role: AppRole;
  profileId: string;
  password?: string;
  phone?: string;
  email?: string;
  otp?: string;
  location: string;
  lat: number;
  lng: number;
  avatar: string;
  crops: string[];
  headline: string;
  about: string;
  fpoName?: string;
  businessName?: string;
  stats: { label: string; value: string }[];
  verified: boolean;
  memberSince: string;
  rating?: number;
  farmSizeAcres?: number;
  procurementCapacity?: string;
  avatarUrl?: string;
}

export const REAL_ACCOUNTS_20: TestUserAccount[] = [
  // --- 8 FARMERS ---
  {
    id: "f0000000-0000-0000-0000-000000000001",
    name: "Ramesh Patel",
    profileId: "ramesh.patel",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9876543210",
    otp: "123456",
    location: "Indore, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    avatar: "RP",
    crops: ["Soybean", "Wheat", "Gram"],
    headline: "Soybean & Sharbati Wheat Specialist | Sanwer, Indore",
    about: "Growing certified JS-9560 Soybean and Sharbati Wheat across 18 acres in Sanwer. Geotagged farm gate with digital moisture testing facility.",
    fpoName: "Malwa Kisan Samriddhi FPO",
    farmSizeAcres: 18,
    verified: true,
    rating: 4.9,
    memberSince: "Jun 2024",
    stats: [
      { label: "Completed trades", value: "18" },
      { label: "Delivery reliability", value: "98%" },
      { label: "Buyer rating", value: "4.9 / 5" },
      { label: "Active land", value: "18 Acres" },
    ],
  },
  {
    id: "f0000000-0000-0000-0000-000000000002",
    name: "Devendra Mandloi",
    profileId: "devendra.mandloi",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9826112233",
    otp: "123456",
    location: "Khargone, Madhya Pradesh",
    lat: 21.8234,
    lng: 75.6179,
    avatar: "DM",
    crops: ["Cotton", "Soybean", "Chilli"],
    headline: "Long-Staple Cotton & Teja Chilli Grower | Khargone",
    about: "Cultivating long-staple DCH-32 Bt Cotton and Teja Red Chilli with micro-drip fertigation in Kasrawad tehsil. Consistent 29mm staple length.",
    fpoName: "Nimar Cotton & Chilli Producer Co",
    farmSizeAcres: 24,
    verified: true,
    rating: 4.85,
    memberSince: "Aug 2024",
    stats: [
      { label: "Completed trades", value: "14" },
      { label: "Staple Length", value: "29 mm" },
      { label: "Buyer rating", value: "4.85 / 5" },
      { label: "Active land", value: "24 Acres" },
    ],
  },
  {
    id: "f0000000-0000-0000-0000-000000000003",
    name: "Sunita Verma",
    profileId: "sunita.verma",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9893223344",
    otp: "123456",
    location: "Dewas, Madhya Pradesh",
    lat: 22.9676,
    lng: 76.0534,
    avatar: "SV",
    crops: ["Soybean", "Garlic", "Gram"],
    headline: "Progressive Organic Farmer & Garlic Specialist | Dewas",
    about: "Leading organic certified woman farmer cultivating Amleta white garlic and high-protein soybean. Focus on zero chemical residue produce.",
    fpoName: "Chamunda Mahila Kisan Producer Co",
    farmSizeAcres: 15,
    verified: true,
    rating: 4.95,
    memberSince: "Jan 2025",
    stats: [
      { label: "Organic Deals", value: "11" },
      { label: "Moisture Std", value: "10.8%" },
      { label: "Rating", value: "4.95 / 5" },
      { label: "Active land", value: "15 Acres" },
    ],
  },
  {
    id: "f0000000-0000-0000-0000-000000000004",
    name: "Rajesh Pawar",
    profileId: "rajesh.pawar",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9425099881",
    otp: "123456",
    location: "Sehore, Madhya Pradesh",
    lat: 23.2032,
    lng: 77.0844,
    avatar: "RP",
    crops: ["Desi Gram", "Wheat", "Mustard"],
    headline: "Desi Gram & Lokwan Wheat Grower | Sehore",
    about: "Specializing in JG-11 Desi Gram (Chana) and Lokwan wheat. All harvesting handled with modern pneumatic threshers for minimum broken grains.",
    fpoName: "Sehore Agritech Kisan FPC",
    farmSizeAcres: 12,
    verified: true,
    rating: 4.8,
    memberSince: "Mar 2025",
    stats: [
      { label: "Completed trades", value: "9" },
      { label: "Grain Purity", value: "99.2%" },
      { label: "Rating", value: "4.8 / 5" },
      { label: "Active land", value: "12 Acres" },
    ],
  },
  {
    id: "f0000000-0000-0000-0000-000000000005",
    name: "Mukesh Choudhary",
    profileId: "mukesh.choudhary",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9827334455",
    otp: "123456",
    location: "Ujjain, Madhya Pradesh",
    lat: 23.1765,
    lng: 75.7885,
    avatar: "MC",
    crops: ["Soybean", "Onion", "Potato"],
    headline: "Onion & Seed-Grade Soybean Cultivator | Ujjain",
    about: "Operating solar-powered cold storage aggregation for Nashik Red onion varieties and certified seed-grade soybean lots in Tarana tehsil.",
    fpoName: "Mahakal Krishi Producer Co",
    farmSizeAcres: 20,
    verified: true,
    rating: 4.75,
    memberSince: "May 2024",
    stats: [
      { label: "Completed trades", value: "16" },
      { label: "Storage Capacity", value: "1,200 Q" },
      { label: "Rating", value: "4.75 / 5" },
      { label: "Active land", value: "20 Acres" },
    ],
  },
  {
    id: "f0000000-0000-0000-0000-000000000006",
    name: "Vikram Singh Solanki",
    profileId: "vikram.solanki",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9829445566",
    otp: "123456",
    location: "Kota, Rajasthan",
    lat: 25.2138,
    lng: 75.8648,
    avatar: "VS",
    crops: ["Mustard", "Soybean", "Paddy"],
    headline: "Pusa Mustard & Basmati Producer | Kota, Rajasthan",
    about: "Farming high-oil Pusa Mustard (41.8% oil yield) and 1509 Basmati paddy along the Chambal river canal belt. Prompt mechanized bagging.",
    fpoName: "Chambal Valley Kisan FPC",
    farmSizeAcres: 28,
    verified: true,
    rating: 4.88,
    memberSince: "Jul 2024",
    stats: [
      { label: "Completed trades", value: "21" },
      { label: "Oil Content", value: "41.8%" },
      { label: "Rating", value: "4.88 / 5" },
      { label: "Active land", value: "28 Acres" },
    ],
  },
  {
    id: "f0000000-0000-0000-0000-000000000007",
    name: "Balram Patidar",
    profileId: "balram.patidar",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9425112299",
    otp: "123456",
    location: "Mandsaur, Madhya Pradesh",
    lat: 24.0722,
    lng: 75.0689,
    avatar: "BP",
    crops: ["Garlic", "Coriander", "Soybean"],
    headline: "Export Quality Garlic & Coriander Grower | Mandsaur",
    about: "Export quality G2 Garlic and Eagle variety green Coriander cultivator in Mandsaur mandi hub. Naturally shade cured and graded.",
    fpoName: "Malwa Spices Producer Co",
    farmSizeAcres: 16,
    verified: true,
    rating: 4.92,
    memberSince: "Feb 2025",
    stats: [
      { label: "Completed trades", value: "13" },
      { label: "Curing Std", value: "Shade Cured" },
      { label: "Rating", value: "4.92 / 5" },
      { label: "Active land", value: "16 Acres" },
    ],
  },
  {
    id: "f0000000-0000-0000-0000-000000000008",
    name: "Anil Dhangar",
    profileId: "anil.dhangar",
    password: "FarmNex@2026",
    role: "farmer",
    phone: "9755667788",
    otp: "123456",
    location: "Khandwa, Madhya Pradesh",
    lat: 21.8314,
    lng: 76.3498,
    avatar: "AD",
    crops: ["Moong", "Soybean", "Wheat", "Cotton"],
    headline: "Khandwa Nimar Belt Producer | Summer Moong & Soybean",
    about: "Pioneer in crop rotation across Khandwa & Nimar canal belt: Summer Moong (green gram), Kharif Soybean, and Rabi Sharbati Wheat. 100% canal drip irrigated.",
    fpoName: "Khandwa Nimar Kisan Producer Co",
    farmSizeAcres: 32,
    verified: true,
    rating: 4.87,
    memberSince: "Apr 2024",
    stats: [
      { label: "Completed trades", value: "24" },
      { label: "Crop Cycle", value: "Triple Sown" },
      { label: "Rating", value: "4.87 / 5" },
      { label: "Active land", value: "32 Acres" },
    ],
  },

  // --- 4 FARMER PRODUCER ORGANIZATIONS (FPOs) ---
  {
    id: "fpo00000-0000-0000-0000-000000000001",
    name: "Malwa Kisan Samriddhi FPO",
    profileId: "malwa.kisan.fpo",
    password: "FarmNex@2026",
    role: "fpo",
    phone: "9826155001",
    email: "contact@malwakisanfpo.org",
    location: "Indore & Sanwer, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    avatar: "MK",
    crops: ["Soybean", "Wheat", "Gram", "Onion"],
    headline: "340-Member Aggregation Cooperative | Rau & Sanwer Hubs",
    about: "Registered under Companies Act with 340 smallholder farmers. Operating 2 central aggregation hubs in Rau & Sanwer with electronic weighbridges and moisture testing labs.",
    fpoName: "Malwa Kisan Samriddhi FPO",
    verified: true,
    rating: 4.95,
    memberSince: "Aug 2023",
    stats: [
      { label: "Active members", value: "340" },
      { label: "Pooled volume", value: "2,450 Q" },
      { label: "Contracts closed", value: "42" },
      { label: "Collection points", value: "2 Centers" },
    ],
  },
  {
    id: "fpo00000-0000-0000-0000-000000000002",
    name: "Narmada Valley Farmers Producer Co",
    profileId: "narmada.valley.fpo",
    password: "FarmNex@2026",
    role: "fpo",
    phone: "9826330011",
    email: "procurement@narmadafpc.org",
    location: "Harda & Hoshangabad, Madhya Pradesh",
    lat: 22.3444,
    lng: 77.0982,
    avatar: "NV",
    crops: ["Moong", "Soybean", "Kodo Millet", "Wheat"],
    headline: "NABARD Partner Collective | 520 Farmers | Harda",
    about: "SFAC & NABARD partner FPC with 520 smallholders. Operates direct procurement contracts with national solvent plants and institutional millers.",
    fpoName: "Narmada Valley Farmers Producer Co",
    verified: true,
    rating: 4.9,
    memberSince: "Nov 2023",
    stats: [
      { label: "Active members", value: "520" },
      { label: "Pooled volume", value: "4,100 Q" },
      { label: "Institutional deals", value: "58" },
      { label: "NABARD Score", value: "Grade A" },
    ],
  },
  {
    id: "fpo00000-0000-0000-0000-000000000003",
    name: "Chamunda Mahila Kisan FPC",
    profileId: "chamunda.mahila.fpo",
    password: "FarmNex@2026",
    role: "fpo",
    phone: "9425177880",
    email: "trade@chamundafpc.in",
    location: "Sonkatch, Dewas, Madhya Pradesh",
    lat: 22.9676,
    lng: 76.0534,
    avatar: "CM",
    crops: ["Garlic", "Soybean", "Gram"],
    headline: "All-Women Farmer Producer Co | 280 Members | Dewas",
    about: "100% women-led farmer producer company in Sonkatch tehsil. Specializing in graded garlic bulbs, cold-pressed artisanal mustard oil, and organic soybean lots.",
    fpoName: "Chamunda Mahila Kisan FPC",
    verified: true,
    rating: 4.93,
    memberSince: "Oct 2024",
    stats: [
      { label: "Women members", value: "280" },
      { label: "Organic lots", value: "1,200 Q" },
      { label: "Clean Sorting", value: "100% Optical" },
      { label: "Direct sales", value: "31" },
    ],
  },
  {
    id: "fpo00000-0000-0000-0000-000000000004",
    name: "Sehore Agritech Kisan Collective",
    profileId: "sehore.agritech.fpo",
    password: "FarmNex@2026",
    role: "fpo",
    phone: "9893441122",
    email: "operations@sehorekisan.org",
    location: "Sehore & Ashta, Madhya Pradesh",
    lat: 23.2032,
    lng: 77.0844,
    avatar: "SA",
    crops: ["Desi Gram", "Lokwan Wheat", "Mustard"],
    headline: "Pulse Sorting & Grading Collective | 410 Members | Sehore",
    about: "410 certified pulse cultivators. Centralized cleaning, optical sorting, and digital assay documentation ensuring zero impurity lots for wholesale processors.",
    fpoName: "Sehore Agritech Kisan Collective",
    verified: true,
    rating: 4.88,
    memberSince: "Jan 2024",
    stats: [
      { label: "Member farmers", value: "410" },
      { label: "Total Grain Handled", value: "3,800 Q" },
      { label: "Chakki Partners", value: "12" },
      { label: "Weighment Accuracy", value: "99.9%" },
    ],
  },

  // --- 5 COMMERCIAL PROCESSORS & BULK BUYERS ---
  {
    id: "b0000000-0000-0000-0000-000000000001",
    name: "Anita Sharma (Agrocorp)",
    profileId: "agrocorp.procure",
    password: "FarmNex@2026",
    role: "buyer",
    phone: "9811111111",
    email: "buyer1@agrocorp.in",
    location: "Dewas Industrial Area, Madhya Pradesh",
    lat: 22.9676,
    lng: 76.0534,
    avatar: "AC",
    crops: ["Soybean", "Mustard"],
    headline: "Procurement Head · Agrocorp Central Processing Pvt Ltd",
    about: "Integrated 1,200 MT/day solvent extraction and edible oil refinery in Dewas. Direct procurement contracts with verified FPOs and farmers with 24-hour escrow release.",
    businessName: "Agrocorp Central Processing Pvt Ltd",
    procurementCapacity: "35,000 Quintals / Month",
    verified: true,
    rating: 4.9,
    memberSince: "Mar 2024",
    stats: [
      { label: "Deals fulfilled", value: "148" },
      { label: "Settlement speed", value: "Under 24h" },
      { label: "Procured volume", value: "52,400 Q" },
      { label: "Verified facility", value: "FSSAI & GST" },
    ],
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    name: "Vikram Singh (Bhopal Solvex)",
    profileId: "bhopal.solvex",
    password: "FarmNex@2026",
    role: "buyer",
    phone: "9822222222",
    email: "procurement@bhopalsolvex.com",
    location: "Mandideep Industrial Estate, Bhopal, MP",
    lat: 23.0722,
    lng: 77.5255,
    avatar: "BS",
    crops: ["Soybean", "Mustard", "Cottonseed"],
    headline: "Director of Sourcing · Bhopal Solvex & Oils Ltd",
    about: "Specialized solvent processing & de-oiled cake (DOC) exporter to Southeast Asia. Sourcing 35,000 MT seasonally with direct weighbridge and gate receipt assay.",
    businessName: "Bhopal Solvex & Oils Ltd",
    procurementCapacity: "25,000 Quintals / Month",
    verified: true,
    rating: 4.82,
    memberSince: "Feb 2024",
    stats: [
      { label: "Deals fulfilled", value: "96" },
      { label: "Export Grade DOC", value: "Grade 1" },
      { label: "Volume Procured", value: "31,800 Q" },
      { label: "Escrow Reliability", value: "100%" },
    ],
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    name: "Suresh Singhal (Mahakal Feeds)",
    profileId: "mahakal.feeds",
    password: "FarmNex@2026",
    role: "buyer",
    phone: "9833333333",
    email: "trade@mahakalfeeds.com",
    location: "Ujjain Grain Market, Madhya Pradesh",
    lat: 23.1765,
    lng: 75.7885,
    avatar: "MF",
    crops: ["Maize", "Soybean", "Gram"],
    headline: "Chief Commercial Officer · Mahakal Feeds & Grain Hub",
    about: "Commercial poultry and cattle compound feed manufacturing plant in Ujjain. Continuous procurement of high-protein coarse grains and broken pulses.",
    businessName: "Mahakal Feeds & Grain Mandi Hub",
    procurementCapacity: "18,000 Quintals / Month",
    verified: true,
    rating: 4.85,
    memberSince: "Jan 2024",
    stats: [
      { label: "Deals fulfilled", value: "82" },
      { label: "Feed Production", value: "600 MT/day" },
      { label: "Volume Procured", value: "22,500 Q" },
      { label: "Cash Settlement", value: "Instant UPI" },
    ],
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    name: "Kailash Agarwal (Malwa Flour)",
    profileId: "malwa.flour",
    password: "FarmNex@2026",
    role: "buyer",
    phone: "9826019922",
    email: "procurement@malwaflour.in",
    location: "Pithampur Sector 3, Dhar, MP",
    lat: 22.6139,
    lng: 75.6822,
    avatar: "MR",
    crops: ["Wheat", "Gram"],
    headline: "Managing Director · Malwa Roller Flour Mills Ltd",
    about: "Industrial flour milling capacity of 800 MT/day producing Chakki Atta, Maida, and Suji for national FMCG packaging. Premium rates for Sharbati & Lokwan varieties.",
    businessName: "Malwa Roller Flour Mills Ltd",
    procurementCapacity: "40,000 Quintals / Month",
    verified: true,
    rating: 4.92,
    memberSince: "May 2024",
    stats: [
      { label: "Deals fulfilled", value: "114" },
      { label: "Milling Output", value: "800 MT/day" },
      { label: "Volume Procured", value: "44,000 Q" },
      { label: "Sharbati Bonus", value: "+₹180/q" },
    ],
  },
  {
    id: "b0000000-0000-0000-0000-000000000005",
    name: "Rajiv Mehra (Deccan Spices)",
    profileId: "deccan.spices",
    password: "FarmNex@2026",
    role: "buyer",
    phone: "9823118800",
    email: "sourcing@deccanspices.com",
    location: "Neemuch Mandi Hub, Madhya Pradesh",
    lat: 24.4739,
    lng: 74.8703,
    avatar: "DS",
    crops: ["Garlic", "Coriander", "Mustard", "Chilli"],
    headline: "Head of Agri-Sourcing · Deccan Spice Exporters",
    about: "APEDA certified spice processor exporting dehydrated garlic flakes, whole coriander, and organic mustard seeds to Middle East & Europe.",
    businessName: "Deccan Spice & Commodity Exporters",
    procurementCapacity: "12,000 Quintals / Month",
    verified: true,
    rating: 4.89,
    memberSince: "Sep 2024",
    stats: [
      { label: "Deals fulfilled", value: "68" },
      { label: "Export Portfolios", value: "18 Countries" },
      { label: "Volume Procured", value: "14,200 Q" },
      { label: "APEDA Grade", value: "Class 1" },
    ],
  },

  // --- 2 CERTIFIED AGRONOMY & MANDI ASSAY EXPERTS ---
  {
    id: "exp00000-0000-0000-0000-000000000001",
    name: "Dr. Kavita Rao",
    profileId: "dr.kavita.rao",
    password: "FarmNex@2026",
    role: "expert",
    phone: "9826778811",
    email: "kavita.agronomy@farmnex.demo",
    location: "College of Agriculture, Indore, MP",
    lat: 22.7196,
    lng: 75.8577,
    avatar: "KR",
    crops: ["Soybean", "Wheat", "Mustard"],
    headline: "Senior Agronomist & Mandi Quality Consultant | ICAR Advisor",
    about: "Ph.D. in Agronomy with 16 years advising central Indian farmers on oilseed quality, post-harvest drying protocols, pest mitigation, and mandi assay compliance.",
    verified: true,
    rating: 4.98,
    memberSince: "May 2024",
    stats: [
      { label: "Questions answered", value: "185+" },
      { label: "Farmers assisted", value: "1,600+" },
      { label: "Advisories verified", value: "112" },
      { label: "ICAR Ranking", value: "Senior Fellow" },
    ],
  },
  {
    id: "exp00000-0000-0000-0000-000000000002",
    name: "Dr. B. L. Meena",
    profileId: "dr.bl.meena",
    password: "FarmNex@2026",
    role: "expert",
    phone: "9414002233",
    email: "bl.meena@soilscience.org",
    location: "Agriculture University, Kota, Rajasthan",
    lat: 25.2138,
    lng: 75.8648,
    avatar: "BM",
    crops: ["Cotton", "Gram", "Garlic"],
    headline: "Principal Soil Scientist & Post-Harvest Assay Specialist",
    about: "Principal Scientist (Soil Health & Micro-Nutrients). Specialist in vertisol black soil salinity rectification, organic compost balancing, and export pesticide residue assays.",
    verified: true,
    rating: 4.94,
    memberSince: "Nov 2024",
    stats: [
      { label: "Soil tests analyzed", value: "450+" },
      { label: "Pesticide Audits", value: "98" },
      { label: "Farmer workshops", value: "34" },
      { label: "Field Accuracy", value: "99.4%" },
    ],
  },

  // --- 2 DIRECT CONSUMERS / RETAIL BUYERS ---
  {
    id: "con00000-0000-0000-0000-000000000001",
    name: "Meera Joshi",
    profileId: "meera.joshi",
    password: "FarmNex@2026",
    role: "consumer",
    phone: "9827001122",
    email: "meera@farmnex.demo",
    location: "Indore, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    avatar: "MJ",
    crops: ["Cold-pressed oils", "Millets", "Sharbati Atta"],
    headline: "Traceable Agri Advocate & Direct Consumer | Indore",
    about: "Home cook and supporter of sustainable direct farm-to-table produce. Buys single-origin cold-pressed oils and unpolished pulses directly from FPOs.",
    verified: true,
    rating: 4.9,
    memberSince: "Jan 2026",
    stats: [
      { label: "Orders placed", value: "16" },
      { label: "Producers supported", value: "8 FPOs" },
      { label: "Following", value: "24 Farms" },
    ],
  },
  {
    id: "con00000-0000-0000-0000-000000000002",
    name: "Aakash Kulkarni",
    profileId: "aakash.kulkarni",
    password: "FarmNex@2026",
    role: "consumer",
    phone: "9881223344",
    email: "aakash.kulkarni@urbanorganics.in",
    location: "Pune & Indore, Maharashtra / MP",
    lat: 18.5204,
    lng: 73.8567,
    avatar: "AK",
    crops: ["Kodo Millet", "Desi Toor Dal", "Wood-Pressed Oil"],
    headline: "Urban Community Kitchen Organizer | Pune & Indore",
    about: "Community kitchen coordinator procuring certified residue-free farm grains and pure wood-pressed soybean oil in bulk for community distribution.",
    verified: true,
    rating: 4.88,
    memberSince: "Dec 2025",
    stats: [
      { label: "Bulk group orders", value: "22" },
      { label: "Families fed", value: "180" },
      { label: "FPO Partners", value: "5 Cooperatives" },
    ],
  },

  // --- 1 PLATFORM OPERATIONS ADMIN ---
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "FarmNex Operations Admin",
    profileId: "admin.farmnex",
    password: "FarmNex@2026",
    role: "admin",
    phone: "9999999999",
    email: "admin@farmnex.in",
    location: "Central Operations Hub, MP",
    lat: 22.7196,
    lng: 75.8577,
    avatar: "FN",
    crops: ["All Commodities"],
    headline: "Central Operations & Mandi Settlement Desk",
    about: "Farm-Nex central operations, dispute resolution desk, weighing compliance monitor, and escrow settlement overseer.",
    verified: true,
    rating: 5.0,
    memberSince: "Jan 2024",
    stats: [
      { label: "Platform uptime", value: "99.9%" },
      { label: "Disputes resolved", value: "100%" },
      { label: "Active traders", value: "20+" },
    ],
  },
];

export function convertAccountToUserProfile(account: TestUserAccount): UserProfile {
  return {
    id: account.id,
    name: account.name,
    role: account.role,
    phone: account.phone,
    email: account.email,
    language_pref: "en",
    verified: account.verified,
    avatar: account.avatarUrl || account.avatar,
    created_at: new Date().toISOString(),
    farmer_profile: account.role === "farmer" ? {
      location: account.location,
      lat: account.lat,
      lng: account.lng,
      fpo_name: account.fpoName,
    } : undefined,
    buyer_profile: account.role === "buyer" ? {
      business_name: account.businessName || account.name,
      gst_verified: true,
      location: account.location,
      lat: account.lat,
      lng: account.lng,
    } : undefined,
    fpo_profile: account.role === "fpo" ? {
      organization_name: account.fpoName || account.name,
      district: account.location.split(",")[0].trim(),
      member_count: parseInt(account.stats.find(s => s.label.toLowerCase().includes("member"))?.value || "300", 10),
    } : undefined,
    consumer_profile: account.role === "consumer" ? {
      interests: account.crops,
    } : undefined,
  };
}

export function convertAccountToDemoProfile(account: TestUserAccount): DemoProfile {
  return {
    id: account.id,
    role: account.role,
    name: account.name,
    headline: account.headline,
    location: account.location,
    verified: account.verified,
    avatar: account.avatar,
    avatarUrl: account.avatarUrl,
    about: account.about,
    crops: account.crops,
    stats: account.stats,
    activity: [
      `Active member since ${account.memberSince}`,
      `Verified identity & trade credentials in ${account.location}`,
      `Specializing in ${account.crops.slice(0, 2).join(" & ")}`,
    ],
    profileHandle: `@${account.profileId || account.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}`,
    memberSince: account.memberSince,
    fpo: account.fpoName,
    business: account.businessName,
    phone: account.phone,
    email: account.email,
    gstNumber: account.role === "buyer" ? "23AAACA1122D1Z4" : undefined,
    procurementCapacity: account.procurementCapacity,
    paymentReliability: "Direct bank settlement (< 24h)",
    rating: account.rating || 4.85,
    completedDealsCount: parseInt(account.stats[0]?.value || "12", 10),
    farmSizeAcres: account.farmSizeAcres,
    soilType: account.role === "farmer" ? "Deep Vertisol Cotton Soil" : undefined,
    connectionsCount: (parseInt(account.stats[0]?.value || "10", 10) * 35) + 120,
    certifications: account.verified ? ["KYC Verified", "Digital Mandi ID"] : [],
    reviews: [
      {
        author: "Malwa Kisan Samriddhi FPO",
        role: "FPO Partner",
        comment: "Excellent produce quality and timely communication. Consistently reliable partner on the network.",
        rating: 5,
        date: "Aug 2026",
      },
    ],
  };
}


const LOCAL_REGISTERED_USERS_KEY = "farmnex_registered_accounts";

export function getCustomRegisteredAccounts(): TestUserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllAccounts(): TestUserAccount[] {
  const custom = getCustomRegisteredAccounts();
  const ids = new Set(custom.map(c => c.id));
  return [...custom, ...REAL_ACCOUNTS_20.filter(a => !ids.has(a.id))];
}

export function findAccountById(id: string): TestUserAccount | undefined {
  return getAllAccounts().find(a => a.id === id);
}

export function findAccountByProfileId(profileId: string): TestUserAccount | undefined {
  const clean = profileId.trim().toLowerCase().replace(/^@/, "");
  return getAllAccounts().find(a =>
    (a.profileId && a.profileId.toLowerCase() === clean) ||
    a.id.toLowerCase() === clean
  );
}

export function isProfileIdTaken(profileId: string, excludeId?: string): boolean {
  const clean = profileId.trim().toLowerCase().replace(/^@/, "");
  return getAllAccounts().some(a =>
    a.id !== excludeId &&
    a.profileId &&
    a.profileId.toLowerCase() === clean
  );
}

export function authenticateWithCredentials(identifier: string, passwordAttempt: string): { success: boolean; account?: TestUserAccount; error?: string } {
  const cleanId = identifier.trim().toLowerCase().replace(/^@/, "");
  const all = getAllAccounts();

  const matched = all.find(a =>
    (a.profileId && a.profileId.toLowerCase() === cleanId) ||
    (a.email && a.email.toLowerCase() === cleanId) ||
    (a.phone && a.phone.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "")) ||
    a.id.toLowerCase() === cleanId
  );

  if (!matched) {
    return { success: false, error: "No account found with this Profile ID, email, or mobile number." };
  }

  const expectedPassword = matched.password || "FarmNex@2026";
  if (passwordAttempt !== expectedPassword) {
    return { success: false, error: "Incorrect password. Please verify and try again." };
  }

  return { success: true, account: matched };
}

export function registerNewUserAccount(data: {
  name: string;
  role: AppRole;
  profileId: string;
  password: string;
  phone?: string;
  email?: string;
  location?: string;
  crops?: string[];
  headline?: string;
  about?: string;
  farmSizeAcres?: number;
  procurementCapacity?: string;
  businessName?: string;
  fpoName?: string;
}): { success: boolean; account?: TestUserAccount; error?: string } {
  const cleanProfileId = data.profileId.trim().toLowerCase().replace(/^@/, "");

  if (!cleanProfileId || cleanProfileId.length < 3) {
    return { success: false, error: "Profile ID must be at least 3 characters long." };
  }

  if (isProfileIdTaken(cleanProfileId)) {
    return { success: false, error: `Profile ID @${cleanProfileId} is already taken. Please choose another.` };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const initials = data.name
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "FN";

  const newAccount: TestUserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name.trim(),
    role: data.role,
    profileId: cleanProfileId,
    password: data.password,
    phone: data.phone?.trim(),
    email: data.email?.trim() || `${cleanProfileId}@farmnex.in`,
    location: data.location?.trim() || "Indore, Madhya Pradesh",
    lat: 22.7196,
    lng: 75.8577,
    avatar: initials,
    crops: data.crops && data.crops.length > 0 ? data.crops : ["Soybean", "Wheat"],
    headline: data.headline?.trim() || `${data.role.toUpperCase()} | ${data.location || "Central Mandi Network"}`,
    about: data.about?.trim() || `Verified ${data.role} registered on the FarmNex Direct Agricultural Network.`,
    farmSizeAcres: data.farmSizeAcres,
    procurementCapacity: data.procurementCapacity,
    businessName: data.businessName,
    fpoName: data.fpoName,
    verified: true,
    rating: 5.0,
    memberSince: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    stats: [
      { label: "Completed trades", value: "0" },
      { label: "Active network status", value: "Live" },
      { label: "Trust score", value: "100%" },
    ],
  };

  if (typeof window !== "undefined") {
    const existing = getCustomRegisteredAccounts();
    window.localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify([newAccount, ...existing]));
  }

  return { success: true, account: newAccount };
}
