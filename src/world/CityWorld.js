import * as THREE from 'three';
import { CITY_BOUNDS } from '../core/config.js';

const districtDefinitions = [
  { name: 'Hilltop', minX: -160, maxX: -40, minZ: 55, maxZ: 160 },
  { name: 'Downtown', minX: -40, maxX: 46, minZ: 36, maxZ: 150 },
  { name: 'Waterfront', minX: 46, maxX: 160, minZ: 24, maxZ: 160 },
  { name: 'Old Town', minX: -160, maxX: -30, minZ: -18, maxZ: 55 },
  { name: 'Central Park', minX: -30, maxX: 35, minZ: -10, maxZ: 45 },
  { name: 'Market Street', minX: 35, maxX: 160, minZ: -10, maxZ: 55 },
  { name: 'Residential', minX: -160, maxX: 34, minZ: -160, maxZ: -18 },
  { name: 'Industry', minX: 34, maxX: 160, minZ: -160, maxZ: -10 },
];

export class CityWorld {
  constructor(scene) {
    this.scene = scene;
    this.spawnPoint = new THREE.Vector3(0, 0.35, 92);
  }

  build() {
    this.addGround();
    this.addWaterfront();
    this.addRoads();
    this.addDistrictBlocks();
    this.addProps();
  }

  addGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(CITY_BOUNDS * 2.2, CITY_BOUNDS * 2.2),
      new THREE.MeshStandardMaterial({ color: 0x43694b, roughness: 0.98 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  addWaterfront() {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 240),
      new THREE.MeshStandardMaterial({
        color: 0x315f76,
        transparent: true,
        opacity: 0.88,
        roughness: 0.28,
        metalness: 0.08,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(102, 0.03, 22);
    this.scene.add(water);

    const promenade = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.2, 220),
      new THREE.MeshStandardMaterial({ color: 0xcab598, roughness: 1 }),
    );
    promenade.position.set(52, 0.1, 22);
    promenade.receiveShadow = true;
    this.scene.add(promenade);
  }

  addRoads() {
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.96 });
    const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xe9d5a2, roughness: 0.8 });

    const roads = [
      { x: 0, z: 0, width: 18, depth: 300 },
      { x: -72, z: 0, width: 16, depth: 300 },
      { x: 72, z: 0, width: 16, depth: 300 },
      { x: 0, z: 84, width: 300, depth: 18 },
      { x: 0, z: 12, width: 300, depth: 18 },
      { x: 0, z: -72, width: 300, depth: 18 },
      { x: -92, z: -30, width: 78, depth: 12 },
      { x: 92, z: -100, width: 72, depth: 12 },
      { x: -108, z: 104, width: 56, depth: 10 },
    ];

    for (const road of roads) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(road.width, 0.05, road.depth),
        roadMaterial,
      );
      mesh.position.set(road.x, 0.025, road.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      const isVertical = road.depth > road.width;
      const stripeLength = isVertical ? road.depth - 8 : road.width - 8;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(isVertical ? 0.45 : stripeLength, 0.06, isVertical ? stripeLength : 0.45),
        stripeMaterial,
      );
      stripe.position.set(road.x, 0.07, road.z);
      this.scene.add(stripe);
    }
  }

  addDistrictBlocks() {
    const palettes = {
      apartments: [0xdc7850, 0xc0534e, 0xc79e62, 0x7f90ab],
      houses: [0xe7c39d, 0xd98558, 0x95ad8e, 0xcd6e62],
      industrial: [0x878f94, 0xa16e4b, 0x5f6c74],
    };

    const blocks = [
      ...createGrid([-16, 16], [42, 138], 4, 5, palettes.apartments, { width: 10, depth: 10, minHeight: 10, maxHeight: 20 }),
      ...createGrid([-136, -28], [-142, -32], 4, 4, palettes.houses, { width: 12, depth: 10, minHeight: 4, maxHeight: 7 }),
      ...createGrid([-132, -84], [66, 138], 2, 4, palettes.houses, { width: 12, depth: 10, minHeight: 4, maxHeight: 8 }),
      ...createGrid([44, 136], [-140, -26], 4, 4, palettes.industrial, { width: 13, depth: 13, minHeight: 6, maxHeight: 11 }),
      ...createGrid([52, 138], [18, 54], 3, 2, palettes.apartments, { width: 11, depth: 11, minHeight: 6, maxHeight: 12 }),
      ...createGrid([-134, -84], [-6, 42], 2, 2, palettes.houses, { width: 11, depth: 11, minHeight: 5, maxHeight: 8 }),
    ];

    for (const block of blocks) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(block.width, block.height, block.depth),
        new THREE.MeshStandardMaterial({ color: block.color, roughness: 0.96 }),
      );
      mesh.position.set(block.x, block.height / 2, block.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    }

    const hill = new THREE.Mesh(
      new THREE.CylinderGeometry(32, 46, 18, 8),
      new THREE.MeshStandardMaterial({ color: 0x56724f, roughness: 1 }),
    );
    hill.position.set(-104, 8.8, 112);
    hill.receiveShadow = true;
    this.scene.add(hill);

    const overlook = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 12, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0xcab598, roughness: 1 }),
    );
    overlook.position.set(-104, 18.5, 112);
    overlook.receiveShadow = true;
    this.scene.add(overlook);
  }

  addProps() {
    addTreeCluster(this.scene, [-20, 0, 20], [6, 22], 0x446d4f);
    addTreeCluster(this.scene, [-124, -110, -96], [-128, -104, -82], 0x4d7448);
    addStreetlights(this.scene, [
      [0, 62], [0, 108], [72, -40], [72, 34], [-72, -40], [-72, 28], [48, 94], [-48, 94],
    ]);
    addBenches(this.scene, [
      [52, 86], [52, 92], [-16, 8], [16, 8], [-104, 112],
    ]);
    addParkedCars(this.scene, [
      [-86, -68], [-60, -90], [88, -118], [114, -84], [70, 40], [-74, 94],
    ]);
    addSigns(this.scene, [
      [0, 84, 'PIZZA'], [72, 12, 'PIER'], [-72, -72, 'HOMES'], [72, -72, 'YARD'],
    ]);
  }

  getSpawnPoint() {
    return this.spawnPoint.clone();
  }

  constrainPosition(position) {
    position.x = THREE.MathUtils.clamp(position.x, -CITY_BOUNDS, CITY_BOUNDS);
    position.z = THREE.MathUtils.clamp(position.z, -CITY_BOUNDS, CITY_BOUNDS);
  }

  getDistrictName(position) {
    return districtDefinitions.find((district) =>
      position.x >= district.minX &&
      position.x <= district.maxX &&
      position.z >= district.minZ &&
      position.z <= district.maxZ,
    )?.name ?? 'City Edge';
  }
}

function createGrid([minX, maxX], [minZ, maxZ], countX, countZ, palette, dimensions) {
  const blocks = [];
  const stepX = (maxX - minX) / Math.max(1, countX - 1);
  const stepZ = (maxZ - minZ) / Math.max(1, countZ - 1);

  for (let ix = 0; ix < countX; ix += 1) {
    for (let iz = 0; iz < countZ; iz += 1) {
      blocks.push({
        x: minX + stepX * ix,
        z: minZ + stepZ * iz,
        width: dimensions.width,
        depth: dimensions.depth,
        height: dimensions.minHeight + ((ix + iz) % (dimensions.maxHeight - dimensions.minHeight + 1)),
        color: palette[(ix + iz) % palette.length],
      });
    }
  }

  return blocks;
}

function addTreeCluster(scene, xs, zs, color) {
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6d4a30, roughness: 1 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color, roughness: 1 });

  xs.forEach((x) => {
    zs.forEach((z) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.6, 8), trunkMaterial);
      trunk.position.set(x, 1.3, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), leafMaterial);
      crown.position.set(x, 3.2, z);
      crown.castShadow = true;
      scene.add(crown);
    });
  });
}

function addStreetlights(scene, positions) {
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x40495f, roughness: 0.8 });
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd18c,
    emissive: 0xffa34d,
    emissiveIntensity: 1.2,
  });

  for (const [x, z] of positions) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5, 8), poleMaterial);
    pole.position.set(x, 2.5, z);
    pole.castShadow = true;
    scene.add(pole);

    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.55), lampMaterial);
    lamp.position.set(x, 4.9, z);
    lamp.castShadow = true;
    scene.add(lamp);
  }
}

function addBenches(scene, positions) {
  const material = new THREE.MeshStandardMaterial({ color: 0x9e6948, roughness: 1 });

  for (const [x, z] of positions) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.6), material);
    bench.position.set(x, 0.45, z);
    bench.castShadow = true;
    scene.add(bench);
  }
}

function addParkedCars(scene, positions) {
  const colors = [0x84a2b8, 0xe8d6a7, 0xb55d5c, 0x527871];

  positions.forEach(([x, z], index) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.8, 4.4),
      new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 0.74 }),
    );
    mesh.position.set(x, 0.42, z);
    mesh.castShadow = true;
    scene.add(mesh);
  });
}

function addSigns(scene, signs) {
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x666d7d, roughness: 0.8 });
  const signMaterial = new THREE.MeshStandardMaterial({ color: 0xf2d7a0, roughness: 0.9 });

  for (const [x, z] of signs.map(([signX, signZ]) => [signX, signZ])) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8), poleMaterial);
    pole.position.set(x, 1.1, z);
    pole.castShadow = true;
    scene.add(pole);
  }

  for (const [x, z] of signs.map(([signX, signZ]) => [signX, signZ])) {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.12), signMaterial);
    sign.position.set(x, 2.15, z);
    sign.castShadow = true;
    scene.add(sign);
  }
}
