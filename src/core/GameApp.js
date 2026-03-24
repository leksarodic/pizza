import * as THREE from 'three';
import { CAMERA_FOV, SKY_BOTTOM, SKY_TOP } from './config.js';

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
  }

  start() {
    this.setupRenderer();
    this.setupScene();
    this.mountUi();
    this.onResize();
    window.addEventListener('resize', this.resizeHandler);
    this.renderer.setAnimationLoop(() => this.update());
  }

  setupRenderer() {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.domElement.className = 'game-canvas';

    const shell = document.createElement('div');
    shell.className = 'game-shell';
    shell.append(this.renderer.domElement);
    this.shell = shell;
    this.container.append(shell);
  }

  setupScene() {
    this.scene.fog = new THREE.Fog(SKY_TOP, 60, 220);

    const hemiLight = new THREE.HemisphereLight(SKY_BOTTOM, 0x1f2440, 1.8);
    this.scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffd6a8, 2);
    sun.position.set(24, 34, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(1024);
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    this.scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x2c4d37 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const blockMaterial = new THREE.MeshStandardMaterial({ color: 0xc86f4f });
    for (let x = -2; x <= 2; x += 1) {
      for (let z = -2; z <= 2; z += 1) {
        if ((x + z) % 2 === 0) {
          continue;
        }

        const block = new THREE.Mesh(
          new THREE.BoxGeometry(8, 6 + Math.abs(x * z), 8),
          blockMaterial,
        );
        block.position.set(x * 14, block.scale.y * 0.5, z * 14);
        block.castShadow = true;
        block.receiveShadow = true;
        this.scene.add(block);
      }
    }

    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.1, 4.8),
      new THREE.MeshStandardMaterial({ color: 0xf3b34d }),
    );
    marker.position.set(0, 0.7, 20);
    marker.castShadow = true;
    this.scene.add(marker);
    this.marker = marker;

    this.camera.position.set(0, 16, 28);
    this.camera.lookAt(0, 0, 0);
  }

  mountUi() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <section class="panel">
        <h1>Pizza Afterglow</h1>
        <p>
          Calm city-driving prototype scaffold. Next phases add the explorable map,
          pizza delivery loop, and lightweight shared-city multiplayer.
        </p>
      </section>
      <div class="status-pill">Scaffold ready</div>
    `;

    this.shell.append(overlay);
  }

  update() {
    const elapsed = this.clock.getElapsedTime();
    this.marker.position.y = 0.8 + Math.sin(elapsed * 2) * 0.15;
    this.marker.rotation.y = elapsed * 0.8;
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
