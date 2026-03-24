import * as THREE from 'three';

const CAMERA_OFFSET = new THREE.Vector3(0, 5.6, -10.5);
const LOOK_OFFSET = new THREE.Vector3(0, 1.2, 5.2);

export class FollowCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.currentPosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
  }

  update(delta) {
    const desiredPosition = CAMERA_OFFSET.clone().applyQuaternion(this.target.quaternion).add(this.target.position);
    const desiredLook = LOOK_OFFSET.clone().applyQuaternion(this.target.quaternion).add(this.target.position);

    const blend = 1 - Math.exp(-delta * 4.5);
    this.currentPosition.lerp(desiredPosition, blend);
    this.lookTarget.lerp(desiredLook, blend);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.lookTarget);
  }

  snap() {
    this.currentPosition.copy(
      CAMERA_OFFSET.clone().applyQuaternion(this.target.quaternion).add(this.target.position),
    );
    this.lookTarget.copy(
      LOOK_OFFSET.clone().applyQuaternion(this.target.quaternion).add(this.target.position),
    );
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.lookTarget);
  }
}
