# 🎨 Painted Worlds

> *Step inside the painting before you bid on it.*

---

## Acknowledgements

Huge thanks to the [galileo-ml](https://github.com/galileo-ml/marble-hackathon) team for the original Marble hackathon starter repo — the SparkJS integration and splat loading architecture provided the foundation this project is built on.

Thanks to the entire [World Labs](https://www.worldlabs.ai/) team for building Marble and making this kind of spatial experience possible.

---

## The Idea

Auction houses like Sotheby's sell the world's greatest paintings, but buyers experience them as flat JPEGs on a screen. What if you could *walk into* a painting before bidding on it? Painted Worlds makes that real.

You stand in a museum. Three masterworks hang on the wall. Walk toward any painting and you're teleported *inside* it, into a fully navigable 3D world generated from the artwork itself.

---

## The Paintings

| | Title | Artist | Year |
|---|---|---|---|
| Left | Nurses in the Park | Childe Hassam | 1889 |
| Center | Arrival at the Palace of Amber | Edwin Lord Weeks | 1888 |
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

## Model Observations

**What worked best:**
Monet's water scenes were the standout. The Marble API handled 
Impressionist soft edges and reflective surfaces with surprising 
fidelity. The generated world renders from an elevated vantage 
point above the figures, which feels compositionally correct for 
how Monet actually painted. Depth interpretation felt earned, 
not invented.

Childe Hassam's Central Park scene handled spatial recession well 
along the curved central path. The model read the implied depth 
correctly and the navigable world follows that natural curve in a 
way that feels intuitive to walk through.

**Where the model struggled:**
Edwin Lord Weeks presented the hardest challenge. Hard architectural 
lines, geometric shapes, and strong light/shadow contrast were less 
forgiving than soft Impressionist work. The splat primitives that 
handle painterly ambiguity so well are less suited to scenes that 
imply precise geometry.

**The museum generation problem:**
Initial approach: generate a gallery space and place paintings inside 
it. Marble consistently populated the canvas walls with its own 
imagery rather than leaving whitespace for the target paintings. 
Cropping to whitespace via the selector tool produced repeated draft 
generation errors.

The fix: use Gemini to generate a composite reference image of the 
three paintings first, then feed that to Marble as the source. 
Image generation first, world generation second.


