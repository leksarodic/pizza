import * as pc from 'playcanvas';
import { createPrototypeWorld } from './world.js';

export function bootstrapPlayCanvas(container) {
  const shell = document.createElement('div');
  shell.className = 'prototype-shell';

  const canvas = document.createElement('canvas');
  shell.append(canvas);
  container.append(shell);

  const overlay = document.createElement('div');
  overlay.className = 'prototype-overlay';
  overlay.innerHTML = `
    <section class="prototype-card">
      <p class="prototype-kicker">PlayCanvas Track</p>
      <h1 class="prototype-title">Fresh browser-first prototype scaffold</h1>
      <p class="prototype-copy">
        This branch hosts a parallel PlayCanvas experiment for Pizza Afterglow,
        so we can evaluate the engine without disrupting the main Three.js game.
      </p>
    </section>
    <section class="prototype-status">
      <p class="prototype-pill">PlayCanvas app booted</p>
      <p class="prototype-pill">Next: input, camera, delivery loop, multiplayer</p>
    </section>
  `;
  shell.append(overlay);

  const app = new pc.Application(canvas, {
    graphicsDeviceOptions: {
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: false,
    },
    mouse: new pc.Mouse(canvas),
    touch: new pc.TouchDevice(canvas),
  });

  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  app.scene.toneMapping = pc.TONEMAP_ACES;
  app.scene.gammaCorrection = pc.GAMMA_SRGB;
  app.scene.skyboxIntensity = 1;
  app.scene.exposure = 1.05;
  app.start();

  const resize = () => app.resizeCanvas();
  window.addEventListener('resize', resize);

  createPrototypeWorld(app);
}
