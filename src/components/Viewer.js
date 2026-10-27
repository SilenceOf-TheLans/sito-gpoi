import * as THREE from 'three';
import { createControls } from './Controls.js';

const CAMERA_HOME = new THREE.Vector3(8.8, 6.4, 11.4);
const CLOUD_OPACITY = 1;

export default class Viewer {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030303);
    this.scene.fog = new THREE.FogExp2(0x030303, 0.024);

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 400);
    this.camera.position.copy(CAMERA_HOME);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'viewport-canvas';
    this.renderer.domElement.setAttribute('aria-label', 'Visualizzatore 3D interattivo');
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this.rafId = null;
    this.isActive = true;
    this.pointCloud = null;
    this.pointCount = 0;
    this.cloudOpacity = 0;

    this.pointTexture = this.createPointTexture();
    this.controls = createControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    this.createEnvironment();
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.handleVisibility = () => this.handleVisibilityChange();
    document.addEventListener('visibilitychange', this.handleVisibility);

    this.animate = this.animate.bind(this);
    this.startRendering();
  }

  createPointTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(255, 255, 255, 0.92)');
    gradient.addColorStop(0.42, 'rgba(255, 255, 255, 0.34)');
    gradient.addColorStop(0.72, 'rgba(255, 255, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  createEnvironment() {
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const radius = 42 + Math.random() * 105;
      const y = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const planar = Math.sqrt(1 - y * y);

      starPositions[index * 3] = radius * planar * Math.cos(theta);
      starPositions[index * 3 + 1] = radius * y;
      starPositions[index * 3 + 2] = radius * planar * Math.sin(theta);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0x9a9a9a,
      size: 0.5,
      sizeAttenuation: true,
      map: this.pointTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });

    this.starfield = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starfield);
  }

  setPointCloud(positions) {
    if (!(positions instanceof Float32Array)) {
      throw new Error('Point cloud positions must be a Float32Array.');
    }

    if (positions.length === 0 || positions.length % 3 !== 0) {
      throw new Error('Point cloud positions must be a non-empty multiple of three values.');
    }

    this.clearPointCloud();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();

    const material = new THREE.PointsMaterial({
      color: 0x0eb0c3,
      size: 0.055,
      sizeAttenuation: true,
      map: this.pointTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.cloudOpacity = 0;
    this.pointCount = positions.length / 3;
    this.pointCloud = new THREE.Points(geometry, material);
    this.pointCloud.frustumCulled = true;
    this.scene.add(this.pointCloud);

    return this.pointCount;
  }

  clearPointCloud() {
    if (!this.pointCloud) {
      return;
    }

    this.scene.remove(this.pointCloud);
    this.pointCloud.geometry.dispose();
    this.pointCloud.material.dispose();
    this.pointCloud = null;
    this.pointCount = 0;
    this.cloudOpacity = 0;
  }

  resetView() {
    const damping = this.controls.enableDamping;
    this.controls.enableDamping = false;
    this.controls.update();
    this.camera.position.copy(CAMERA_HOME);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.controls.enableDamping = damping;
  }

  isAutoRotating() {
    return this.controls.autoRotate;
  }

  toggleAutoRotate() {
    this.controls.autoRotate = !this.controls.autoRotate;
    return this.controls.autoRotate;
  }

  resize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;
    this.camera.fov = aspect < 1 ? Math.min(68, 46 / aspect) : 46;

    this.camera.clearViewOffset();

    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
  }

  setActive(active) {
    const nextActive = Boolean(active);

    if (this.isActive === nextActive) {
      return;
    }

    this.isActive = nextActive;

    if (nextActive) {
      this.startRendering();
    } else {
      this.stopRendering();
    }
  }

  startRendering() {
    if (this.rafId !== null || !this.isActive || document.hidden) {
      return;
    }

    this.clock.getDelta();
    this.rafId = requestAnimationFrame(this.animate);
  }

  stopRendering() {
    if (this.rafId === null) {
      return;
    }

    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.stopRendering();
    } else {
      this.startRendering();
    }
  }

  animate() {
    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.1);
    this.elapsed += delta;

    this.starfield.rotation.y = this.elapsed * 0.0035;

    if (this.pointCloud && this.cloudOpacity < CLOUD_OPACITY) {
      this.cloudOpacity = Math.min(CLOUD_OPACITY, this.cloudOpacity + delta * 1.5);
      this.pointCloud.material.opacity = this.cloudOpacity;
    }
    this.controls.update();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.rafId = requestAnimationFrame(this.animate);
  }

  dispose() {
    this.stopRendering();
    this.resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.controls.dispose();
    this.clearPointCloud();

    this.scene.traverse((object) => {
      object.geometry?.dispose();

      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });

    this.pointTexture.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
