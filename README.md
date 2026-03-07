# ApaghatDarshak - Accident Blackspot Detection System 🛡️🚗

ApaghatDarshak is a modern, risk-aware navigation system designed to detect accident-prone road segments (blackspots) in Pune and recommend safer travel routes.

## 🚀 Overview

The system analyzes historical accident data to visualize high-risk areas and provides three distinct routing modes:
- **Shortest:** Prioritizes minimum distance.
- **Safest:** Prioritizes routes with the lowest accident risk scores.
- **Balanced:** A weighted approach combining both safety and efficiency.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Map Engine:** MapLibre GL
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Logic:** Custom Dijkstra-based Routing Engine

## 📊 Dataset: Pune Road Network

The system currently features a dense dataset of **200 real-world locations** across Pune, including:
- **Major Hubs:** Shivajinagar, Hinjewadi IT Park, Magarpatta, Viman Nagar, and PCMC.
- **Data Points:** 200 Nodes, 200 Roads, and 200 Accident Records (Minor, Major, and Fatal).

## 📂 Project Structure

```text
root/
├── frontend/          # React application (Map UI, Sidebar, Search)
├── backend/           # Express API
│   ├── controllers/   # Routing logic & logic checks
│   ├── routes/        # API Endpoints
│   └── seed/          # SQL Database Seed Data
├── requirements.md    # Detailed functional requirements
└── techstack.md       # Technical specifications
```

## ⚙️ Setup Instructions

### 1. Database Setup
1. Create a project on [Supabase](https://supabase.com/).
2. Run the schema and seed scripts found in `backend/seed/pune_accidents.sql`.

### 2. Backend Config
1. Move to the `backend` directory.
2. Create a `.env` file:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   PORT=5000
   ```
3. Run `npm install` and `npm start`.

### 3. Frontend Config
1. Move to the `frontend` directory.
2. Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
3. Run `npm install` and `npm run dev`.

## 🔄 Automatic Doc Sync Workflow
I will keep this README updated with every significant functional change, UI update, or workflow modification made to the project.

---
*Developed for safety-first smart city navigation.*
