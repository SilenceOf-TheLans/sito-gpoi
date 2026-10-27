# AGENTS.md

## Project Overview
This project is a high-performance, web-based 3D point-cloud visualizer (similar to sci-fi CAD/radar scanner interfaces). It renders detailed 3D models as interactive, glowing dot-matrices with rotation controls (yaw).

---

## 1. Primary Goals & Non-Negotiables
* **No Custom Shaders:** Rely strictly on `Three.js` built-in materials (`THREE.PointsMaterial`, `THREE.SpriteMaterial`) and native controls to keep the codebase maintainable.
* **Performance Target:** Maintain 60 FPS on standard desktop browsers for point clouds up to 100,000 points.
* **Lightweight Payloads:** Never load raw high-poly meshes directly to the client; always serve pre-processed, point-sampled data buffers.

---

## 2. Recommended Tech Stack
* **Rendering Engine:** `Three.js` (using `THREE.Points` and `THREE.PointsMaterial`)
* **Controls & Navigation:** `Three.js/addons/controls/OrbitControls.js`
* **Preprocessing Pipeline:** Manually use blender scripts for point sampling mesh into point arrays.
* **Build Tool:** `Vite` (with JavaScript ES Modules or TypeScript)

---

## 3. Architecture & File Structure

```text
├── assets/
│   └── point_clouds/         # Sampled point data (.json or .bin)
├── src/
│   ├── components/
│   │   ├── Viewer.js         # Main Three.js canvas setup & render loop
│   │   ├── Controls.js       # OrbitControls configuration (pan/zoom/rotate)
│   │   └── UIOverlay.js      # Sci-fi UI overlay (HUD elements, title text)
│   ├── loaders/
│   │   └── PointLoader.js    # Fetcher and parser for point cloud files
│   ├── main.js               # Application entry point
│   └── style.css             # UI overlay styles
├── index.html
└── package.json
```

---

## 4. Workflows for Autonomous / AI Agents

### Agent Task A: Model Preprocessing Pipeline
1.Write a script file for blender to convert vertices into point cloud as sampled coordinates (`[x, y, z, ...]` array) as `<model-name>.json` or a `Float32Array` binary file.
2.Normalize bounding boxes so models fit within a standard camera view radius (e.g., normalized radius of 5 units).

### Agent Task B: WebGL Setup (`Viewer.js`)
When implementing or modifying the WebGL rendering logic:
1. Initialize standard `THREE.Scene`, `THREE.PerspectiveCamera`, and `THREE.WebGLRenderer`.
2. Parse point coordinates into `THREE.BufferGeometry`:
   ```javascript
   const geometry = new THREE.BufferGeometry();
   geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsArray, 3));
   ```
3. Use `THREE.PointsMaterial` for styling points:
   ```javascript
   const material = new THREE.PointsMaterial({
     color: 0xffffff,
     size: 0.05,
     sizeAttenuation: true,
     transparent: true,
     opacity: 0.85,
     blending: THREE.AdditiveBlending
   });
   ```
4. Combine into `THREE.Points` object and add to scene.

### Agent Task C: Interaction & Camera (`Controls.js`)
When configuring camera controls:
1. Instantiate `OrbitControls` attached to the rendering DOM element.
2. Configure settings explicitly:
   ```javascript
   controls.enableDamping = true;
   controls.dampingFactor = 0.05;
   controls.enableRotate = true;
   ```
3. Ensure `controls.update()` is called inside the requestAnimationFrame render loop.

---

## 5. Coding Standards & Guidelines

* **Keep Shaders Out:** Do not introduce `.vert`, `.frag`, or GLSL string literals unless explicitly requested by the user. Rely on `Three.js` built-in material properties (like `blending`, `opacity`, `sizeAttenuation`).
* **Memory Management:** Always call `.dispose()` on geometries and materials when swapping point clouds dynamically to prevent WebGL memory leaks.
* **Responsive Scaling:** Ensure renderer resizes cleanly on window resize events:
  ```javascript
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  ```

---

## 6. Verification & Definition of Done
A feature or task is considered complete when:
- [ ] 3D models load cleanly as point clouds without rendering solid faces.
- [ ] Mouse with click rotates the model smoothly.
- [ ] No WebGL errors appear in the browser developer console.
- [ ] Frame rates remain stable at ~60 FPS during camera manipulation.
