import * as THREE from 'three';

export class RemotePlayers {
  constructor(scene) {
    this.scene = scene;
    this.players = new Map();
  }

  update(remoteStates, delta) {
    const activeIds = new Set(remoteStates.map((state) => state.id));

    for (const state of remoteStates) {
      let remote = this.players.get(state.id);
      if (!remote) {
        remote = createRemoteCar(state);
        this.players.set(state.id, remote);
        this.scene.add(remote.group);
      }

      remote.targetPosition.set(state.position.x, state.position.y, state.position.z);
      remote.targetQuaternion.set(state.quaternion.x, state.quaternion.y, state.quaternion.z, state.quaternion.w);
      if (remote.nickname !== state.nickname || remote.hasPizza !== state.hasPizza) {
        remote.nickname = state.nickname;
        remote.hasPizza = state.hasPizza;
        remote.label.material.map?.dispose();
        remote.label.material.map = drawNameTag(state.nickname, state.hasPizza);
        remote.label.material.needsUpdate = true;
      }
    }

    for (const [id, remote] of this.players.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(remote.group);
        disposeSprite(remote.label);
        this.players.delete(id);
        continue;
      }

      const blend = 1 - Math.exp(-delta * 8);
      remote.group.position.lerp(remote.targetPosition, blend);
      remote.group.quaternion.slerp(remote.targetQuaternion, blend);
      remote.label.position.copy(remote.group.position).add(new THREE.Vector3(0, 3.1, 0));
    }
  }
}

function createRemoteCar(state) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.7, 4.4),
    new THREE.MeshStandardMaterial({ color: 0x79a6c3, roughness: 0.72 }),
  );
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.8, 2.1),
    new THREE.MeshStandardMaterial({ color: 0xe7dcc4, roughness: 0.9 }),
  );
  cabin.position.set(0, 1.02, -0.1);
  cabin.castShadow = true;
  group.add(cabin);

  group.position.set(state.position.x, state.position.y, state.position.z);
  group.quaternion.set(state.quaternion.x, state.quaternion.y, state.quaternion.z, state.quaternion.w);

  const labelTexture = drawNameTag(state.nickname, state.hasPizza);
  const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
  const label = new THREE.Sprite(labelMaterial);
  label.scale.set(6.4, 1.5, 1);
  label.position.set(0, 3.1, 0);
  group.add(label);

  return {
    group,
    label,
    nickname: state.nickname,
    hasPizza: state.hasPizza,
    targetPosition: new THREE.Vector3(state.position.x, state.position.y, state.position.z),
    targetQuaternion: new THREE.Quaternion(
      state.quaternion.x,
      state.quaternion.y,
      state.quaternion.z,
      state.quaternion.w,
    ),
  };
}

function drawNameTag(name, hasPizza) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d');

  context.fillStyle = hasPizza ? '#f48a4a' : '#162131';
  context.globalAlpha = 0.9;
  context.beginPath();
  context.roundRect(8, 8, 240, 48, 18);
  context.fill();

  context.globalAlpha = 1;
  context.fillStyle = '#f7efe4';
  context.font = '600 24px Trebuchet MS';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(name, 128, 34);

  return new THREE.CanvasTexture(canvas);
}

function disposeSprite(label) {
  label.material.map?.dispose();
  label.material.dispose();
}
