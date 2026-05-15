# Food Delivery Comparison & Smart Redirect Platform
## Product Requirements Document (PRD)

---

## 1. Product Overview

### Product Vision

Build a platform where users can:

- Search food items across multiple delivery platforms
- Compare prices, delivery fees, offers, and ETA
- Discover the cheapest or best-value option
- Redirect seamlessly to the chosen delivery platform

> **"Google Flights for food delivery"**

### Initial Supported Platforms

- Swiggy
- Zomato
- Restaurant websites

---

## 2. Problem Statement

**Users currently:**

- Open multiple delivery apps
- Compare prices manually
- Search repeatedly across apps
- Miss discounts and better deals
- Waste time deciding where to order

**The platform solves:**

- Fragmented food discovery
- Hidden pricing differences
- Poor comparison experience
- Inefficient ordering workflow

---

## 3. Target Users

### Primary Users

- College students
- Working professionals
- Frequent food delivery users
- Budget-conscious customers

### Secondary Users

- Fitness-focused users
- Group ordering users
- Food explorers

---

## 4. Core Features (MVP)

### 4.1 Unified Search

Users can search:

- Food items
- Restaurants
- Cuisine types

**Examples:** Paneer Burger, Chicken Biryani, Domino's Pizza

The app fetches data from Swiggy, Zomato, and restaurant websites.

---

### 4.2 Price Comparison

Show for each result:

- Food price
- Delivery fee
- Taxes / platform fees
- Estimated delivery time
- Restaurant rating
- Offers / coupons

**Example comparison table:**

| Platform | Price | Delivery | ETA     | Final Price |
|----------|-------|----------|---------|-------------|
| Swiggy   | ₹199  | ₹39      | 30 mins | ₹238        |
| Zomato   | ₹189  | ₹49      | 28 mins | ₹238        |

---

### 4.3 Smart Recommendation

The system highlights:

- Cheapest option
- Fastest delivery
- Best-rated restaurant
- Best overall value

---

### 4.4 Redirect Ordering

Users are redirected to:

- Swiggy
- Zomato
- Restaurant website

**The platform itself does NOT (initially):**

- Handle payments
- Manage logistics
- Deliver food

This reduces operational complexity.

---

### 4.5 Search History & Favorites

Users can:

- Save restaurants
- Save favorite items
- View recent searches

---

## 5. Future Features

### AI Recommendation Engine

- Best meal under ₹200
- High-protein meals nearby
- Cheapest pizza combo

### Personalized Recommendations

Based on order history, budget, preferences, and cuisine interests.

### Offer Prediction

Notify users when:

- Prices drop
- Coupons appear
- Delivery becomes free

### Grocery & Quick Commerce Expansion

Future integrations: Blinkit, Zepto, Instamart

---

## 6. Technical Architecture

### High-Level Architecture

```
User App
   ↓
Frontend (Next.js)
   ↓
Backend API (Node.js / Express)
   ↓
Supabase Database
   ↓
Redis Cache (Upstash)
   ↓
Playwright Scrapers
   ↓
Swiggy / Zomato APIs
```

---

## 7. Tech Stack

### Frontend

| Layer     | Technology        |
|-----------|-------------------|
| Framework | Next.js           |
| UI        | Tailwind CSS      |
| Components| ShadCN UI         |

**Why Next.js?** Fast development, Vercel deployment, built-in API routes, SEO support, scalable architecture.

### Backend

| Layer       | Technology      |
|-------------|-----------------|
| Runtime     | Node.js         |
| Framework   | Express.js      |

**Responsibilities:** Search orchestration, data normalization, API responses, authentication handling, cache management.

### Database

| Layer    | Technology              |
|----------|-------------------------|
| Primary  | Supabase (PostgreSQL)   |

**Why Supabase?** Relational structure, better querying, easier comparisons, free tier.

### Cache Layer

| Layer | Technology    |
|-------|---------------|
| Cache | Upstash Redis |

**Usage:** Search caching, popular queries, fast retrieval, reduced DB load.

### Authentication

| Layer | Technology              |
|-------|-------------------------|
| Auth  | Firebase Authentication |

**Features:** Google Login, Phone Login, Session handling.

### Scraping Infrastructure

| Layer | Technology  |
|-------|-------------|
| Tool  | Playwright  |

**Purpose:** Browser automation, API interception, session handling, dynamic content extraction.

> **Important:** The system does NOT rely on HTML scraping. It intercepts internal APIs and JSON responses.

---

## 8. Data Extraction Strategy

### Core Principle

The platform extracts restaurant menus, prices, offers, and delivery fees from delivery platforms.

### Extraction Method

1. Playwright opens platform website
2. System intercepts internal API calls
3. JSON responses are extracted
4. Data is normalized
5. Normalized data is stored in database

### Why API Interception?

**Advantages:**
- Faster
- More reliable
- Structured JSON data
- Less fragile than HTML scraping

**Avoided approach:** Visual DOM / HTML scraping

---

## 9. Scraper Architecture

### Platform Adapter Structure

```
/adapters
  swiggy.js
  zomato.js
  restaurant.js
```

Each adapter:
- Understands platform-specific APIs
- Extracts required data
- Converts data into a common format

### Common Data Format

```json
{
  "restaurant": "Burger King",
  "platform": "Swiggy",
  "item": "Veg Burger",
  "price": 129,
  "delivery_fee": 39,
  "rating": 4.3
}
```

---

## 10. Database Design

### Tables

| Table          | Stores                                              |
|----------------|-----------------------------------------------------|
| Restaurants    | Restaurant names, IDs, ratings, location            |
| Platforms      | Swiggy, Zomato, others                              |
| Menu_Items     | Item names, category, normalized item names         |
| Prices         | Price, delivery fee, platform, timestamps           |
| Offers         | Coupons, discounts, cashback                        |
| Search_History | User searches, timestamps                           |

---

## 11. Search Flow

### User Journey

1. User searches: `"Paneer Burger"`
2. Backend checks Redis cache
3. If cache miss → query database / fetch latest stored results
4. Results are normalized
5. Frontend displays comparison
6. User clicks redirect button
7. Platform deep link opens

---

## 12. Caching Strategy

### Core Principle

The system does **NOT** scrape live on every request. Instead:

- Scheduled background updates
- Cached menus
- Pre-fetched prices

### Scheduler Frequency

Every **10–15 minutes**, the scraper updates:

- Popular restaurants
- Trending items
- Current offers

---

## 13. Deployment Strategy

| Component         | Host                        |
|-------------------|-----------------------------|
| Frontend          | Vercel                      |
| Backend           | Render                      |
| Scrapers (MVP)    | Local laptop/PC             |
| Scrapers (later)  | VPS (Hetzner / Contabo)     |

---

## 14. Scaling Strategy

| Stage        | Scope                                                     |
|--------------|-----------------------------------------------------------|
| MVP          | 1 city, 20–50 restaurants, 2 platforms                    |
| Growth       | More cities, more restaurants, more frequent updates      |
| Scale        | Distributed scrapers, queue systems, proxy rotation, AI   |

---

## 15. Security & Legal Considerations

### Risks

- API changes
- Anti-bot systems
- IP blocking
- Legal notices

### Mitigation

- Low-frequency scraping
- Cached results
- Modular scrapers
- Rate limiting
- Eventual platform partnerships

---

## 16. MVP Scope

### Included

- Unified search
- Price comparison
- Redirect ordering
- Cached pricing
- Restaurant listing
- User authentication

### Excluded Initially

- Payments
- Delivery management
- Live tracking
- Wallet system
- Subscription system

---

## 17. Success Metrics

### Product Metrics

| Metric              | Description                          |
|---------------------|--------------------------------------|
| Daily active users  | Number of unique daily users         |
| Searches per user   | Average searches per session         |
| Redirect CTR        | % of searches leading to redirects  |
| Session duration    | Average time spent per session       |
| Saved amount        | Average savings shown per user       |

### Technical Metrics

| Metric               | Description                        |
|----------------------|------------------------------------|
| Scraper success rate | % of successful data extractions  |
| API response time    | p95 backend latency                |
| Cache hit rate       | % of requests served from cache    |
| Data freshness       | Age of pricing data at query time  |
