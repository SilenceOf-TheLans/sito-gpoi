# Sito GPOI — 3D Point-Cloud Viewer

A high-performance, web-based 3D point-cloud visualizer with a sci-fi CAD / radar-scanner aesthetic. Preprocessed models are rendered as interactive glowing point clouds with yaw controls and a minimal HUD.

> See `AGENTS.md` for the full project rules, architecture, and AI agent workflows.

## Tech stack

- **Rendering:** [Three.js](https://threejs.org/) using `THREE.Points` and `THREE.PointsMaterial`
- **Controls:** `OrbitControls` from `three/addons`
- **Build tool:** [Vite](https://vite.dev/)
- **Preprocessing:** Python scripts that sample mesh geometry into normalized point clouds

## Getting started

Requires Node.js 20.19+ (or 22.12+) and Python 3.8+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build:

```bash
npm run build
npm run preview
```

The app loads the Iris Orion Hub & Spoke constellation by default (falling back to the first point-cloud asset alphabetically if it is absent). To select another cloud, use its file stem:

```text
http://localhost:5173/?cloud=demo_knot
```

## Controls

| Input | Action |
| --- | --- |
| Drag | Rotate around the yaw axis |
| `R` | Reset view |
| `A` | Toggle auto-rotate |

Camera pitch, panning, and zoom are intentionally disabled, so the view stays level and orbits horizontally at a fixed distance. The HUD provides scan status, loading feedback, and view controls.

## Point-cloud format

The runtime loader supports two pre-generated formats:

- **`.bin`** — raw little-endian `Float32` triplets: `x, y, z, x, y, z, ...`
- **`.json`** — either a flat array of coordinates, or an object with a `positions` array:

```json
{
  "name": "DEMO KNOT",
  "pointCount": 60000,
  "radius": 5,
  "positions": [0.12, -1.4, 2.03, 0.15, -1.39, 2.05]
}
```

Point clouds should be normalized before shipping so the model fits inside a consistent camera radius of 5 units. Loaders never generate or convert geometry at runtime.

## Preprocessing pipeline

Conversion is a manual, developer-controlled step. The repository includes a procedural demo model so the pipeline can be exercised without external assets.

```bash
python scripts/make_demo_model.py
python scripts/process_model.py assets/raw_models/demo_knot.obj assets/point_clouds/demo_knot.bin --points 60000
```

The Iris Orion Hub & Spoke constellation used by default in the viewer can be regenerated with:

```bash
python scripts/make_iris_constellation.py
python scripts/process_model.py assets/raw_models/iris_orion_hub_spoke.obj assets/point_clouds/iris_orion_hub_spoke.bin --points 60000
```

`scripts/process_model.py`:

1. Reads an ASCII OBJ mesh (vertices and polygonal faces).
2. Samples its surface uniformly by triangle area.
3. Centers the bounding box and scales the model to the requested bounding-sphere radius (default `5`).
4. Writes a compact `.bin` or `.json` point cloud.

Useful options:

```bash
python scripts/process_model.py path/to/model.obj assets/point_clouds/model.bin \
  --points 100000 \
  --radius 5 \
  --seed 7
```

To use another model, place the resulting `.bin`/`.json` in `assets/point_clouds/` and restart the dev server (or rebuild). Vite bundles only the preprocessed clouds, never the raw mesh.

## Project structure

```text
├── assets/
│   ├── point_clouds/         # Sampled point data (.json or .bin)
│   └── raw_models/           # Source meshes used only by the manual pipeline
├── scripts/
│   ├── make_demo_model.py    # Generates the procedural demo OBJ
│   └── process_model.py      # Manual mesh-to-point-cloud converter
├── src/
│   ├── components/
│   │   ├── Viewer.js         # Three.js scene, environment, render loop
│   │   ├── Controls.js       # Yaw-only OrbitControls configuration
│   │   └── UIOverlay.js      # Sci-fi HUD, telemetry, loading state
│   ├── loaders/
│   │   └── PointLoader.js    # Fetches and validates point-cloud buffers
│   ├── main.js               # Application entry point and asset selection
│   └── style.css             # Global styles and HUD layout
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Ground rules

- No custom shaders or GLSL files; only built-in Three.js materials.
- Keep the camera level and fixed-distance: yaw only, with panning, zoom, and pitch disabled.
- Dispose geometries and materials when swapping point clouds.
- Keep renderer and camera responsive on resize.
- Keep the payload lightweight: preprocess large meshes before delivery.
- Target roughly 60 FPS for point clouds up to 100,000 points.
