import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableRotate = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.65;
  controls.autoRotateSpeed = 0.6;
  controls.autoRotate = true;
  controls.target.set(0, 0, 0);

  const offset = camera.position.clone().sub(controls.target);
  const polarAngle = Math.acos(THREE.MathUtils.clamp(offset.y / offset.length(), -1, 1));
  controls.minPolarAngle = polarAngle;
  controls.maxPolarAngle = polarAngle;
  domElement.style.touchAction = 'pan-y';

  return controls;
}
