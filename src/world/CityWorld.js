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
    this.cameraOccluders = [];
  }

  build() {
    this.addSkyline();
    this.addGround();
    this.addRoads();
    this.addWaterfront();
    this.addDistrictBlocks();
    this.addLandmarks();
    this.addProps();
  }

  addSkyline() {
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(340, 32, 20),
      new THREE.MeshBasicMaterial({
        color: 0x274776,
        side: THREE.BackSide,
      }),
    );
    skyDome.position.y = 40;
    this.scene.add(skyDome);

    const sunsetDisc = new THREE.Mesh(
      new THREE.CircleGeometry(16, 32),
      new THREE.MeshBasicMaterial({ color: 0xffa35d, transparent: true, opacity: 0.34 }),
    );
    sunsetDisc.position.set(145, 42, -120);
    sunsetDisc.lookAt(new THREE.Vector3(0, 42, 0));
    this.scene.add(sunsetDisc);

    for (let i = 0; i < 80; i += 1) {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.28 + (i % 3) * 0.04, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xf4e7cb, transparent: true, opacity: 0.45 }),
      );
      star.position.set(
        -180 + (i * 17) % 360,
        72 + (i % 8) * 9,
        -170 + (i * 29) % 340,
      );
      this.scene.add(star);
    }
  }

  getSpawnPoint() {
    return this.spawnPoint.clone();
  }

  getCameraOccluders() {
    return this.cameraOccluders;
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

  addGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(CITY_BOUNDS * 2.2, CITY_BOUNDS * 2.2),
      new THREE.MeshStandardMaterial({ color: 0x43694b, roughness: 0.98 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const park = new THREE.Mesh(
      new THREE.BoxGeometry(56, 0.12, 46),
      new THREE.MeshStandardMaterial({ color: 0x5d8452, roughness: 1 }),
    );
    park.position.set(2, 0.06, 15);
    park.receiveShadow = true;
    this.scene.add(park);

    const hill = new THREE.Mesh(
      new THREE.CylinderGeometry(34, 48, 18, 8),
      new THREE.MeshStandardMaterial({ color: 0x5d7a50, roughness: 1 }),
    );
    hill.position.set(-104, 8.8, 112);
    hill.receiveShadow = true;
    this.scene.add(hill);

    const overlook = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 12, 2.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xd3bea2, roughness: 1 }),
    );
    overlook.position.set(-104, 18.7, 112);
    overlook.receiveShadow = true;
    this.scene.add(overlook);
  }

  addRoads() {
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.96 });
    const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xe9d5a2, roughness: 0.8 });
    const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x7b7d84, roughness: 1 });
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0xb9aa95, roughness: 1 });

    const roads = [
      { x: 0, z: 0, width: 18, depth: 300 },
      { x: -72, z: 0, width: 16, depth: 300 },
      { x: 72, z: 0, width: 16, depth: 300 },
      { x: 0, z: 84, width: 300, depth: 18 },
      { x: 0, z: 12, width: 300, depth: 18 },
      { x: 0, z: -72, width: 300, depth: 18 },
      { x: -92, z: -30, width: 82, depth: 12 },
      { x: 92, z: -100, width: 78, depth: 12 },
      { x: -108, z: 104, width: 60, depth: 10 },
      { x: 118, z: 64, width: 62, depth: 10 },
      { x: -118, z: 34, width: 46, depth: 10 },
    ];

    for (const road of roads) {
      const roadMesh = new THREE.Mesh(
        new THREE.BoxGeometry(road.width, 0.05, road.depth),
        roadMaterial,
      );
      roadMesh.position.set(road.x, 0.025, road.z);
      roadMesh.receiveShadow = true;
      this.scene.add(roadMesh);

      const curb = new THREE.Mesh(
        new THREE.BoxGeometry(road.width + 3, 0.16, road.depth + 3),
        curbMaterial,
      );
      curb.position.set(road.x, 0.08, road.z);
      curb.receiveShadow = true;
      this.scene.add(curb);
      roadMesh.renderOrder = 1;

      const shoulder = new THREE.Mesh(
        new THREE.BoxGeometry(road.width + 10, 0.04, road.depth + 10),
        shoulderMaterial,
      );
      shoulder.position.set(road.x, 0.02, road.z);
      shoulder.receiveShadow = true;
      this.scene.add(shoulder);
      shoulder.renderOrder = 0;

      const isVertical = road.depth > road.width;
      const stripeLength = isVertical ? road.depth - 8 : road.width - 8;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(isVertical ? 0.45 : stripeLength, 0.06, isVertical ? stripeLength : 0.45),
        stripeMaterial,
      );
      stripe.position.set(road.x, 0.09, road.z);
      this.scene.add(stripe);

      addRoadEdgeMarks(this.scene, road, isVertical);
    }
  }

  addWaterfront() {
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 248),
      new THREE.MeshStandardMaterial({
        color: 0x315f76,
        transparent: true,
        opacity: 0.88,
        roughness: 0.28,
        metalness: 0.08,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(102, 0.03, 18);
    this.scene.add(water);

    const promenade = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.22, 228),
      new THREE.MeshStandardMaterial({ color: 0xcab598, roughness: 1 }),
    );
    promenade.position.set(52, 0.11, 18);
    promenade.receiveShadow = true;
    this.scene.add(promenade);

    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.28, 18),
      new THREE.MeshStandardMaterial({ color: 0xa39a8f, roughness: 0.92 }),
    );
    bridge.position.set(72, 0.16, 12);
    bridge.receiveShadow = true;
    this.scene.add(bridge);
  }

  addDistrictBlocks() {
    const palettes = {
      apartments: [0xdc7850, 0xc0534e, 0xc79e62, 0x7f90ab, 0xe29b67],
      houses: [0xe7c39d, 0xd98558, 0x95ad8e, 0xcd6e62, 0xb5c8d3],
      industrial: [0x878f94, 0xa16e4b, 0x5f6c74, 0x7a6f65],
      towers: [0x8698a7, 0xbe7f62, 0xd7a96a],
    };

    const plots = [
      ...createGrid([-20, 20], [44, 140], 5, 6, palettes.towers, { width: 9, depth: 9, minHeight: 12, maxHeight: 26 }),
      ...createGrid([-136, -24], [-140, -28], 4, 4, palettes.houses, { width: 12, depth: 10, minHeight: 4, maxHeight: 7 }),
      ...createGrid([-136, -84], [70, 138], 3, 4, palettes.houses, { width: 11, depth: 10, minHeight: 4, maxHeight: 8 }),
      ...createGrid([-144, -84], [-6, 42], 3, 3, palettes.houses, { width: 10, depth: 10, minHeight: 5, maxHeight: 8 }),
      ...createGrid([44, 136], [-140, -26], 5, 4, palettes.industrial, { width: 13, depth: 13, minHeight: 6, maxHeight: 11 }),
      ...createGrid([52, 138], [22, 54], 4, 2, palettes.apartments, { width: 11, depth: 11, minHeight: 6, maxHeight: 14 }),
      ...createGrid([82, 134], [68, 134], 3, 4, palettes.apartments, { width: 12, depth: 12, minHeight: 8, maxHeight: 16 }),
      ...createGrid([-58, -30], [74, 132], 2, 4, palettes.apartments, { width: 8, depth: 8, minHeight: 7, maxHeight: 15 }),
    ];

    for (const plot of plots) {
      this.addBuilding(plot);
    }
  }

  addBuilding(plot) {
    const building = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(plot.width, plot.height, plot.depth),
      new THREE.MeshStandardMaterial({ color: plot.color, roughness: 0.94 }),
    );
    base.position.y = plot.height / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    building.add(base);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(plot.width + 0.5, 0.35, plot.depth + 0.5),
      new THREE.MeshStandardMaterial({ color: 0x4f4f58, roughness: 1 }),
    );
    roof.position.y = plot.height + 0.18;
    roof.receiveShadow = true;
    building.add(roof);

    const lobby = new THREE.Mesh(
      new THREE.BoxGeometry(plot.width * 0.48, Math.max(2.4, plot.height * 0.2), plot.depth * 0.3),
      new THREE.MeshStandardMaterial({ color: brighten(plot.color, 0.18), roughness: 0.9 }),
    );
    lobby.position.set(0, lobby.geometry.parameters.height / 2, plot.depth * 0.36);
    lobby.castShadow = true;
    building.add(lobby);

    const windowRows = Math.max(2, Math.floor(plot.height / 3));
    for (let row = 0; row < windowRows; row += 1) {
      for (const side of [-1, 1]) {
        const windowStrip = new THREE.Mesh(
          new THREE.BoxGeometry(plot.width * 0.12, 0.4, 0.15),
          new THREE.MeshStandardMaterial({
            color: 0xf6d7a4,
            emissive: 0xe9aa63,
            emissiveIntensity: 0.35,
            roughness: 0.45,
          }),
        );
        windowStrip.position.set(
          side * (plot.width / 2 - 0.5),
          1.8 + row * 2.3,
          0,
        );
        building.add(windowStrip);
      }
    }

    building.position.set(plot.x, 0, plot.z);
    this.scene.add(building);
    this.cameraOccluders.push(base);
  }

  addLandmarks() {
    this.addGasStation();
    this.addWarehouseRow();
    this.addDowntownPlaza();
    this.addRiverPier();
  }

  addGasStation() {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(10, 3, 7),
      new THREE.MeshStandardMaterial({ color: 0xe4d2ba, roughness: 0.92 }),
    );
    base.position.set(72, 1.5, -12);
    base.castShadow = true;
    this.scene.add(base);
    this.cameraOccluders.push(base);

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.6, 10),
      new THREE.MeshStandardMaterial({ color: 0xcb634e, roughness: 0.82 }),
    );
    canopy.position.set(86, 4.2, -12);
    canopy.castShadow = true;
    this.scene.add(canopy);

    for (const x of [82, 90]) {
      const pump = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.8, 1),
        new THREE.MeshStandardMaterial({ color: 0x9eaab1, roughness: 0.7 }),
      );
      pump.position.set(x, 0.9, -12);
      pump.castShadow = true;
      this.scene.add(pump);
    }
  }

  addWarehouseRow() {
    for (let i = 0; i < 4; i += 1) {
      const unit = new THREE.Mesh(
        new THREE.BoxGeometry(14, 6 + i, 10),
        new THREE.MeshStandardMaterial({ color: 0x7b8087, roughness: 0.96 }),
      );
      unit.position.set(84 + i * 15, 3 + i * 0.5, -78);
      unit.castShadow = true;
      unit.receiveShadow = true;
      this.scene.add(unit);
      this.cameraOccluders.push(unit);
    }
  }

  addDowntownPlaza() {
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 9, 0.18, 20),
      new THREE.MeshStandardMaterial({ color: 0xcbb79d, roughness: 1 }),
    );
    plaza.position.set(0, 0.1, 48);
    plaza.receiveShadow = true;
    this.scene.add(plaza);

    const sculpture = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.8, 0.4, 48, 10),
      new THREE.MeshStandardMaterial({ color: 0x98b8c9, metalness: 0.28, roughness: 0.48 }),
    );
    sculpture.position.set(0, 3, 48);
    sculpture.castShadow = true;
    this.scene.add(sculpture);

    for (const x of [-4, 4]) {
      const planter = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.4, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0xa27658, roughness: 1 }),
      );
      planter.position.set(x, 0.45, 54);
      planter.receiveShadow = true;
      this.scene.add(planter);
    }
  }

  addRiverPier() {
    for (let i = 0; i < 5; i += 1) {
      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.18, 14),
        new THREE.MeshStandardMaterial({ color: 0x8f6a48, roughness: 1 }),
      );
      pier.position.set(62, 0.12, 76 - i * 26);
      pier.receiveShadow = true;
      this.scene.add(pier);
    }
  }

  addProps() {
    addTreeCluster(this.scene, [-20, -4, 12, 26], [2, 18, 30], 0x4a734d);
    addTreeCluster(this.scene, [-130, -116, -102, -88], [-134, -116, -94], 0x4d7448);
    addTreeCluster(this.scene, [52, 64, 78], [98, 120, 140], 0x537c56);
    addStreetlights(this.scene, [
      [0, 62], [0, 108], [72, -40], [72, 34], [-72, -40], [-72, 28], [48, 94], [-48, 94],
      [72, 94], [72, 136], [-108, 104], [-118, -70], [118, -104], [52, 14], [-40, 12],
    ]);
    addBenches(this.scene, [
      [52, 86], [52, 92], [-16, 8], [16, 8], [-104, 112], [4, 48], [-6, 48],
    ]);
    addParkedCars(this.scene, [
      [-86, -68], [-60, -90], [88, -118], [114, -84], [70, 40], [-74, 94], [90, 18], [-116, 34], [18, 118], [-12, 122],
    ]);
    addSigns(this.scene, [
      [0, 84], [72, 12], [-72, -72], [72, -72], [52, 108], [-108, 104], [118, -98],
    ]);
    addTrashBins(this.scene, [[-10, 38], [10, 38], [54, 42], [74, -14], [-94, -38]]);
    addFenceRow(this.scene, 44, -120, 124);
    addCrosswalks(this.scene, [
      { x: 0, z: 84, width: 8, depth: 18, horizontal: true },
      { x: 72, z: 12, width: 8, depth: 16, horizontal: true },
      { x: -72, z: -72, width: 8, depth: 16, horizontal: true },
    ]);
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
        height: dimensions.minHeight + ((ix * 2 + iz) % (dimensions.maxHeight - dimensions.minHeight + 1)),
        color: palette[(ix + iz) % palette.length],
      });
    }
  }

  return blocks;
}

function brighten(color, amount) {
  const source = new THREE.Color(color);
  return source.lerp(new THREE.Color(0xffffff), amount).getHex();
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
  const colors = [0x84a2b8, 0xe8d6a7, 0xb55d5c, 0x527871, 0xd68459];

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

function addSigns(scene, positions) {
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x666d7d, roughness: 0.8 });
  const signMaterial = new THREE.MeshStandardMaterial({ color: 0xf2d7a0, roughness: 0.9 });

  for (const [x, z] of positions) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8), poleMaterial);
    pole.position.set(x, 1.1, z);
    pole.castShadow = true;
    scene.add(pole);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.12), signMaterial);
    sign.position.set(x, 2.15, z);
    sign.castShadow = true;
    scene.add(sign);
  }
}

function addRoadEdgeMarks(scene, road, isVertical) {
  const paintMaterial = new THREE.MeshStandardMaterial({ color: 0xf6efe0, roughness: 0.85 });
  const edgeOffset = isVertical ? road.width / 2 - 1.2 : road.depth / 2 - 1.2;

  for (const sign of [-1, 1]) {
    const mark = new THREE.Mesh(
      new THREE.BoxGeometry(isVertical ? 0.22 : road.width - 6, 0.05, isVertical ? road.depth - 6 : 0.22),
      paintMaterial,
    );
    mark.position.set(
      road.x + (isVertical ? sign * edgeOffset : 0),
      0.08,
      road.z + (isVertical ? 0 : sign * edgeOffset),
    );
    scene.add(mark);
  }
}

function addCrosswalks(scene, crossings) {
  const material = new THREE.MeshStandardMaterial({ color: 0xf3efe6, roughness: 0.82 });

  for (const crossing of crossings) {
    for (let i = -2; i <= 2; i += 1) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(crossing.horizontal ? 0.9 : crossing.width, 0.05, crossing.horizontal ? crossing.depth : 0.9),
        material,
      );
      stripe.position.set(
        crossing.x + (crossing.horizontal ? i * 1.5 : 0),
        0.1,
        crossing.z + (crossing.horizontal ? 0 : i * 1.5),
      );
      scene.add(stripe);
    }
  }
}

function addTrashBins(scene, positions) {
  const material = new THREE.MeshStandardMaterial({ color: 0x67737b, roughness: 0.86 });

  for (const [x, z] of positions) {
    const bin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), material);
    bin.position.set(x, 0.45, z);
    bin.castShadow = true;
    scene.add(bin);
  }
}

function addFenceRow(scene, x, minZ, maxZ) {
  const material = new THREE.MeshStandardMaterial({ color: 0x818893, roughness: 0.94 });
  for (let z = minZ; z <= maxZ; z += 8) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 4), material);
    panel.position.set(x, 0.6, z);
    panel.castShadow = true;
    scene.add(panel);
  }
}
