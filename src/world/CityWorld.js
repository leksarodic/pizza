import * as THREE from 'three';
import { CITY_BOUNDS } from '../core/config.js';
import { WORLD_BLUEPRINT, vectorFrom } from './worldBlueprint.js';
import { loadTexture } from './textureLoader.js';

export class CityWorld {
  constructor(scene) {
    this.scene = scene;
    this.spawnPoint = vectorFrom(WORLD_BLUEPRINT.spawnPoint);
    this.cameraOccluders = [];
    this.collisionVolumes = [];
  }

  build() {
    this.addSkyline();
    this.addGround();
    this.addRoads();
    this.addWaterfront();
    this.addDistrictBlocks();
    this.addLandmarks();
    this.addProps();
    this.addBillboards();
  }

  getSpawnPoint() {
    return this.spawnPoint.clone();
  }

  getCameraOccluders() {
    return this.cameraOccluders;
  }

  resolveVehicleCollision(position, radius, previousPosition) {
    let collided = false;

    for (const collider of this.collisionVolumes) {
      if (collider.type === 'box') {
        const halfWidth = collider.width / 2 + radius;
        const halfDepth = collider.depth / 2 + radius;
        const dx = position.x - collider.x;
        const dz = position.z - collider.z;

        if (Math.abs(dx) < halfWidth && Math.abs(dz) < halfDepth) {
          const overlapX = halfWidth - Math.abs(dx);
          const overlapZ = halfDepth - Math.abs(dz);

          if (overlapX < overlapZ) {
            position.x += dx >= 0 ? overlapX : -overlapX;
          } else {
            position.z += dz >= 0 ? overlapZ : -overlapZ;
          }

          collided = true;
        }
      }

      if (collider.type === 'circle') {
        const dx = position.x - collider.x;
        const dz = position.z - collider.z;
        const distance = Math.hypot(dx, dz);
        const minDistance = collider.radius + radius;

        if (distance < minDistance) {
          const angle = distance > 0.001 ? Math.atan2(dz, dx) : Math.atan2(position.z - previousPosition.z, position.x - previousPosition.x);
          position.x = collider.x + Math.cos(angle) * minDistance;
          position.z = collider.z + Math.sin(angle) * minDistance;
          collided = true;
        }
      }
    }

    return collided;
  }

  constrainPosition(position) {
    position.x = THREE.MathUtils.clamp(position.x, -CITY_BOUNDS, CITY_BOUNDS);
    position.z = THREE.MathUtils.clamp(position.z, -CITY_BOUNDS, CITY_BOUNDS);
  }

  getDistrictName(position) {
    return WORLD_BLUEPRINT.districts.find((district) =>
      position.x >= district.minX &&
      position.x <= district.maxX &&
      position.z >= district.minZ &&
      position.z <= district.maxZ,
    )?.name ?? 'City Edge';
  }

  addSkyline() {
    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(340, 32, 20),
      new THREE.MeshBasicMaterial({ color: 0x274776, side: THREE.BackSide }),
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
  }

  addGround() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(CITY_BOUNDS * 2.2, CITY_BOUNDS * 2.2),
      new THREE.MeshStandardMaterial({ color: 0x43694b, roughness: 0.98 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    WORLD_BLUEPRINT.parks.forEach((park) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(park.width, 0.12, park.depth),
        new THREE.MeshStandardMaterial({ color: park.color, roughness: 1 }),
      );
      mesh.position.set(park.x, 0.06, park.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });

    WORLD_BLUEPRINT.hills.forEach((hill) => {
      const mound = new THREE.Mesh(
        new THREE.CylinderGeometry(hill.radiusTop, hill.radiusBottom, hill.height, 8),
        new THREE.MeshStandardMaterial({ color: 0x5d7a50, roughness: 1 }),
      );
      mound.position.set(hill.x, hill.height / 2 - 0.2, hill.z);
      mound.receiveShadow = true;
      this.scene.add(mound);

      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(hill.topPadRadius, hill.topPadRadius, 2.4, 6),
        new THREE.MeshStandardMaterial({ color: 0xd3bea2, roughness: 1 }),
      );
      pad.position.set(hill.x, hill.height + 0.7, hill.z);
      pad.receiveShadow = true;
      this.scene.add(pad);
    });
  }

  addRoads() {
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.96 });
    const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0xe9d5a2, roughness: 0.8 });
    const curbMaterial = new THREE.MeshStandardMaterial({ color: 0x7b7d84, roughness: 1 });
    const shoulderMaterial = new THREE.MeshStandardMaterial({ color: 0xb9aa95, roughness: 1 });

    WORLD_BLUEPRINT.roads.forEach((road) => {
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

      const shoulder = new THREE.Mesh(
        new THREE.BoxGeometry(road.width + 10, 0.04, road.depth + 10),
        shoulderMaterial,
      );
      shoulder.position.set(road.x, 0.02, road.z);
      shoulder.receiveShadow = true;
      this.scene.add(shoulder);

      const isVertical = road.depth > road.width;
      const stripeLength = isVertical ? road.depth - 8 : road.width - 8;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(isVertical ? 0.45 : stripeLength, 0.06, isVertical ? stripeLength : 0.45),
        stripeMaterial,
      );
      stripe.position.set(road.x, 0.09, road.z);
      this.scene.add(stripe);

      addRoadEdgeMarks(this.scene, road, isVertical);
    });

    addCrosswalks(this.scene, WORLD_BLUEPRINT.crosswalks);
  }

  addWaterfront() {
    const river = WORLD_BLUEPRINT.water.river;
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(river.width, river.depth),
      new THREE.MeshStandardMaterial({
        color: 0x315f76,
        transparent: true,
        opacity: 0.88,
        roughness: 0.28,
        metalness: 0.08,
      }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(river.x, 0.03, river.z);
    this.scene.add(water);

    const promenade = WORLD_BLUEPRINT.water.promenade;
    const promenadeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(promenade.width, 0.22, promenade.depth),
      new THREE.MeshStandardMaterial({ color: 0xcab598, roughness: 1 }),
    );
    promenadeMesh.position.set(promenade.x, 0.11, promenade.z);
    promenadeMesh.receiveShadow = true;
    this.scene.add(promenadeMesh);

    WORLD_BLUEPRINT.water.piers.forEach((pier) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.18, 14),
        new THREE.MeshStandardMaterial({ color: 0x8f6a48, roughness: 1 }),
      );
      mesh.position.set(pier.x, 0.12, pier.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });
  }

  addDistrictBlocks() {
    WORLD_BLUEPRINT.buildingPlots.forEach((plot) => this.addBuilding(plot));
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

    const lobbyHeight = Math.max(2.4, plot.height * 0.2);
    const lobby = new THREE.Mesh(
      new THREE.BoxGeometry(plot.width * 0.48, lobbyHeight, plot.depth * 0.3),
      new THREE.MeshStandardMaterial({ color: brighten(plot.color, 0.18), roughness: 0.9 }),
    );
    lobby.position.set(0, lobbyHeight / 2, plot.depth * 0.36);
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
        windowStrip.position.set(side * (plot.width / 2 - 0.5), 1.8 + row * 2.3, 0);
        building.add(windowStrip);
      }
    }

    building.position.set(plot.x, 0, plot.z);
    this.scene.add(building);
    this.cameraOccluders.push(base);
    this.collisionVolumes.push({
      type: 'box',
      x: plot.x,
      z: plot.z,
      width: plot.width + 1,
      depth: plot.depth + 1,
    });
  }

  addLandmarks() {
    WORLD_BLUEPRINT.specialBuildings.forEach((building) => {
      if (building.kind === 'gasStation') {
        this.addGasStation(building);
      }
      if (building.kind === 'warehouseRow') {
        building.units.forEach((unit) => this.addWarehouse(unit));
      }
    });

    WORLD_BLUEPRINT.plazas.forEach((plaza) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(plaza.radius, plaza.radius, 0.18, 20),
        new THREE.MeshStandardMaterial({ color: 0xcbb79d, roughness: 1 }),
      );
      mesh.position.set(plaza.x, 0.1, plaza.z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    });

    WORLD_BLUEPRINT.pizzaPlaces.forEach((shop) => this.addPizzaPlace(shop));
  }

  addGasStation(building) {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(building.base.width, building.base.height, building.base.depth),
      new THREE.MeshStandardMaterial({ color: building.base.color, roughness: 0.92 }),
    );
    base.position.set(building.base.x, building.base.height / 2, building.base.z);
    base.castShadow = true;
    this.scene.add(base);
    this.cameraOccluders.push(base);
    this.collisionVolumes.push({
      type: 'box',
      x: building.base.x,
      z: building.base.z,
      width: building.base.width + 1,
      depth: building.base.depth + 1,
    });

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(building.canopy.width, building.canopy.height, building.canopy.depth),
      new THREE.MeshStandardMaterial({ color: building.canopy.color, roughness: 0.82 }),
    );
    canopy.position.set(building.canopy.x, 4.2, building.canopy.z);
    canopy.castShadow = true;
    this.scene.add(canopy);

    building.pumps.forEach((pump) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.8, 1),
        new THREE.MeshStandardMaterial({ color: 0x9eaab1, roughness: 0.7 }),
      );
      mesh.position.set(pump.x, 0.9, pump.z);
      mesh.castShadow = true;
      this.scene.add(mesh);
    });
  }

  addWarehouse(unit) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(unit.width, unit.height, unit.depth),
      new THREE.MeshStandardMaterial({ color: unit.color, roughness: 0.96 }),
    );
    mesh.position.set(unit.x, unit.height / 2, unit.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.cameraOccluders.push(mesh);
    this.collisionVolumes.push({
      type: 'box',
      x: unit.x,
      z: unit.z,
      width: unit.width + 1,
      depth: unit.depth + 1,
    });
  }

  addPizzaPlace(shop) {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(shop.width, shop.height, shop.depth),
      new THREE.MeshStandardMaterial({ color: shop.color, roughness: 0.95 }),
    );
    base.position.set(shop.x, shop.height / 2, shop.z);
    base.castShadow = true;
    base.receiveShadow = true;
    this.scene.add(base);
    this.cameraOccluders.push(base);
    this.collisionVolumes.push({
      type: 'box',
      x: shop.x,
      z: shop.z,
      width: shop.width + 1,
      depth: shop.depth + 1,
    });

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(shop.width + 0.8, 0.6, shop.depth + 0.8),
      new THREE.MeshStandardMaterial({ color: shop.roofColor, roughness: 0.85 }),
    );
    roof.position.set(shop.x, shop.height + 0.2, shop.z);
    roof.castShadow = true;
    this.scene.add(roof);
    this.cameraOccluders.push(roof);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1, 0.3),
      new THREE.MeshStandardMaterial({
        color: shop.signColor,
        emissive: 0xf48a4a,
        emissiveIntensity: 1.1,
        roughness: 0.45,
      }),
    );
    sign.position.set(shop.x, shop.height - 0.6, shop.z + shop.depth / 2 + 0.2);
    this.scene.add(sign);
  }

  addProps() {
    WORLD_BLUEPRINT.trees.forEach((cluster) => addTreeCluster(this.scene, this.collisionVolumes, cluster.xs, cluster.zs, cluster.color));
    addStreetlights(this.scene, WORLD_BLUEPRINT.streetlights);
    addBenches(this.scene, WORLD_BLUEPRINT.benches);
    addParkedCars(this.scene, WORLD_BLUEPRINT.parkedCars);
    addSigns(this.scene, WORLD_BLUEPRINT.signs);
    addTrashBins(this.scene, WORLD_BLUEPRINT.trashBins);
    WORLD_BLUEPRINT.fences.forEach((fence) => addFenceRow(this.scene, fence.x, fence.minZ, fence.maxZ));
  }

  addBillboards() {
    WORLD_BLUEPRINT.billboards.forEach((billboard) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, billboard.postHeight, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x666d7d, roughness: 0.85 }),
      );
      post.position.set(billboard.x, billboard.postHeight / 2, billboard.z);
      post.castShadow = true;
      this.scene.add(post);

      const texture = loadTexture(billboard.image);
      const boardMaterial = texture
        ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.78 })
        : new THREE.MeshStandardMaterial({ color: billboard.color, roughness: 0.84 });

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(billboard.width, billboard.height, 0.3),
        boardMaterial,
      );
      board.position.set(billboard.x, billboard.y, billboard.z);
      board.castShadow = true;
      this.scene.add(board);
      this.cameraOccluders.push(board);

      if (!texture && billboard.text) {
        const textSprite = createTextSprite(billboard.text);
        textSprite.position.set(billboard.x, billboard.y, billboard.z + 0.18);
        this.scene.add(textSprite);
      }
    });
  }
}

function brighten(color, amount) {
  const source = new THREE.Color(color);
  return source.lerp(new THREE.Color(0xffffff), amount).getHex();
}

function addTreeCluster(scene, collisionVolumes, xs, zs, color) {
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

      collisionVolumes.push({
        type: 'circle',
        x,
        z,
        radius: 1.6,
      });
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
  positions.forEach(([x, z]) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.6), material);
    bench.position.set(x, 0.45, z);
    bench.castShadow = true;
    scene.add(bench);
  });
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
  positions.forEach(([x, z]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8), poleMaterial);
    pole.position.set(x, 1.1, z);
    pole.castShadow = true;
    scene.add(pole);

    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.12), signMaterial);
    sign.position.set(x, 2.15, z);
    sign.castShadow = true;
    scene.add(sign);
  });
}

function addTrashBins(scene, positions) {
  const material = new THREE.MeshStandardMaterial({ color: 0x67737b, roughness: 0.86 });
  positions.forEach(([x, z]) => {
    const bin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), material);
    bin.position.set(x, 0.45, z);
    bin.castShadow = true;
    scene.add(bin);
  });
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
  crossings.forEach((crossing) => {
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
  });
}

function createTextSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgba(18, 25, 42, 0.78)';
  context.fillRect(16, 28, 224, 72);
  context.fillStyle = '#fff1db';
  context.font = '700 34px Trebuchet MS';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(6, 3, 1);
  return sprite;
}
