import * as THREE from 'three';

const SHOP_POSITION = new THREE.Vector3(0, 0, 92);
const destinations = [
  { name: 'Riverside Loft', district: 'Waterfront', position: new THREE.Vector3(68, 0, 86) },
  { name: 'Maple Court', district: 'Residential', position: new THREE.Vector3(-104, 0, -72) },
  { name: 'Foundry Office', district: 'Industry', position: new THREE.Vector3(90, 0, -108) },
  { name: 'Hilltop Overlook', district: 'Hilltop', position: new THREE.Vector3(-104, 0, 112) },
  { name: 'Park Kiosk', district: 'Central Park', position: new THREE.Vector3(18, 0, 10) },
];

export class DeliveryManager {
  constructor(scene, occluders = []) {
    this.scene = scene;
    this.occluders = occluders;
    this.shopPosition = SHOP_POSITION.clone();
    this.currentIndex = -1;
    this.activeDestination = null;
    this.hasPizza = false;
    this.completed = 0;
    this.createLandmarks();
  }

  createLandmarks() {
    const shopBase = new THREE.Mesh(
      new THREE.BoxGeometry(10, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0xc76b4d, roughness: 0.95 }),
    );
    shopBase.position.set(this.shopPosition.x, 2.5, this.shopPosition.z);
    shopBase.castShadow = true;
    shopBase.receiveShadow = true;
    this.scene.add(shopBase);
    this.occluders.push(shopBase);

    const shopRoof = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.6, 8.8),
      new THREE.MeshStandardMaterial({ color: 0x4b2c34, roughness: 0.85 }),
    );
    shopRoof.position.set(this.shopPosition.x, 5.2, this.shopPosition.z);
    shopRoof.castShadow = true;
    this.scene.add(shopRoof);
    this.occluders.push(shopRoof);

    const shopSign = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1, 0.3),
      new THREE.MeshStandardMaterial({
        color: 0xffd6a2,
        emissive: 0xf48a4a,
        emissiveIntensity: 1.1,
        roughness: 0.45,
      }),
    );
    shopSign.position.set(this.shopPosition.x, 4.4, this.shopPosition.z + 4.2);
    this.scene.add(shopSign);

    this.shopBeacon = createBeacon(0xffb366, 5.5, 0.2);
    this.shopBeacon.position.copy(this.shopPosition).add(new THREE.Vector3(0, 1.2, 0));
    this.scene.add(this.shopBeacon);

    this.destinationBeacon = createBeacon(0x9fe3ff, 8.5, 0.12);
    this.destinationBeacon.visible = false;
    this.scene.add(this.destinationBeacon);
  }

  update(playerPosition, interactPressed, elapsedTime) {
    this.shopBeacon.rotation.y = elapsedTime * 0.8;
    this.shopBeacon.position.y = 1.5 + Math.sin(elapsedTime * 1.7) * 0.18;

    if (this.activeDestination) {
      this.destinationBeacon.visible = true;
      this.destinationBeacon.rotation.y = elapsedTime;
      this.destinationBeacon.position.x = this.activeDestination.position.x;
      this.destinationBeacon.position.z = this.activeDestination.position.z;
      this.destinationBeacon.position.y = 1.8 + Math.sin(elapsedTime * 2.2) * 0.16;
    } else {
      this.destinationBeacon.visible = false;
    }

    const shopDistance = playerPosition.distanceTo(this.shopPosition);
    const destinationDistance = this.activeDestination
      ? playerPosition.distanceTo(this.activeDestination.position)
      : Infinity;

    let prompt = null;
    if (!this.hasPizza && shopDistance < 9) {
      prompt = 'Press E at the pizza shop to load the next order';
      if (interactPressed) {
        this.assignNextDelivery();
      }
    } else if (this.hasPizza && this.activeDestination && destinationDistance < 8) {
      prompt = `Press E to deliver to ${this.activeDestination.name}`;
      if (interactPressed) {
        this.completeDelivery();
      }
    } else if (this.hasPizza && this.activeDestination) {
      prompt = `Cruise to ${this.activeDestination.name} in ${this.activeDestination.district}`;
    } else {
      prompt = 'Explore freely or swing back by the pizza shop when you want another run';
    }

    return {
      prompt,
      hasPizza: this.hasPizza,
      completed: this.completed,
      destination: this.activeDestination,
      shopDistance,
      destinationDistance,
    };
  }

  assignNextDelivery() {
    this.currentIndex = (this.currentIndex + 1) % destinations.length;
    this.activeDestination = destinations[this.currentIndex];
    this.hasPizza = true;
  }

  completeDelivery() {
    this.hasPizza = false;
    this.completed += 1;
    this.activeDestination = null;
  }
}

function createBeacon(color, height, opacity) {
  const group = new THREE.Group();
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.6, height, 6, 1, true),
    new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity,
      emissive: color,
      emissiveIntensity: 0.65,
      side: THREE.DoubleSide,
    }),
  );
  pillar.position.y = height / 2;
  group.add(pillar);

  const cap = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.12, 8, 16),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 }),
  );
  cap.rotation.x = Math.PI / 2;
  cap.position.y = height;
  group.add(cap);

  return group;
}
