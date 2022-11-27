import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: 0x2ec27e,
};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial({ color: "#ff0000" })
// );
// scene.add(cube);
// Texture loader
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/5grad.png");
gradientTexture.magFilter = THREE.NearestFilter;

const objectsDistance = 4;
const objcount = 10;

const torusGeometry = new THREE.TorusGeometry(1, 0.5, 10, 50);
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

for (let i = 0; i < objcount; i++) {
  const littleCube = new THREE.Mesh(torusGeometry, material);

  littleCube.position.x = (Math.random() - 0.5) * 3 - 1.5;
  littleCube.position.y = (Math.random() - 0.5) * 3 - objectsDistance;
  littleCube.position.z = (Math.random() - 0.5) * 3;

  littleCube.scale.set(i / objcount / 2, i / objcount / 2, i / objcount / 2);

  littleCube.name = "littleCube" + i;

  scene.add(littleCube);
}

const knotTorus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);

knotTorus.position.y = -objectsDistance * 2;
knotTorus.position.x = 1.5;

const isoSphere = new THREE.Mesh(
  new THREE.CylinderGeometry(1, 0.5, 1, 12),
  material
);
isoSphere.position.x = 1.5;
scene.add(knotTorus, isoSphere);

//particles

const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
for (let j = 0; j < particlesCount; j++) {
  positions[j * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[j * 3 + 1] = objectsDistance * (0.5 - Math.random() * 3);
  positions[j * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

//lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

//gui
gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(1);
});

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//scroll
let scrollY = window.scrollY;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  // console.log(scrollY);
});

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
  // console.log(cursor);
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //animate camera

  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 2 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 2 * deltaTime;

  knotTorus.rotation.y = Math.sin(elapsedTime);

  isoSphere.rotation.y = 0.4 * elapsedTime;
  isoSphere.rotation.x = 0.4 * elapsedTime;
  isoSphere.rotation.z = 0.4 * elapsedTime;

  for (let i = 0; i < objcount; i++) {
    const rotCube = scene.getObjectByName("littleCube" + i, true);
    rotCube.rotation.x = (2 / i) * elapsedTime;
    rotCube.rotation.y = (2 / i) * elapsedTime;
    rotCube.rotation.z = (2 / i) * elapsedTime;
  }
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
