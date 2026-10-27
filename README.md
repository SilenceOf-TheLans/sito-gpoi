# Sito GPOI — 3D Point-Cloud Viewer

A high-performance, web-based 3D point-cloud visualizer with a sci-fi CAD / radar-scanner look.
Detailed models are rendered as interactive, glowing dot matrices with full pan, tilt, zoom and
rotation controls.

> See `AGENTS.md` for the full project rules, architecture and agent workflows.

## Tech stack

- **Rendering:** [Three.js](https://threejs.org/) — `THREE.Points` + `THREE.PointsMaterial` only
- **Controls:** `OrbitControls` from `three/addons`
- **Build tool:** [Vite](https://vite.dev/) (ES modules)
- **Preprocessing:** Python (`trimesh` / `open3d`) to sample meshes into point arrays

## Project structure

```text
├── assets/
│   ├── raw_models/       # Original 3D files (.gltf, .obj, .fbx)
│   └── point_clouds/     # Sampled point data (.json / .bin) served to the client
├── scripts/
│   └── process_model.py  # Mesh -> point array conversion
├── src/
│   ├── components/
│   │   ├── Viewer.js     # Three.js scene, camera, renderer, render loop
│   │   ├── Controls.js   # OrbitControls configuration
│   │   └── UIOverlay.js  # Sci-fi HUD overlay
│   ├── loaders/
│   │   └── PointLoader.js# Fetcher / parser for point cloud files
│   ├── main.js           # Application entry point
│   └── style.css         # UI overlay styles
├── index.html
└── package.json
```

## Status

Repository skeleton only — folders are in place, the Vite + Three.js scaffold is the next step.
Once `package.json`, `index.html` and `src/main.js` exist:

```bash
npm install
npm run dev
```

## Model preprocessing

1. Drop the raw `.gltf` / `.obj` into `assets/raw_models/`.
2. Run `scripts/process_model.py` to sample surface points.
3. The script writes `assets/point_clouds/<model-name>.json` (or `.bin`), normalized so the
   model fits a standard view radius (5 units).

> Note: raw high-poly meshes must never be shipped to the client. Large binaries are best
> versioned with [Git LFS](https://git-lfs.com/).

## Ground rules

- No custom shaders (no GLSL, no `.vert` / `.frag` files) — built-in materials only.
- 60 FPS target on desktop for up to 100,000 points.
- Always `.dispose()` geometries and materials when swapping clouds.
- Renderer must resize cleanly with the window.
