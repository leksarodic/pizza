import * as THREE from 'three';

const CAMERA_OFFSET = new THREE.Vector3(0, 8.5, -15.5);
const LOOK_OFFSET = new THREE.Vector3(0, 2.1, 7.5);
const RAY_DIRECTION = new THREE.Vector3();

export class FollowCamera {
  constructor(camera, target, occluders = []) {
    this.camera = camera;
    this.target = target;
    this.occluders = occluders;
    this.currentPosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.desiredPosition = new THREE.Vector3();
    this.desiredLook = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
  }

  update(delta) {
    this.computeAnchors();

    const blend = 1 - Math.exp(-delta * 4.5);
    this.currentPosition.lerp(this.desiredPosition, blend);
    this.lookTarget.lerp(this.desiredLook, blend);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.lookTarget);
  }

  snap() {
    this.computeAnchors();
    this.currentPosition.copy(this.desiredPosition);
    this.lookTarget.copy(this.desiredLook);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.lookTarget);
  }

  computeAnchors() {
    this.desiredLook.copy(LOOK_OFFSET).applyQuaternion(this.target.quaternion).add(this.target.position);

    const rawPosition = CAMERA_OFFSET.clone().applyQuaternion(this.target.quaternion).add(this.target.position);
    RAY_DIRECTION.subVectors(rawPosition, this.desiredLook);
    const distance = RAY_DIRECTION.length();
    RAY_DIRECTION.normalize();

    this.raycaster.set(this.desiredLook, RAY_DIRECTION);
    this.raycaster.far = distance;
    const hit = this.occluders.length > 0
      ? this.raycaster.intersectObjects(this.occluders, true)[0]
      : null;

    if (hit) {
      this.desiredPosition.copy(hit.point).addScaledVector(RAY_DIRECTION, -0.8);
      this.desiredPosition.y = Math.max(this.desiredPosition.y, this.target.position.y + 3.8);
    } else {
      this.desiredPosition.copy(rawPosition);
    }
  }
}
