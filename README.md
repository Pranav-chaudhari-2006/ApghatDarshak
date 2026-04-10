<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Project Status" />
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/License-MIT-orange.svg" alt="License" />
  <img src="https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF.svg?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-5.0-000000.svg?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Supabase-DB-3ECF8E.svg?logo=supabase" alt="Supabase" />
</div>

<h1 align="center">ApghatDarshak</h1>
<p align="center"><b>Risk-Aware Navigation & Accident Blackspot Detection System 🛡️🚗</b></p>

---

## 📖 Overview

**ApghatDarshak** (Accident Viewer/Detector) is a modern, safety-first web application designed to detect accident-prone road segments (blackspots) in Pune and recommend safer travel routes. 

By analyzing historical accident data, the system visualizes high-risk areas using interactive 3D map environments and provides three distinct routing modes calculated via a custom Dijkstra-based graph algorithm:
- 🟢 **Safest:** Prioritizes routes with the lowest accident risk scores.
- 🟡 **Balanced:** A weighted approach combining both safety and efficiency.
- 🔴 **Shortest:** Minimal distance to destination.

---

## ✨ Features

- **Interactive 3D Maps:** Real-time rendering powered by MapLibre GL and React Globe.
- **Dynamic Routing Engine:** In-built collision & graph algorithms processing risk scores.
- **Accident Heatmaps & Blackspots:** Visualizations of critical severity zones (Minor, Major, Fatal).
- **Secure Authentication:** User login, session management and protected routes.
- **Rich Dashboard UI:** High-performance interface utilizing Framer Motion for cinematic animations and Tailwind CSS for styling.
- **Real-World Dataset:** Comes pre-seeded with 200 nodes & 200 interconnected road segments representing Pune's actual topology.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS / Framer Motion
- **Map Visualizations:** MapLibre-gl, react-globe.gl, react-force-graph-3d
- **State Management & Data Fetching:** Zustand, Axios
- **Routing:** React Router v7
- **Authentication:** Supabase Client

### Backend API
- **Framework:** Express.js (Node.js)
- **Algorithm Computation:** Graph-based custom Dijkstra routing
- **Middlewares:** CORS, Body-Parser, Dotenv
- **Database Connector:** Supabase (PostgreSQL)

---

## 📂 Project Structure

```text
root/
├── frontend/          # React App (Map UI, Sidebar, Search, Dashboards)
│   ├── src/           # UI components, pages, stores, and config
│   ├── public/        # Static assets
│   └── package.json
├── backend/           # Express API
│   ├── controllers/   # Routing engine & algorithmic logic
│   ├── routes/        # API Endpoints exposed to frontend
│   ├── seed/          # SQL Database Seed Data (pune_accidents.sql)
│   ├── server.js      # Main Express App
│   └── package.json
└── docs/              # System Documentation (Requirements, Flowcharts)
```

---

## ⚙️ Local Development Setup

### 1. Database Setup
1. Create a free project on [Supabase](https://supabase.com/).
2. Access the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of `backend/seed/pune_accidents.sql` to generate tables and seed real-world accident data.

### 2. Backend Environment
1. Navigate to the `backend` folder: `cd backend`
2. Create a `.env` file referencing `.env.example`:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5000
   ```
3. Install dependencies and start server:
   ```bash
   npm install
   npm run dev
   ```

### 3. Frontend Environment
1. Navigate to the `frontend` folder: `cd frontend`
2. Create a `.env` file referencing `.env.example`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Install dependencies and start client:
   ```bash
   npm install
   npm run dev
   ```

---

## 🚀 Deployment Guide (What to do next)

Since the frontend and backend are completely decoupled, you will need to deploy them to two separate hosting providers. 

### Step 1: Deploy the Backend (API)
Recommended Providers: **Render**, **Railway**, or **Fly.io**
1. Sign up for [Render.com](https://render.com/) or Railway.
2. Create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `backend` (if supported) or explicitly specify the start command as `cd backend && npm start` / `node server.js`.
5. Add your Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `PORT=5000` (Optional depending on provider)
6. Deploy! Once finished, keep the new API URL safe (e.g. `https://apghatdarshak-api.onrender.com`).

### Step 2: Deploy the Frontend (Client App)
Recommended Providers: **Vercel** or **Netlify**
1. Sign up for [Vercel](https://vercel.com/) (Most recommended for Vite/React Apps).
2. Create a new Project and import your GitHub repository.
3. Edit the **Root Directory** setting to `frontend`.
4. Ensure the Framework Preset is set to **Vite**.
5. Add your Environment Variables in the Vercel dashboard:
   - `VITE_API_BASE_URL=https://<your-backend-render-url>.com/api` *(Critical: Change localhost to your new live backend URL!)*
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click Deploy.

### Step 3: Database Settings
- Your **Supabase Database** is already hosted in the cloud. You do NOT need to redeploy the database.

> **🎉 Congratulations!** Once both Vercel and Render finalize building, your application will be live over the internet!

---
*Developed for safety-first smart city navigation.*
