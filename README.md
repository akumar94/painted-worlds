# 🎨 Painted Worlds

> *Step inside the painting before you bid on it.*

---

## Acknowledgements

Huge thanks to the [galileo-ml](https://github.com/galileo-ml/marble-hackathon) team for the original Marble hackathon starter repo — the SparkJS integration and splat loading architecture provided the foundation this project is built on.

Thanks to the entire [World Labs](https://www.worldlabs.ai/) team for building Marble and making this kind of spatial experience possible.

---

## The Idea

Auction houses like Sotheby's sell the world's greatest paintings — but buyers experience them as flat JPEGs on a screen. What if you could *walk into* a painting before bidding on it? Painted Worlds makes that real.

You stand in a museum. Three masterworks hang on the wall. Walk toward any painting and you're teleported *inside* it — into a fully navigable 3D world generated from the artwork itself.

---

## The Paintings

| | Title | Artist | Year |
|---|---|---|---|
| Left | Nurses in the Park | Childe Hassam | 1898 |
| Center | Arrival at the Palace of Amber | Edwin Lord Weeks | 1883 |
| Right | Garden at Sainte-Adresse | Claude Monet | 1867 |

---

## Demo



https://github.com/user-attachments/assets/ff2bed97-54c2-4436-9f46-b8af55e7bad9



---

## How It Works

1. **Museum room** — generated via Marble from a Gemini-rendered reference image of the gallery with all 3 paintings
2. **Painting worlds** — each painting lifted into a navigable 3D Gaussian splat via Marble's image-to-world pipeline
3. **Proximity teleport** — WASD movement with pointer lock; walk close enough to a painting and you're transported inside it
4. **Return** — press `X` or click `← Back to Museum` to return to the gallery

---

## Controls

| Key | Action |
|---|---|
| `Click` | Lock pointer / enable mouse look |
| `W A S D` | Move |
| `Mouse` | Look around |
| `X` | Exit painting world, return to museum |

---

## Tech Stack

- **Next.js** — app framework
- **Three.js** — 3D rendering
- **SparkJS** (`@sparkjsdev/spark`) — Gaussian splat renderer
- **World Labs Marble API** — image/text to 3D world generation
- **Gemini** — reference image generation for museum room prompt

---

## Getting Started

```bash
git clone https://github.com/akumar94/painted-worlds
cd painted-worlds
npm install
```

Add your World Labs API key to `.env.local`:

```
WORLD_LABS_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** The `.spz` Gaussian splat files are not included in this repo due to file size. Generate your own via the [Marble web UI](https://marble.worldlabs.ai/) or API and place them in `/public/paintings/`.

---

## The Vision

Painted Worlds is a proof of concept for what the future of art commerce could look like — immersive, spatial, experiential. Before you bid on a Hassam or a Monet, you should be able to *stand inside it*.


