# Sito GPOI — 3D Point-Cloud Viewer

A high-performance, web-based 3D point-cloud visualizer with a sci-fi CAD / radar-scanner aesthetic. Detailed models are rendered as interactive glowing dot-matrices with rotation controls and a minimal HUD.

> See `AGENTS.md` for the full project rules, architecture, and AI agent workflows.

## Tech stack

- **Rendering:** [Three.js](https://threejs.org/) using `THREE.Points` and `THREE.PointsMaterial`
- **Controls:** `OrbitControls` from `three/addons`
- **Build tool:** [Vite](https://vite.dev/)
- **Preprocessing:** Blender or custom scripts used to convert mesh geometry into sampled point clouds

## Project structure

```text
├── assets/
│   └── point_clouds/         # Sampled point data (.json or .bin)
├── src/
│   ├── components/
│   │   ├── Viewer.js         # Main Three.js canvas setup & render loop
│   │   ├── Controls.js       # OrbitControls configuration (pan/zoom/rotate)
│   │   └── UIOverlay.js      # Sci-fi HUD overlay and interface UI
│   ├── loaders/
│   │   └── PointLoader.js    # Fetcher and parser for point cloud files
│   ├── main.js               # Application entry point
│   └── style.css             # Global styles and HUD layout
├── index.html
├── package.json
└── README.md
```

## Development goals

- Render models as 3D point clouds instead of solid faces.
- Keep performance stable at roughly 60 FPS for up to 100,000 points.
- Use only native `Three.js` materials and controls.
- Keep the payload lightweight by pre-processing large models before delivery to the browser.

## Ground rules

- No custom shaders or GLSL files.
- Keep geometry and materials disposed when swapping point clouds.
- Ensure responsive resizing for the renderer and camera.
- Use simple, maintainable `OrbitControls` configuration with damping and rotation enabled.
