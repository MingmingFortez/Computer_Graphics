import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { addExtraObjects, floatingMeshes } from './objects.js';



// Setup renderer
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Setup camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 5, 10);

// Setup scene
const scene = new THREE.Scene();

// Texture loader
const loader = new THREE.TextureLoader();

// Set background image using texture
const bgTexture = loader.load('assets/elnido.jpeg', () => {
  bgTexture.colorSpace = THREE.SRGBColorSpace;
  bgTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = bgTexture;
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffddaa, 1.2);
directionalLight.position.set(-1, 3, 4);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x88ccff, 1.5, 50);
pointLight.position.set(3, 5, 2);
scene.add(pointLight);

// Light helpers
scene.add(new THREE.DirectionalLightHelper(directionalLight));
scene.add(new THREE.PointLightHelper(pointLight));

// GUI controls
const gui = new GUI();
gui.add(ambientLight, 'intensity', 0, 2).name('Ambient Intensity');

const dirFolder = gui.addFolder('Directional Light');
dirFolder.add(directionalLight, 'intensity', 0, 3);
dirFolder.add(directionalLight.position, 'x', -10, 10);
dirFolder.add(directionalLight.position, 'y', -10, 10);
dirFolder.add(directionalLight.position, 'z', -10, 10);
dirFolder.addColor({ color: directionalLight.color.getHex() }, 'color').onChange(val => directionalLight.color.set(val));

const pointFolder = gui.addFolder('Point Light');
pointFolder.add(pointLight, 'intensity', 0, 5);
pointFolder.add(pointLight, 'distance', 0, 100);
pointFolder.add(pointLight.position, 'x', -10, 10);
pointFolder.add(pointLight.position, 'y', -10, 10);
pointFolder.add(pointLight.position, 'z', -10, 10);
pointFolder.addColor({ color: pointLight.color.getHex() }, 'color').onChange(val => pointLight.color.set(val));

// Cube with one texture
const singleTexture = loader.load('assets/rocks.jpg');
singleTexture.colorSpace = THREE.SRGBColorSpace;
singleTexture.wrapS = THREE.RepeatWrapping;
singleTexture.wrapT = THREE.RepeatWrapping;
singleTexture.repeat.set(2, 2);

const singleMaterial = new THREE.MeshStandardMaterial({ map: singleTexture });
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const cube1 = new THREE.Mesh(boxGeometry, singleMaterial);
cube1.position.x = -2;
scene.add(cube1);

// Cube with 6 textures
function loadFaceTexture(name) {
  const tex = loader.load(`assets/${name}`);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map: tex });
}

const multiMaterials = [
  loadFaceTexture('coral.jpeg'),
  loadFaceTexture('water.jpeg'),
  loadFaceTexture('merm.jpeg'),
  loadFaceTexture('floral.jpeg'),
  loadFaceTexture('flower.jpeg'),
  loadFaceTexture('fire.jpeg'),
];

const cube2 = new THREE.Mesh(boxGeometry, multiMaterials);
cube2.position.x = 2;
scene.add(cube2);

// Load GLB model
const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/models/among_us_lobby_3d.glb', (gltf) => {
  const model = gltf.scene;
  model.position.set(0, -1, 0);
  model.scale.set(0.5, 0.5, 0.5);
  scene.add(model);
}, undefined, (error) => {
  console.error('Error loading GLB model:', error);
});

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Keyboard movement
const keysPressed = {};
const movementSpeed = 2;
const fastSpeed = 6;

window.addEventListener('keydown', (e) => {
  keysPressed[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

function updateCameraMovement(delta) {
  const speed = keysPressed['shift'] ? fastSpeed : movementSpeed;
  const moveDistance = speed * delta;

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  right.crossVectors(forward, up).normalize();

  if (keysPressed['w'] || keysPressed['arrowup']) camera.position.addScaledVector(forward, moveDistance);
  if (keysPressed['s'] || keysPressed['arrowdown']) camera.position.addScaledVector(forward, -moveDistance);
  if (keysPressed['a'] || keysPressed['arrowleft']) camera.position.addScaledVector(right, -moveDistance);
  if (keysPressed['d'] || keysPressed['arrowright']) camera.position.addScaledVector(right, moveDistance);
  if (keysPressed['q']) camera.position.y += moveDistance;
  if (keysPressed['e']) camera.position.y -= moveDistance;

  controls.enabled = !(keysPressed['w'] || keysPressed['a'] || keysPressed['s'] || keysPressed['d'] ||
                       keysPressed['arrowup'] || keysPressed['arrowdown'] ||
                       keysPressed['arrowleft'] || keysPressed['arrowright']);
}

// Resize support
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
let previousTime = 0;
function render(currentTime) {
  currentTime *= 0.001;
  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  updateCameraMovement(deltaTime);

  cube1.rotation.x = currentTime;
  cube1.rotation.y = currentTime;

  cube2.rotation.x = currentTime * 0.7;
  cube2.rotation.y = currentTime * 0.7;

  // Animate floating meshes
  floatingMeshes.forEach((mesh, i) => {
    mesh.position.y += Math.sin(currentTime + i) * 0.005;
    mesh.rotation.y += 0.005;
  });

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

addExtraObjects(scene);

requestAnimationFrame(render);
