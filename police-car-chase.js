/**
 * Police Car Chase - 3D police car chasing a sports car along a curved path
 * Loads police-car.glb and sports-car.glb from public/models/
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CONFIG = {
  enabled: true,
  speed: 0.24,
  policeCarUrl: '/models/police-car.glb',
  sportsCarUrl: '/models/sports-car.glb',
  targetCarSize: 1.5,
  chaseGap: 0.18,
};

// Curved path - cars drive along this spline (realistic winding road)
const PATH_POINTS = [
  new THREE.Vector3(-5, -0.9, -0.5),
  new THREE.Vector3(-3, -0.85, -1.2),
  new THREE.Vector3(0, -0.8, -1.5),
  new THREE.Vector3(3, -0.85, -1.2),
  new THREE.Vector3(5, -0.9, -0.5),
  new THREE.Vector3(3, -0.95, 0.2),
  new THREE.Vector3(0, -0.9, 0.5),
  new THREE.Vector3(-3, -0.95, 0.2),
  new THREE.Vector3(-5, -0.9, -0.5),
];

let scene, camera, renderer, carGroup, sportsCarGroup, lightRed, lightBlue, pathCurve, clock;
let pathProgress = 0;
let pathDirection = 1;
let animationFrameId = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function shouldShow() {
  if (!CONFIG.enabled) return false;
  if (prefersReducedMotion()) return false;
  return true;
}

function addFlashingLights(group, lightY = 0.45) {
  const scale = 1.4;
  const barGeo = new THREE.BoxGeometry(0.5 * scale, 0.08 * scale, 0.12 * scale);
  const barMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(0, lightY, 0);
  group.add(bar);

  const lightGeo = new THREE.BoxGeometry(0.14 * scale, 0.07 * scale, 0.1 * scale);
  const redMat = new THREE.MeshBasicMaterial({ color: 0xff1111, transparent: true });
  lightRed = new THREE.Mesh(lightGeo, redMat);
  lightRed.position.set(-0.18, lightY, 0);
  group.add(lightRed);

  const blueMat = new THREE.MeshBasicMaterial({ color: 0x4488ff, transparent: true });
  lightBlue = new THREE.Mesh(lightGeo, blueMat);
  lightBlue.position.set(0.18, lightY, 0);
  group.add(lightBlue);

  const redGlow = new THREE.PointLight(0xff4444, 0, 1.2);
  redGlow.position.copy(lightRed.position);
  lightRed.add(redGlow);

  const blueGlow = new THREE.PointLight(0x4488ff, 0, 1.2);
  blueGlow.position.copy(lightBlue.position);
  lightBlue.add(blueGlow);

  lightRed.userData.glow = redGlow;
  lightBlue.userData.glow = blueGlow;
}

function loadModel(url, targetSize, sizeMultiplier = 1) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = (targetSize * sizeMultiplier) / maxDim;
        model.scale.setScalar(scale);
        resolve(model);
      },
      undefined,
      (err) => {
        console.warn('[PoliceCarChase] Could not load model:', url, err);
        resolve(null);
      }
    );
  });
}

function loadCars(callback) {
  const isMobile = window.innerWidth < 768;
  const targetSize = isMobile ? CONFIG.targetCarSize * 0.7 : CONFIG.targetCarSize;

  Promise.all([
    loadModel(CONFIG.policeCarUrl, targetSize, 1),
    loadModel(CONFIG.sportsCarUrl, targetSize, 1),
  ]).then(([policeModel, sportsModel]) => {
    if (policeModel) {
      const box = new THREE.Box3().setFromObject(policeModel);
      const size = new THREE.Vector3();
      box.getSize(size);
      const lightY = size.y * 0.55;

      carGroup = new THREE.Group();
      carGroup.add(policeModel);
      addFlashingLights(carGroup, lightY);
      carGroup.rotation.x = 0.12;
      carGroup.position.copy(pathCurve.getPoint(0));
      scene.add(carGroup);
    }

    if (sportsModel) {
      sportsCarGroup = new THREE.Group();
      sportsCarGroup.add(sportsModel);
      sportsCarGroup.rotation.x = 0.12;
      const sportsProgress = (pathProgress + CONFIG.chaseGap) % 1;
      sportsCarGroup.position.copy(pathCurve.getPoint(sportsProgress));
      scene.add(sportsCarGroup);
    }

    callback();
  });
}

function init(container) {
  scene = new THREE.Scene();

  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 100);
  camera.position.set(0, 0.2, 5);
  camera.lookAt(0, -0.5, -0.5);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(2, 3, 2);
  scene.add(dir);

  pathCurve = new THREE.CatmullRomCurve3(PATH_POINTS, true);

  const roadGeo = new THREE.PlaneGeometry(24, 6);
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x252525 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, -1, -0.5);
  scene.add(road);

  clock = new THREE.Clock();
  loadCars(() => animate());
}

function animate() {
  if (!renderer || !scene || !camera || !carGroup) return;

  const dt = clock.getDelta();

  pathProgress += pathDirection * CONFIG.speed * dt;
  if (pathProgress >= 1) {
    pathProgress = 1;
    pathDirection = -1;
  } else if (pathProgress <= 0) {
    pathProgress = 0;
    pathDirection = 1;
  }

  const pos = pathCurve.getPoint(pathProgress);
  const tangent = pathCurve.getTangent(pathProgress);
  const carRotation = Math.atan2(tangent.x, tangent.z) + (pathDirection < 0 ? Math.PI : 0);

  if (carGroup) {
    carGroup.position.copy(pos);
    carGroup.rotation.y = carRotation;
  }

  if (sportsCarGroup) {
    const sportsProgress = pathDirection > 0
      ? (pathProgress + CONFIG.chaseGap) % 1
      : (pathProgress - CONFIG.chaseGap + 1) % 1;
    const sportsPos = pathCurve.getPoint(sportsProgress);
    const sportsTangent = pathCurve.getTangent(sportsProgress);
    sportsCarGroup.position.copy(sportsPos);
    sportsCarGroup.rotation.y = Math.atan2(sportsTangent.x, sportsTangent.z) + (pathDirection < 0 ? Math.PI : 0);
  }

  if (lightRed && lightBlue) {
    const t = clock.getElapsedTime();
    const flash = Math.sin(t * 14) > 0 ? 1 : 0.08;
    lightRed.material.opacity = flash;
    lightBlue.material.opacity = 1 - flash + 0.08;
    if (lightRed.userData.glow) {
      lightRed.userData.glow.intensity = flash * 2.5;
    }
    if (lightBlue.userData.glow) {
      lightBlue.userData.glow.intensity = (1 - flash + 0.08) * 2.5;
    }
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

export function destroyPoliceCarChase() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  renderer?.dispose();
  scene = camera = renderer = carGroup = sportsCarGroup = lightRed = lightBlue = null;
}

export function initPoliceCarChase() {
  if (!shouldShow()) return;

  const container = document.getElementById('police-car-chase');
  if (!container) return;

  init(container);
  window.addEventListener('resize', () => handleResize(container));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPoliceCarChase);
} else {
  initPoliceCarChase();
}
