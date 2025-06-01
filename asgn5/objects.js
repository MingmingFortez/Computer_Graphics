import * as THREE from 'three';

export const floatingMeshes = [];

export function addExtraObjects(scene) {
  const geo0 = new THREE.SphereGeometry(0.53, 32, 32);
  const mat0 = new THREE.MeshStandardMaterial({ color: 0x26262c });
  const mesh0 = new THREE.Mesh(geo0, mat0);
  mesh0.position.set(0.17, 4.1, 9.2);
  floatingMeshes.push(mesh0);
  scene.add(mesh0);

  const geo1 = new THREE.SphereGeometry(0.52, 32, 32);
  const mat1 = new THREE.MeshStandardMaterial({ color: 0x9a5944 });
  const mesh1 = new THREE.Mesh(geo1, mat1);
  mesh1.position.set(-1.58, 3.65, -2.01);
  floatingMeshes.push(mesh1);
  scene.add(mesh1);

  const geo2 = new THREE.DodecahedronGeometry(2.12);
  const mat2 = new THREE.MeshStandardMaterial({ color: 0x1ba20f });
  const mesh2 = new THREE.Mesh(geo2, mat2);
  mesh2.position.set(5.42, 1.74, -0.11);
  floatingMeshes.push(mesh2);
  scene.add(mesh2);

  const geo3 = new THREE.OctahedronGeometry(1.23);
  const mat3 = new THREE.MeshStandardMaterial({ color: 0x5e62ee });
  const mesh3 = new THREE.Mesh(geo3, mat3);
  mesh3.position.set(4.47, 3.51, -0.59);
  floatingMeshes.push(mesh3);
  scene.add(mesh3);

  const geo4 = new THREE.IcosahedronGeometry(1.39);
  const mat4 = new THREE.MeshStandardMaterial({ color: 0x93dcb2 });
  const mesh4 = new THREE.Mesh(geo4, mat4);
  mesh4.position.set(-2.12, 2.44, 5.66);
  floatingMeshes.push(mesh4);
  scene.add(mesh4);

  for (let i = 5; i < 20; i++) {
    const shape = Math.floor(Math.random() * 5);
    let geometry;
    switch (shape) {
      case 0:
        geometry = new THREE.BoxGeometry(); break;
      case 1:
        geometry = new THREE.SphereGeometry(0.5, 16, 16); break;
      case 2:
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16); break;
      case 3:
        geometry = new THREE.TorusGeometry(0.4, 0.15, 16, 32); break;
      default:
        geometry = new THREE.ConeGeometry(0.4, 1.0, 16); break;
    }
    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 5 + 1,
      (Math.random() - 0.5) * 20
    );
    floatingMeshes.push(mesh);
    scene.add(mesh);
  }
}
