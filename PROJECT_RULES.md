# Drink Case Opening Website – Project Rules

## 🎯 Goal
A fun web application inspired by CS:GO case openings, but instead of skins, the user opens "drink cases" that reveal random cocktails or beverages.

The website should:
- Animate the case opening like CS:GO case roulette.
- Randomly select a drink from a category.
- Fetch and store drink data from external sources (e.g., Drinkoteket) via scraping.
- Work smoothly on desktop and mobile.
- Be easy to host on Ubuntu Server + Docker + Nginx.

---

## 📂 Project Structure

/project-root
│
├── /client # Frontend code (Vue 3 + Vite + Tailwind)
│ ├── /src
│ │ ├── /assets # Images, icons, styles
│ │ ├── /components # Vue components
│ │ ├── /composables 
│ │ ├── /pages # Page components (Home, CaseOpen, About)
│ │ ├── /router # Routing pages
│ │ ├── /store # Pinia state management
│ │ ├── /utils # Animation helpers, API wrappers
│ │ ├── App.vue
│ │ └── main.js
│ └── vite.config.js
│
├── /server # Backend code (Node.js + Express)
│ ├── /routes # API endpoints
│ ├── /services # Business logic (case opening, drink fetching)
│ ├── /scraper # Scraping scripts using cheerio
│ ├── /data # Local JSON/DB storage for drinks
│ ├── server.js
│ └── config.js
│
├── /docker # Docker/Portainer configs
│ ├── nginx.conf
│ └── docker-compose.yml
│
├── .env # Environment variables (API keys, DB path)
├── package.json
└── PROJECT_RULES.md # This file


---

## 🛠️ Tech Stack

**Frontend:**
- Vue 3
- Vite
- Tailwind CSS
- GSAP for animations

**Backend:**
- Node.js + Express
- Cheerio + Axios for scraping
- JSON for drink data

**Hosting:**
- Nginx reverse proxy
- Docker containers for frontend & backend
- Ubuntu Server (self-hosted)

---

## 📜 Rules for Copilot

1. **Frontend coding style**
   - Use Vue 3 `<script setup>` syntax.
   - Components should be small and reusable.
   - Keep styles in Tailwind CSS classes, avoid inline styles unless needed.
   - Animations should use GSAP.

2. **Backend coding style**
   - Use Express with separate route, service, and data layers.
   - Do not hardcode API URLs or credentials (use `.env`).
   - Return JSON responses with `{ success: boolean, data: any }` structure.

3. **Scraping rules**
   - Use Axios for HTTP requests.
   - Use Cheerio for HTML parsing.
   - Store scraped data locally in `/server/data/drinks.json` before serving.

4. **Case opening logic**
   - All random drink selection happens on the server.
   - Server returns a shuffled list with the winning drink in a random visible position for animation.

5. **General**
   - Code must be clean and commented.
   - Follow the folder structure strictly.
   - Avoid TypeScript unless explicitly needed.
   - Use ES modules (`import` / `export`) instead of `require`.

---

## 🔮 Future Features (Optional)
- User accounts with favorite drinks.
- Leaderboard for most opened drinks.
- Different “case types” (e.g., cocktails, shots, alcohol-free).