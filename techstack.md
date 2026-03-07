# GuardianRoute – Tech Stack

---

# 1. Frontend

Framework:
- React (Vite)

Libraries:
- @react-google-maps/api
- Axios
- Tailwind CSS
- React Router
- Framer Motion
- Zustand (optional state management)

Hosting:
- Vercel

---

# 2. Backend

Runtime:
- Node.js

Framework:
- Express.js

Libraries:
- @supabase/supabase-js
- cors
- dotenv
- body-parser

Deployment:
- Vercel Serverless Functions

---

# 3. Database

Provider:
- Supabase (PostgreSQL)

Advantages:
- Free tier
- Managed PostgreSQL
- Secure
- Realtime capabilities
- Easy scaling

---

# 4. Architecture

React Frontend
      ↓
Express API
      ↓
Graph + Risk Engine (JavaScript)
      ↓
Supabase (PostgreSQL)

Note:
Web application logic is entirely JavaScript-based.
C++ implementation exists separately for academic evaluation.

---

# 5. Folder Structure

root/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── App.jsx
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── db/
│   └── server.js
│
└── README.md

---

# 6. Environment Variables

Frontend (.env):
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_BASE_URL=

Backend (.env):
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=

---

# 7. Security Guidelines

- Restrict Google API key by domain
- Enable RLS in Supabase
- Never expose Supabase service role key
- Validate all backend inputs
- Use environment variables properly

---

# 8. Scalability Considerations

- Add caching for frequent routes
- Add accident ingestion pipeline
- Add heatmap visualization
- Add admin dashboard
