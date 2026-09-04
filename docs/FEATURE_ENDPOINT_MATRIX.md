# FarmNex Feature and Endpoint Matrix

The frontend uses the existing FastAPI contracts whenever they are available. Features that do not have a backend contract are routed through domain services and are explicitly marked as demo data in development. They are not presented as live operations in production.

| Feature | Existing API endpoint | Response model | UI consumer | Missing endpoint / dependency |
|---|---|---|---|---|
| Farmer OTP sign-in | `POST /auth/farmer/send-otp`, `POST /auth/farmer/verify-otp` | `TokenResponse` | Landing auth panel | Production SMS provider and OTP expiry |
| Buyer sign-in and registration | `POST /auth/buyer/login`, `POST /auth/buyer/register` | `TokenResponse` | Landing auth panel | Business verification workflow |
| Current authenticated user | `GET /auth/me` | `UserOut` | `UserProvider`, profile shell | Token refresh / revocation endpoint |
| Farmer crop listing | `POST /marketplace/listings` | `CropListingOut` | Produce form | Image upload, update, pause, close endpoints |
| Farmer listings | `GET /marketplace/listings/my` | `CropListingOut[]` | My Produce, farmer home | Pagination and listing analytics |
| Public supply discovery | `GET /marketplace/listings` | `CropListingOut[]` | Marketplace, buyer discovery | Location, quantity, quality, date filters and pagination |
| Buyer demand post | `POST /marketplace/demands` | `DemandPostOut` | Procurement form | RFQ lifecycle fields, destination, response tracking |
| Public buyer requirements | `GET /marketplace/demands` | `DemandPostOut[]` | Find Buyers, marketplace | Search/filter parameters and demand response endpoint |
| Buyer demand management | `GET /marketplace/demands/my`, `DELETE /marketplace/demands/{id}` | `DemandPostOut[]` | Buyer procurement | Edit/status/response endpoints |
| Farmer buyer matching | `GET /matching/best-buyers/{listing_id}` | `BuyerMatchOpportunity[]` | Best net realization | Reliability and pickup fields should be persisted by backend |
| Accept match | `POST /matching/accept` | `TradeAgreementOut` | Match detail, messages | Counter-offer and buyer confirmation endpoints |
| Agreements and lifecycle | `GET /marketplace/agreements`, `GET /marketplace/agreements/{id}`, `PATCH /marketplace/agreements/{id}/status` | `TradeAgreement` | Deals, Orders, order detail | Documents, disputes, logistics, event timestamps, participant permissions |
| Market price history | `GET /intelligence/price-trend` | `PriceTrendResponse` | Market page, market summary | District/mandi granularity and caching |
| Market outlook | `GET /intelligence/demand-forecast` | `DemandForecastResponse` | Market explanation | Forecast should expose interval and model version |
| Market movement explanation | `GET /intelligence/why-price-moved` | `WhyPriceMovedResponse` | Market explanation | Arrival/demand source metadata per factor |
| Network feed | `GET /community/posts` | `CommunityPostItem[]` | Network feed | Feed types, reactions, follows, saves, media, pagination |
| Create network post | `POST /community/posts` | `CommunityPostItem` | Network composer | Requirement/harvest post fields and media upload |
| Post reply | `POST /community/posts/{id}/reply` | `PostReplyItem` | Post card/detail | Thread pagination, reactions, moderation state |
| Expert verification | `POST /community/posts/{id}/verify` | object | Admin/network | Expert profile and verification queue |
| Admin overview | `GET /admin/stats` | `AdminKPIData` | Admin overview | Users, unresolved issues, health, trends |
| Admin map | `GET /admin/map-nodes` | `AdminMapResponse` | Admin marketplace | Real map tiles, privacy aggregation and filters |
| Global search | None | Domain `SearchResult` | GlobalSearch, marketplace | Search index across people, supply, demand, posts, locations |
| Profiles and reputation | None | Domain `Profile` | Profile routes, trust UI | Public profile, reviews, trade history and privacy controls |
| Messages | None | Domain `Conversation` | Messages, contextual chat | Conversations, messages, read state, presence, offer actions |
| Notifications | None | Domain `Notification` | Notification center | Notification feed and deep-link metadata |
| Saved items and alerts | None | Domain `SavedItem` | Watchlist, marketplace | Saved items, saved searches, price/demand alerts |
| FPO members, pooled supply, logistics | None | Domain FPO models | FPO workspace | FPO organization, member, allocation and logistics APIs |
| Consumer catalog, cart, orders | None | Domain consumer models | Consumer workspace | Catalog, inventory, checkout, delivery and consumer order APIs |
| Disputes and documents | None | Domain `Dispute` / `DealDocument` | Orders, admin trust and disputes | Case management, document storage, audit events |

## Current route audit

Implemented before the rebuild: `/`, `/farmer`, `/farmer/list`, `/farmer/smart-sell`, `/buyer`, `/orders`, `/community`, `/intelligence`, `/admin`.

Broken or missing links found during the audit: `/buyer/find`, `/buyer/procurement`, `/admin/marketplace`, `/admin/transactions`. The rebuilt navigation only points at routes that exist. Legacy URLs remain as aliases where useful, while new role workspaces use the route families documented in the product brief.

## Data mode

`src/lib/data/demo.ts` contains clearly labelled development/demo records. `src/lib/services/domain.ts` owns API calls and fallback behavior. In development, the service falls back to demo data when an unavailable backend endpoint is required. Set `NEXT_PUBLIC_DEMO_MODE=false` in a production build to disable fallback records and surface an honest empty/error state instead.
