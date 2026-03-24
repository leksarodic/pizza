import * as THREE from 'three';
import { CAR_SETTINGS } from '../core/config.js';

const UP = new THREE.Vector3(0, 1, 0);

export class CarController {
  constructor() {
    this.group = buildCarMesh();
    this.velocity = new THREE.Vector3();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.lateral = new THREE.Vector3();
    this.spawnPoint = new THREE.Vector3(0, 0.35, 92);
    this.heading = Math.PI;
    this.reset(this.spawnPoint);
  }

  update(delta, input, world) {
    const forward = this.forward.set(0, 0, 1).applyAxisAngle(UP, this.heading);
    const planarVelocity = new THREE.Vector3(this.velocity.x, 0, this.velocity.z);
    const signedSpeed = planarVelocity.dot(forward);
    const movingBackward = signedSpeed < -0.4;

    let acceleration = 0;
    if (input.accelerate) {
      acceleration += CAR_SETTINGS.acceleration;
    }
    if (input.brake) {
      acceleration -= movingBackward ? CAR_SETTINGS.acceleration : CAR_SETTINGS.braking;
    }

    planarVelocity.addScaledVector(forward, acceleration * delta);

    const dragFactor = Math.max(0, 1 - CAR_SETTINGS.drag * delta);
    planarVelocity.multiplyScalar(dragFactor);

    const speedRatio = THREE.MathUtils.clamp(Math.abs(signedSpeed) / CAR_SETTINGS.maxForwardSpeed, 0, 1);
    const steerIntensity = THREE.MathUtils.lerp(1.35, 0.7, speedRatio);
    const steerDirection = movingBackward ? -1 : 1;
    const steeringAmount = input.steer * CAR_SETTINGS.steerRate * steerIntensity * steerDirection;
    if (Math.abs(signedSpeed) > 0.4 || Math.abs(acceleration) > 0.1) {
      this.heading -= steeringAmount * delta;
    }

    const lateral = this.lateral.set(forward.z, 0, -forward.x);
    const sidewaysSpeed = planarVelocity.dot(lateral);
    planarVelocity.addScaledVector(lateral, -sidewaysSpeed * Math.min(1, CAR_SETTINGS.grip * delta));

    const forwardSpeed = THREE.MathUtils.clamp(
      planarVelocity.dot(forward),
      -CAR_SETTINGS.maxReverseSpeed,
      CAR_SETTINGS.maxForwardSpeed,
    );
    const sidewaysRetained = planarVelocity.dot(lateral);
    planarVelocity.copy(forward.multiplyScalar(forwardSpeed)).addScaledVector(lateral, sidewaysRetained);

    this.velocity.set(planarVelocity.x, 0, planarVelocity.z);
    this.group.position.addScaledVector(this.velocity, delta);
    this.group.position.y = 0.35;

    world.constrainPosition(this.group.position);
    this.group.quaternion.setFromAxisAngle(UP, this.heading);

    this.telemetry = {
      speedKmh: Math.round(this.velocity.length() * 7.2),
      district: world.getDistrictName(this.group.position),
      position: this.group.position.clone(),
    };
  }

  reset(spawnPoint = this.spawnPoint) {
    this.group.position.copy(spawnPoint);
    this.heading = Math.PI;
    this.group.rotation.set(0, 0, 0);
    this.group.quaternion.setFromAxisAngle(UP, this.heading);
    this.velocity.set(0, 0, 0);
  }

  getTelemetry() {
    return this.telemetry ?? {
      speedKmh: 0,
      district: 'Downtown',
      position: this.group.position.clone(),
    };
  }
}

function buildCarMesh() {
  const car = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xdf6d3e, roughness: 0.72 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xf8e7c1, roughness: 0.85 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x263244, roughness: 0.45 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 4.6), bodyMaterial);
  base.position.y = 0.55;
  base.castShadow = true;
  car.add(base);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 2.2), trimMaterial);
  cabin.position.set(0, 1.08, -0.1);
  cabin.castShadow = true;
  car.add(cabin);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.5, 1.2), darkMaterial);
  windshield.position.set(0, 1.08, 0.2);
  windshield.castShadow = true;
  car.add(windshield);

  const pizzaBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 1.1), trimMaterial);
  pizzaBox.position.set(0, 1.52, -0.05);
  pizzaBox.castShadow = true;
  car.add(pizzaBox);

  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1b22, roughness: 0.9 });
  const wheelOffsets = [
    [-1.1, 0.28, -1.45],
    [1.1, 0.28, -1.45],
    [-1.1, 0.28, 1.45],
    [1.1, 0.28, 1.45],
  ];

  for (const [x, y, z] of wheelOffsets) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.4, 16), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    car.add(wheel);
  }

  return car;
}
