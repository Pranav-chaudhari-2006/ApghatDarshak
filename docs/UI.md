# GuardianRoute – UI/UX Specification
## SaaS-Style Risk Intelligence Dashboard

---

# 1. Visual Identity & Design System

Theme: "Safety Dark/Light Mode"

Primary (Safe):
#10B981 (Emerald 500)

Danger (Blackspot):
#E11D48 (Rose 600)

Warning (Balanced):
#F59E0B (Amber 500)

Background:
Light → #F8FAFC
Dark → #0F172A

Typography:
Headings → Inter / Geist Sans (Bold)
Coordinates/Data → JetBrains Mono (Monospace)

---

# 2. Layout Architecture

Master-Detail Map Layout

-----------------------------------------
| Navbar (64px height)                 |
-----------------------------------------
| Sidebar (380px) | Map Canvas         |
-----------------------------------------
| Bottom Intelligence Drawer           |
-----------------------------------------

---

# 3. Components

## Navbar
- Project Logo (GuardianRoute)
- System Status: "Online (Supabase)"
- Theme Toggle

---

## Floating Sidebar (Glassmorphic Style)

Width: 380px
Backdrop blur enabled

Contains:

1. Search Card
   - Source Input (Autocomplete)
   - Destination Input (Autocomplete)

2. Mode Switcher (Segmented Control)
   - Shortest
   - Safest
   - Balanced

3. Action Hub
   - Compute Route (Primary Button)
   - Reset Button

4. Route Summary
   - Total Distance
   - Total Risk
   - Safety Grade
   - Warning Messages

---

## Map Canvas

Full-bleed Google Maps instance.

Route Rendering:

Safe Route:
- Solid line
- strokeWeight: 6
- strokeColor: #10B981

Risky Route:
- Dashed line
- strokeWeight: 4
- strokeColor: #E11D48
- opacity: 0.5

Blackspot Markers:
- Pulsing red concentric circle
- ⚠️ icon
- On click: InfoWindow showing accident breakdown

Custom Markers:

Source:
White circle with blue ring

Destination:
Black circle with white "B"

---

## Bottom Intelligence Panel

Expandable Drawer

Contains:

1. Route Comparison Table

| Mode | Distance | Risk |

2. Safety Legend
🔴 Blackspot  
🟢 Safe Route  
⚠ High Risk  

---

# 4. Interaction States

Idle:
- Map shows clustered blackspots

Computing:
- Button spinner
- Top progress bar

Success:
- Map fitBounds(route)
- Sidebar shows Safety Grade

Risk Warning:
If shortest route > 40% riskier than safest:
Display warning toast.

---

# 5. Frontend Component Tree

src/components/
├── Layout/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── BottomDrawer.jsx
├── Map/
│   ├── GoogleMapView.jsx
│   ├── PolylineLayer.jsx
│   └── BlackspotLayer.jsx
└── UI/
    ├── ModeToggle.jsx
    ├── RiskBadge.jsx
    └── LocationInput.jsx

---

# 6. Responsiveness

- Mobile (<768px):
  Sidebar becomes bottom sheet
- Map always remains primary focus

---

# 7. Animations

- framer-motion for:
  - Sidebar transitions
  - Drawer expansion
  - Blackspot pulse effect
