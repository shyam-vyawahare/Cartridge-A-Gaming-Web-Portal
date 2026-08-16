# Cartridge 🕹️
### Reload your Gaming Nostalgia

Cartridge is a responsive, browser-based gaming platform built around an arcade-marquee identity — play puzzle and brain-teaser games instantly, browse featured web games, and (soon) unlock game solutions and curated gameplay videos.

---

## 🚧 Status: Under Development (V1 — Basic Build)

This project is being built incrementally, one file/feature at a time. Nothing here is production-ready yet. Expect breaking changes, placeholder content, and "Coming Soon" tabs until V1 is feature-complete.

### V1 Roadmap Checklist

- [ ] Landing page (marquee hero, gamer-centric copy, "Play Now" CTA)
- [ ] One-time device-detection modal (mobile vs desktop, remembered via localStorage)
- [ ] Dashboard — cartridge-style game tiles, sorted by category (Puzzle, Brain Teaser, Retro)
- [ ] Hover lift/glow effect on tiles (desktop only)
- [ ] Fully responsive layout (mobile + desktop)
- [ ] At least 1–2 playable puzzle games (in-browser)
- [ ] Persistent nav / tab bar across pages
- [ ] Tab: Featured Web Games — *Coming Soon* placeholder
- [ ] Tab: Game Solutions — *Coming Soon* placeholder
- [ ] Tab: Gameplay — *Coming Soon* placeholder
- [ ] `games.json` driven tile rendering (add a game without touching HTML)

---

## 🎨 Design Identity

**Concept:** Arcade Marquee — game tiles styled as cartridges, hero styled as a glowing marquee lightbox.

| Token | Value | Use |
|---|---|---|
| Deep Indigo | `#1A1633` | Base background |
| Panel Purple | `#241E45` | Cards / surfaces |
| Marquee Pink | `#FF3D7F` | Primary accent |
| Marquee Gold | `#FFC145` | Secondary accent / highlights |
| Lavender White | `#F2EFFF` | Text |

**Type:** Press Start 2P (display, sparing use) · Space Grotesk (body) · JetBrains Mono (stats/data)

---

## 📁 Project Structure

```
gaming-website/
├── index.html                     # Landing page (hero + device-check modal)
├── dashboard.html                 # Home tab — game tiles by category
├── featured-web-games.html        # Coming Soon
├── game-solutions.html            # Coming Soon
├── gameplay.html                  # Coming Soon
├── games/
│   └── puzzle/
│       ├── game-1/
│       │   ├── index.html
│       │   ├── game.js
│       │   └── style.css
│       └── game-2/...
├── assets/
│   ├── css/
│   │   ├── tokens.css             # design tokens: color, type, spacing
│   │   ├── base.css               # resets, global element styles
│   │   ├── components.css         # nav, cartridge tiles, buttons, modal
│   │   ├── landing.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── nav.js                 # injects shared header/tab-bar
│   │   ├── device-detect.js       # device modal logic + localStorage
│   │   └── dashboard.js           # renders tiles from games.json, filters by category
│   ├── images/
│   │   ├── thumbnails/
│   │   └── ui/                    # icons, marquee graphics
│   └── fonts/
├── data/
│   └── games.json                 # {id, title, category, thumbnail, path, platform}
└── README.md
```

---

## 🛠️ Tech Stack

- **HTML / CSS / vanilla JavaScript** — no framework, no build step
- **No backend required for V1** — all games run client-side, game metadata served from a static `games.json`
- Designed for **zero-config static hosting**: GitHub Pages, Netlify, Vercel, or Cloudflare Pages

## ▶️ Running Locally

No build tools needed. Any local static server works:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node (http-server)
npx http-server .
```

Then open `http://localhost:8000` in your browser.

## 🚀 Deployment

Since this is a static site, deployment is a drag-and-drop / git-push affair:

- **GitHub Pages:** push to a repo, enable Pages on the `main` branch
- **Netlify / Vercel:** connect the repo, no build command needed (or set output directory to root)

## 🗺️ Future Versions (Post-V1)

- Desktop-specific games (beyond mobile-responsive ports)
- Featured Web Games — real external links
- Game Solutions — game → level → solution browsing
- Gameplay — curated playthrough/video links
- Possible backend for accounts, saved progress, leaderboards

---

## 🤝 Contributing / Development Notes

This repo is being built one file at a time as a learning + portfolio project. Structure and naming may shift as features are added — check this README's roadmap checklist for current status before assuming a feature exists.

