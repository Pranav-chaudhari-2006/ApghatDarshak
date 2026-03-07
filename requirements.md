# ApaghatDarshak
## Accident Blackspot Detection & Risk-Aware Route Analysis
### Web Application – Requirements Document (React Version)

---

# 1. Project Overview

GuardianRoute is a web-based Accident Blackspot Detection and Risk-Aware Route Recommendation System.

The system:

- Detects accident-prone road segments (blackspots)
- Computes accident risk per road
- Provides 3 routing modes:
  - Shortest Route
  - Safest Route
  - Balanced Route (Distance + Risk)
- Displays route visually using Google Maps
- Highlights blackspots with severity indicators
- Handles routing edge cases gracefully

⚠ IMPORTANT:
All routing and graph logic in the web application is implemented in JavaScript.
A separate C++ implementation exists for academic submission but is NOT integrated into the web app.

---

# 2. Functional Requirements

## 2.1 User Inputs (Frontend)

User must be able to:

- Enter Source location (Google Places Autocomplete)
- Enter Destination location (Google Places Autocomplete)
- Select Routing Mode:
  - Shortest
  - Safest
  - Balanced
- Click "Compute Route"
- Reset the route

---

## 2.2 Backend Responsibilities

Backend must:

1. Fetch nodes and roads from Supabase
2. Fetch accident records
3. Compute risk score:

   Risk = (minor × 1) + (major × 3) + (fatal × 5)

4. Detect blackspots:
   If risk > defined threshold → mark as blackspot

5. Execute Modified Dijkstra Algorithm:
   - Shortest → weight = distance
   - Safest → weight = risk
   - Balanced → weight = α × distance + β × risk

6. Handle edge cases:
   - No accident data
   - Disconnected graph
   - Extremely high risk routes
   - Multiple equal-weight paths

7. Return response:

{
  path: [{ lat, lng }],
  totalDistance: number,
  totalRisk: number,
  blackspots: [{ lat, lng, risk }]
}

---

# 3. API Endpoints

## POST /api/compute-route

Request:
{
  source: string,
  destination: string,
  mode: "shortest" | "safest" | "balanced"
}

Response:
{
  path: [],
  totalDistance: number,
  totalRisk: number,
  blackspots: []
}

---

## GET /api/blackspots

Returns all detected blackspots.

---

# 4. Database Requirements (Supabase - PostgreSQL)

Tables:

## nodes
- id (primary key)
- latitude (float)
- longitude (float)

## roads
- id
- start_node_id (FK → nodes)
- end_node_id (FK → nodes)
- distance (float)
- risk_score (float)

## accidents
- id
- road_id (FK → roads)
- minor_count (int)
- major_count (int)
- fatal_count (int)

Indexes:
- road_id
- start_node_id
- end_node_id

---

# 5. Edge Cases

1. No accident data → assign minimal default risk
2. Same distance → choose lower risk
3. Same risk → choose shorter distance
4. Disconnected graph → return “No Route Exists”
5. Extremely high risk → block route
6. Invalid input → return validation error

---

# 6. Google Maps API (Free Tier)

Use:
- Maps JavaScript API
- Places API

Google provides $200/month free credit.

Steps:
1. Create Google Cloud project
2. Enable required APIs
3. Generate API key
4. Restrict:
   - HTTP referrer (localhost + Vercel domain)
   - Only required APIs

Store in:
VITE_GOOGLE_MAPS_API_KEY
