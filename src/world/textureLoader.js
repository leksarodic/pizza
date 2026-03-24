import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map();

export function loadTexture(path) {
  if (!path) {
    return null;
  }

  if (!cache.has(path)) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    cache.set(path, texture);
  }

  return cache.get(path);
}
