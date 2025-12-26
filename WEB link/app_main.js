import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- CONFIGURATION DE LA SCÈNE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Position camera default
camera.position.set(0, 1.7, 7);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);
const topLight = new THREE.DirectionalLight(0xffffff, 3);
topLight.position.set(0, 10, 0);
scene.add(topLight);
const pointLight = new THREE.PointLight(0x00ff00, 5, 50);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);

// Loader & model
let laptop;
const loader = new GLTFLoader();

// Video texture
const video = document.createElement('video');
video.src = 'Clipcamp.mp4';
video.loop = true;
video.muted = true;
video.playsInline = true;
video.crossOrigin = 'anonymous';
video.addEventListener('canplay', () => { console.log('Video ready:', video.src); });
video.addEventListener('error', (e) => { console.error('Video failed to load:', video.src, e); });
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;

let screenCenter = null;
let screenNormal = null;
let screenMesh = null;

loader.load('Laptop.glb', (gltf) => {
    laptop = gltf.scene;
    const box = new THREE.Box3().setFromObject(laptop);
    const center = box.getCenter(new THREE.Vector3());
    laptop.position.sub(center);
    laptop.traverse((child) => {
        if (child.isMesh) {
            const n = (child.name || '').toLowerCase();
            if (n.includes('screen') || n.includes('ecran') || n.includes('display') || n.includes('monitor')) {
                screenMesh = child;
                child.material = new THREE.MeshBasicMaterial({ map: videoTexture });
                child.material.needsUpdate = true;
                child.updateMatrixWorld(true);
                screenCenter = new THREE.Vector3();
                child.getWorldPosition(screenCenter);
                const q = new THREE.Quaternion();
                child.getWorldQuaternion(q);
                screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(q).normalize();
            }
        }
    });
    scene.add(laptop);
    console.log('Modèle chargé avec succès');
}, undefined, (error) => {
    console.error('Erreur de chargement :', error);
});

// Demo and tweens
let inDemo = false;
let cameraTween = null;
let laptopTween = null;

function startCameraTween(fromPos, toPos, fromLookAt, toLookAt, duration = 900) {
    cameraTween = {
        startTime: performance.now(),
        duration,
        fromPos: fromPos.clone(),
        toPos: toPos.clone(),
        fromLook: fromLookAt.clone(),
        toLook: toLookAt.clone()
    };
}

function enterDemo() {
    if (inDemo) return;
    inDemo = true;
    const overlay = document.getElementById('ui-overlay');
    if (overlay) { overlay.style.transition = 'opacity 0.8s'; overlay.style.opacity = '0'; }
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn) enterBtn.style.display = 'none';
    const fromPos = camera.position.clone();
    let toPos, toLook;
    if (screenCenter && screenNormal && screenMesh) {
        const bbox = new THREE.Box3().setFromObject(screenMesh);
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y);
        const fovRad = THREE.MathUtils.degToRad(camera.fov);
        let distance = (maxDim / 2) / Math.tan(fovRad / 2) * 1.15;
        distance = Math.max(0.6, Math.min(distance, 25));
        toLook = screenCenter.clone();
        toPos = screenCenter.clone().add(screenNormal.clone().multiplyScalar(distance));
    } else {
        toPos = new THREE.Vector3(0, 1.3, 3.2);
        toLook = new THREE.Vector3(0, 0, 0.9);
    }
    startCameraTween(fromPos, toPos, camera.getWorldDirection(new THREE.Vector3()).add(camera.position), toLook, 1200);
    setTimeout(() => { video.play().catch((e) => { console.warn('video play blocked', e); }); }, 700);
    if (laptop) {
        laptopTween = { startTime: performance.now(), duration: 900, fromY: laptop.rotation.y, toY: -Math.PI / 4 };
    } else {
        console.warn('Laptop model not loaded yet - rotation will not animate');
    }
}

function exitDemo() {
    if (!inDemo) return;
    inDemo = false;
    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.style.opacity = '1';
    const enterBtn = document.getElementById('enterBtn');
    if (enterBtn) enterBtn.style.display = '';
    const fromPos = camera.position.clone();
    const toPos = new THREE.Vector3(0, 1.7, 7);
    const fromLook = new THREE.Vector3(0, 0, 0.9);
    const toLook = new THREE.Vector3(0, 0, 0.9);
    startCameraTween(fromPos, toPos, fromLook, toLook, 1000);
    video.pause();
    if (laptop) {
        laptopTween = { startTime: performance.now(), duration: 700, fromY: laptop.rotation.y, toY: 0 };
    }
}

const enterBtn = document.getElementById('enterBtn');
if (enterBtn) enterBtn.addEventListener('click', (e) => { e.preventDefault(); enterDemo(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') exitDemo(); });

// mouse follow removed

function animate() {
    requestAnimationFrame(animate);
    if (cameraTween) {
        const now = performance.now();
        const t = Math.min(1, (now - cameraTween.startTime) / cameraTween.duration);
        const ease = t * (2 - t);
        camera.position.lerpVectors(cameraTween.fromPos, cameraTween.toPos, ease);
        const look = cameraTween.fromLook.clone().lerp(cameraTween.toLook, ease);
        camera.lookAt(look);
        if (t >= 1) cameraTween = null;
    }
    if (laptop) {
        if (laptopTween) {
            const now = performance.now();
            const t = Math.min(1, (now - laptopTween.startTime) / laptopTween.duration);
            const ease = t * (2 - t);
            laptop.rotation.y = THREE.MathUtils.lerp(laptopTween.fromY, laptopTween.toY, ease);
            if (t >= 1) laptopTween = null;
        }
        laptop.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
