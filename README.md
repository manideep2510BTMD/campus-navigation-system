# 🗺️ CampusNav – Campus Navigation System

> **Hackathon Project** | Topic: Graphs, BFS/Dijkstra | Mobile-First Web App

Find the **shortest walking route** between buildings on campus using **Dijkstra's Algorithm**.

---

## 🚀 Quick Start (Localhost)

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
# → Running on http://localhost:5000
```

### 2. Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** on your phone or browser.

---

## 📁 Project Structure

```
campus-nav/
├── backend/
│   ├── server.js                    # Express entry point
│   └── src/
│       ├── algorithms/dijkstra.js   # Dijkstra + BFS implementation
│       ├── data/campus.js           # Campus graph (10 nodes, 16 edges)
│       └── routes/
│           ├── auth.js              # Login / Register / Logout
│           └── navigation.js        # Route calculation API
├── frontend/
│   ├── index.html
│   └── src/
│       ├── App.jsx                  # Auth state + routing
│       ├── index.css                # Space Grotesk theme (blue/orange)
│       └── components/
│           ├── Login.jsx            # Login + Register with guard rails
│           ├── Dashboard.jsx        # Main map + route finder
│           ├── MapView.jsx          # SVG campus map
│           ├── RouteResult.jsx      # Step-by-step directions
│           ├── CookieBanner.jsx     # Cookie consent
│           └── PrivacyPolicy.jsx    # Privacy policy page
└── README.md
```

---

## 🧮 Algorithm

### Dijkstra's Shortest Path
- Finds minimum-weight path (shortest distance in meters)
- O((V + E) log V) time complexity
- All edge weights are non-negative ✓

### BFS (Bonus)
- Finds path with fewest hops
- Shown in result for comparison with Dijkstra

### Campus Graph
| Metric     | Value |
|------------|-------|
| Buildings (nodes) | 10 |
| Paths (edges)     | 16 |
| Graph type        | Undirected, weighted |

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 Auth | Login/Register with JWT + bcrypt |
| 🍪 Cookies | HTTP-only session cookies with consent banner |
| 🛡️ Guard Rails | Client + server-side input validation |
| 🗺️ SVG Map | Interactive campus map with animated route |
| 📍 Route | Step-by-step turn-by-turn directions |
| 🔄 BFS compare | Shows Dijkstra vs BFS hop count |
| 📱 Mobile-first | Designed for 430px mobile screens |
| 🔒 Privacy Policy | Full GDPR-style privacy page |
| 🎨 Font | Space Grotesk (non-standard, modern) |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express
- **Auth**: JWT + bcrypt + HTTP-only cookies
- **Algorithm**: Dijkstra's (custom implementation)
- **Font**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- **Styling**: Pure CSS (no frameworks, no purple!)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/auth/me` | Verify session |
| GET  | `/api/nav/buildings` | All buildings |
| GET  | `/api/nav/edges` | All campus paths |
| POST | `/api/nav/route` | Get shortest route |

---

## 🏆 Hackathon Notes

- Graph algorithm clearly commented for judges
- BFS vs Dijkstra comparison shown in results
- Input validated both client and server side
- Mobile-first responsive design
- Cookie consent + privacy policy included

---

*Built with ❤️ for the Hackathon*
