import * as THREE from 'three';

export const floatingMeshes = [];
export const activeLasers = [];
export const explosionParticles = [];
export let score = 0;
export const hitShips = new Set();

export function addExtraObjects(scene) {
  const shipCount = 20;

  for (let i = 0; i < shipCount; i++) {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = Math.random() > 0.5
      ? new THREE.CylinderGeometry(0.2, 0.2, 1.2, 16)
      : new THREE.ConeGeometry(0.25, 1.2, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: Math.random() * 0xffffff,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x111111,
      emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Cockpit
    const domeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const domeMaterial = new THREE.MeshStandardMaterial({
      color: 0xddddff,
      transparent: true,
      opacity: 0.8
    });
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 1.1;
    group.add(dome);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.7);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    const rightWing = leftWing.clone();
    leftWing.position.set(-0.3, 0.5, 0);
    rightWing.position.set(0.3, 0.5, 0);
    group.add(leftWing, rightWing);

    // Engine
    const thrusterGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12);
    const thrusterMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5500,
      emissive: 0xff2200,
      emissiveIntensity: 0.6
    });
    const thruster = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
    thruster.position.y = -0.3;
    group.add(thruster);

    // Engine light
    const engineLight = new THREE.PointLight(0xff6600, 1, 2);
    engineLight.position.set(0, -0.5, 0);
    group.add(engineLight);

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.y = 1.4;
    group.add(antenna);

    // Position and properties
    group.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 5 + 1,
      (Math.random() - 0.5) * 20
    );
    group.rotation.y = Math.random() * Math.PI * 2;
    group.userData = {
      engineIntensity: 1,
      flickerSpeed: Math.random() * 0.1 + 0.05,
      hitPoints: 3
    };
    
    floatingMeshes.push(group);
    scene.add(group);
  }
}

export function addStars(scene, count = 200) {
  const geometry = new THREE.SphereGeometry(0.02, 6, 6);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });

  for (let i = 0; i < count; i++) {
    const star = new THREE.Mesh(geometry, material);
    star.position.set(
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    );
    scene.add(star);
  }
}

export function createLaser(sourceObject) {
  const geometry = new THREE.CylinderGeometry(0.03, 0.03, 2, 8);
  const material = new THREE.MeshBasicMaterial({
    color: sourceObject.isCamera ? 0x00ff00 : 0xff0000,
    transparent: true,
    opacity: 0.9
  });
  const laser = new THREE.Mesh(geometry, material);

  laser.rotation.x = Math.PI / 2;
  laser.position.copy(sourceObject.position);
  laser.position.z -= 1;

  laser.userData = {
    velocity: new THREE.Vector3(0, 0, -0.5),
    isPlayerLaser: sourceObject.isCamera
  };

  activeLasers.push(laser);
  return laser;
}

export function createExplosion(position, scene) {
  const particleCount = 100;
  const particles = new THREE.Group();
  
  for (let i = 0; i < particleCount; i++) {
    const size = Math.random() * 0.2 + 0.1;
    const geometry = new THREE.SphereGeometry(size, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        Math.random() * 0.5 + 0.5,
        Math.random() * 0.3,
        0
      ),
      transparent: true,
      opacity: 0.8
    });
    
    const particle = new THREE.Mesh(geometry, material);
    particle.position.copy(position);
    particle.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).multiplyScalar(0.5),
      lifetime: 0
    };
    
    particles.add(particle);
    explosionParticles.push(particle);
  }
  
  scene.add(particles);
  return particles;
}

export function updateParticles(deltaTime, scene) {
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const particle = explosionParticles[i];
    particle.userData.lifetime += deltaTime;
    
    if (particle.userData.lifetime > 2) {
      scene.remove(particle);
      explosionParticles.splice(i, 1);
      continue;
    }
    
    particle.position.add(
      particle.userData.velocity.clone().multiplyScalar(deltaTime * 10)
    );
    particle.material.opacity = 1 - (particle.userData.lifetime / 2);
  }
}
