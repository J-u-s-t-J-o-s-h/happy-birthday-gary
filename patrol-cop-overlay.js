/**
 * Patrol Cop Overlay - 3D police avatar that patrols the viewport
 * Vanilla Three.js implementation (no React)
 *
 * Place your rigged .glb model at: public/models/patrol-cop.glb
 * Tweak SPEED and SCALE constants below for different patrol behavior.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Config (tweak these) ---
const CONFIG = {
  enabled: true,
  modelUrl: '/models/patrol-cop.glb',
  speed: 0.85, // units per second
  scale: 1.2,
  waypoints: [
    new THREE.Vector3(-3, -1.8, 0),
    new THREE.Vector3(3, -1.8, 0),
    new THREE.Vector3(3, 1.8, 0),
    new THREE.Vector3(-3, 1.8, 0),
  ],
};

let scene, camera, renderer, mixer, clock, modelGroup;
let currentWaypointIndex = 0;
let animationFrameId = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldShowOverlay() {
  if (!CONFIG.enabled) return false;
  if (prefersReducedMotion()) return false;
  if (window.innerWidth < 768) return false;
  return true;
}

function createScene(container) {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  clock = new THREE.Clock();
}

function getDirectionToNextWaypoint() {
  if (!modelGroup) return new THREE.Vector3(1, 0, 0);
  const nextIndex = (currentWaypointIndex + 1) % CONFIG.waypoints.length;
  const next = CONFIG.waypoints[nextIndex];
  return new THREE.Vector3().subVectors(next, modelGroup.position).normalize();
}

function rotateModelToFaceDirection(model, direction) {
  const len = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
  if (len < 0.001) return;
  const angle = Math.atan2(direction.x, direction.z);
  model.rotation.y = -angle;
}

function loadModel() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      CONFIG.modelUrl,
      (gltf) => {
        modelGroup = gltf.scene;
        modelGroup.scale.setScalar(CONFIG.scale);
        modelGroup.position.copy(CONFIG.waypoints[0]);
        scene.add(modelGroup);

        const animations = gltf.animations || [];
        if (animations.length > 0) {
          mixer = new THREE.AnimationMixer(modelGroup);
          const walkClip = animations.find((a) => a.name.toLowerCase().includes('walk')) || animations[0];
          mixer.clipAction(walkClip).play();
        }

        resolve();
      },
      undefined,
      (err) => {
        console.warn('[PatrolCopOverlay] Could not load model at', CONFIG.modelUrl, '- overlay disabled. Place patrol-cop.glb in public/models/');
        reject(err);
      }
    );
  });
}

function animate() {
  if (!renderer || !scene || !camera) return;

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);

  if (modelGroup) {
    const current = CONFIG.waypoints[currentWaypointIndex];
    const nextIndex = (currentWaypointIndex + 1) % CONFIG.waypoints.length;
    const next = CONFIG.waypoints[nextIndex];

    const direction = new THREE.Vector3().subVectors(next, current).normalize();
    const moveAmount = CONFIG.speed * delta;

    modelGroup.position.add(direction.clone().multiplyScalar(moveAmount));

    const distToNext = modelGroup.position.distanceTo(next);
    if (distToNext < moveAmount * 2) {
      modelGroup.position.copy(next);
      currentWaypointIndex = nextIndex;
    }

    rotateModelToFaceDirection(modelGroup, getDirectionToNextWaypoint());
  }

  renderer.render(scene, camera);
  animationFrameId = requestAnimationFrame(animate);
}

function handleResize(container) {
  if (!camera || !renderer || !container) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

export function destroy() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  renderer?.dispose();
  scene = null;
  camera = null;
  renderer = null;
  mixer = null;
  modelGroup = null;
}

export function initPatrolCopOverlay(options = {}) {
  Object.assign(CONFIG, options);

  if (!shouldShowOverlay()) return;

  const container = document.getElementById('patrol-cop-overlay');
  if (!container) return;

  createScene(container);

  loadModel()
    .then(() => {
      window.addEventListener('resize', () => handleResize(container));
      animate();
    })
    .catch(() => {}); // Already logged
}

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initPatrolCopOverlay());
} else {
  initPatrolCopOverlay();
}
