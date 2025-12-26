// Sélection des éléments
const enterBtn = document.getElementById('enterBtn'); // Bouton "Enter the Hub"
const hubNav = document.querySelector('.nav'); // Votre barre de boutons

// Fonction de transition
enterBtn.addEventListener('click', () => {
    
    // 1. Lancer la vidéo sur l'écran du laptop (si définie)
    if (typeof video !== 'Clipchamp.mp4') {
        video.play();
    }

    // 2. Animation de la caméra (Effet de zoom immersif)
    // Nous utilisons GSAP pour une transition fluide
    gsap.to(camera.position, {
        z: 3.5, // On se rapproche de l'écran
        y: 1.2, // On ajuste la hauteur de vue
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(0, 0, 0)
    });

    // 3. Changement de style des boutons (Optionnel)
    // On peut par exemple cacher le bouton Enter et afficher les autres
    enterBtn.style.display = 'none';
    document.querySelectorAll('.btn:not(.primary)').forEach(btn => {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'all';
    });

    console.log("Hub activé : Immersion en cours...");
});


// 1. Créer l'élément vidéo HTML (invisible à l'écran)
const video = document.createElement('video');
video.src = "Clipchamp.mp4"; // Chemin vers votre vidéo
video.loop = true;
video.muted = true; // Indispensable pour l'auto-play sur la plupart des navigateurs
video.play();

// 2. Transformer la vidéo en texture Three.js
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;

// 3. Créer le matériau qui sera appliqué sur l'écran
const screenMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

loader.load('laptop.glb', (gltf) => {
    const model = gltf.scene;

    // Parcourir les parties du modèle pour trouver l'écran
    model.traverse((child) => {
        if (child.isMesh) {
            // "Screen" est le nom de l'objet dans Blender. 
            // Vérifiez le nom exact dans votre fichier source.
            if (child.name === "Screen" || child.name.includes("ecran")) {
                child.material = screenMaterial;
            }
        }
    });

    scene.add(model);
});

window.addEventListener('click', () => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
});