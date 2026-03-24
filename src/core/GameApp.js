import * as THREE from 'three';
import { CAMERA_FOV, SKY_COLORS } from './config.js';
import { CityWorld } from '../world/CityWorld.js';
import { InputController } from '../player/InputController.js';
import { CarController } from '../player/CarController.js';
import { FollowCamera } from '../player/FollowCamera.js';
import { GameHud } from '../ui/GameHud.js';
import { DeliveryManager } from '../delivery/DeliveryManager.js';
import { MultiplayerClient } from '../network/MultiplayerClient.js';
import { RemotePlayers } from '../network/RemotePlayers.js';

export class GameApp {
  constructor(container) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      400,
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.resizeHandler = () => this.onResize();
    this.input = new InputController();
  }

  start() {
    this.setupRenderer();
    this.setupScene();
    this.setupGameplay();
    this.onResize();
    window.addEventListener('resize', this.resizeHandler);
    this.renderer.setAnimationLoop(() => this.update());
  }

  setupRenderer() {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.className = 'game-canvas';

    const shell = document.createElement('div');
    shell.className = 'game-shell';
    shell.append(this.renderer.domElement);
    this.shell = shell;
    this.container.append(shell);
  }

  setupScene() {
    this.scene.background = new THREE.Color(SKY_COLORS.middle);
    this.scene.fog = new THREE.Fog(SKY_COLORS.top, 70, 240);

    const hemiLight = new THREE.HemisphereLight(SKY_COLORS.bottom, 0x182238, 1.9);
    this.scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffd6a8, 2);
    sun.position.set(32, 36, 24);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(1024);
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    this.scene.add(sun);
  }

  setupGameplay() {
    this.world = new CityWorld(this.scene);
    this.world.build();

    this.player = new CarController();
    this.scene.add(this.player.group);

    this.followCamera = new FollowCamera(this.camera, this.player.group);
    this.followCamera.snap();
    this.delivery = new DeliveryManager(this.scene);
    this.multiplayer = new MultiplayerClient();
    this.remotePlayers = new RemotePlayers(this.scene);

    this.hud = new GameHud(this.shell);
    this.hud.setStatus({
      detail: 'Pick up deliveries when you want them, or just wander through the districts at your own pace.',
    });
  }

  update() {
    const delta = Math.min(this.clock.getDelta(), 1 / 20);
    const elapsed = this.clock.getElapsedTime();
    const inputState = this.input.getState();

    if (inputState.reset) {
      this.player.reset(this.world.getSpawnPoint());
      this.followCamera.snap();
    }

    this.player.update(delta, inputState, this.world);
    this.followCamera.update(delta);
    const telemetry = this.player.getTelemetry();
    const deliveryState = this.delivery.update(telemetry.position, inputState.interact, elapsed);
    this.multiplayer.updateLocalState({
      position: {
        x: telemetry.position.x,
        y: telemetry.position.y,
        z: telemetry.position.z,
      },
      quaternion: {
        x: this.player.group.quaternion.x,
        y: this.player.group.quaternion.y,
        z: this.player.group.quaternion.z,
        w: this.player.group.quaternion.w,
      },
      district: telemetry.district,
      hasPizza: deliveryState.hasPizza,
    }, elapsed);
    this.remotePlayers.update(this.multiplayer.getRemoteStates(), delta);
    this.hud.setTelemetry(telemetry);
    this.hud.setDeliveryState(deliveryState);
    this.hud.setPresenceState(this.multiplayer.getPresenceSummary());
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
