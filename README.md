# Cartridge 🕹️
### Reload your Gaming Nostalgia

Cartridge is a responsive, browser-based gaming platform built around an arcade-marquee identity - play puzzle, brain-teaser, and retro games instantly, browse featured web games, and (soon) unlock game solutions and curated gameplay videos.

### Last updated - 6th of September 2026

---

## ✅ Status: V1 Complete

V1 (Basic Build) is done - landing page, device detection, dashboard, persistent nav, six playable games across three categories, and all three "Coming Soon" stub tabs are live. Full V1 scope is preserved in git history / closed issues if you need the detailed breakdown.

---

## 🗺️ V2 Roadmap Checklist

- [x] Mobile responsiveness pass across all pages (nav, hero, dashboard grid, game boards)
- [x] Collapsible mobile nav (hamburger/drawer), expanded nav stays on desktop
- [ ] Full multi-column footer (brand blurb, nav links, credits) - replacing the current single-line footer
- [ ] Stronger retro visual theme (scanline/CRT texture, pixel-style accents, marquee glow pulse)
- [ ] Glow and hover effects across buttons, tiles, and nav (respecting `prefers-reduced-motion`)
- [ ] Fix Word Scramble answer-ordering bug (click order not reflected in answer tiles)
- [ ] Desktop-specific games (beyond mobile-responsive ports)
- [ ] Featured Web Games - real external links
- [ ] Game Solutions - game → level → solution browsing
- [ ] Gameplay - curated playthrough/video links
- [ ] Possible backend for accounts, saved progress, leaderboards

---

## 🎨 Design Identity

**Concept:** Arcade Marquee - game tiles styled as cartridges, hero styled as a glowing marquee lightbox.

| Token | Value | Use |
|---|---|---|
| Deep Indigo | `#1A1633` | Base background |
| Panel Purple | `#241E45` | Cards / surfaces |
| Marquee Pink | `#FF3D7F` | Primary accent |
| Marquee Gold | `#FFC145` | Secondary accent / highlights |
| Lavender White | `#F2EFFF` | Text |

**Type:** Press Start 2P (display, sparing use) · Space Grotesk (body) · JetBrains Mono (stats/data)

---

## 🎮 Games (V1)

| Game | Category | Folder |
|---|---|---|
| Memory Match | Puzzle | `games/puzzle/memory-match/` |
| Number Slide | Puzzle | `games/puzzle/number-slide/` |
| Word Scramble | Brain Teaser | `games/brain-teaser/word-scramble/` |
| Trivia Quiz | Brain Teaser | `games/brain-teaser/trivia-quiz/` |
| Snake | Retro | `games/retro/snake/` |
| Tetris | Retro | `games/retro/tetris/` |

---

## 📁 Project Structure
```
gaming-website/
├── index.html                     # Landing page (hero + device-check modal)
├── dashboard.html                 # Home tab - game tiles by category
├── featured-web-games.html        # Coming Soon
├── game-solutions.html            # Coming Soon
├── gameplay.html                  # Coming Soon
├── vercel.json                    # Static hosting config (preserves .html URLs)
├── games/
│   ├── puzzle/
│   │   ├── memory-match/
│   │   │   ├── index.html
│   │   │   ├── game.js
│   │   │   └── style.css
│   │   └── number-slide/...
│   ├── brain-teaser/
│   │   ├── word-scramble/...
│   │   └── trivia-quiz/...
│   └── retro/
│       ├── snake/...
│       └── tetris/...
├── assets/
│   ├── css/
│   │   ├── tokens.css             # design tokens: color, type, spacing
│   │   ├── base.css               # resets, global element styles
│   │   ├── components.css         # nav, cartridge tiles, buttons, modal
│   │   ├── landing.css
│   │   ├── dashboard.css
│   │   └── coming-soon.css        # shared layout for the 3 stub pages
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

- **HTML / CSS / vanilla JavaScript** - no framework, no build step
- **No backend required for V1** - all games run client-side, game metadata served from a static `games.json`
- Designed for **zero-config static hosting**: GitHub Pages, Netlify, Vercel, or Cloudflare Pages

## ▶️ Running Locally

No build tools needed. Any local static server works:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node (http-server)
npx http-server .
```
Then open http://localhost:8000 in your browser.
## 🚀 Deployment
Live on Vercel as a zero-build static site. vercel.json at the project root keeps .html extensions in URLs (cleanUrls: false, trailingSlash: false) so nav.js's active-tab detection keeps working correctly.
Via GitHub (auto-deploys on push):
Push to a GitHub repo (project root = repo root)
Vercel dashboard → Add New Project → import the repo
Framework Preset: Other, Build Command: none, Output Directory: .
Deploy
Via CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```
Also deployable as-is on GitHub Pages or Netlify with no config changes.

## 🤝 Contributing / Development Notes
This repo is being built one file at a time as a learning + portfolio project. Structure and naming may shift as features are added - check this README's roadmap checklist for current status before assuming a feature exists.

# Bought to you by 👨🏻‍💻
## Shyam K. V.
AI and Full Stack Developer.
© All rights reserved 2026.
