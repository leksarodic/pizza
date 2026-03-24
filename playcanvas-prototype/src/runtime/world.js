import * as pc from 'playcanvas';

export function createPrototypeWorld(app) {
  app.scene.ambientLight = new pc.Color(0.27, 0.29, 0.38);

  const camera = new pc.Entity('camera');
  camera.addComponent('camera', {
    clearColor: new pc.Color(0.14, 0.22, 0.36),
    farClip: 500,
    fov: 55,
  });
  camera.setPosition(0, 14, 24);
  camera.lookAt(0, 0, 0);
  app.root.addChild(camera);

  const sun = new pc.Entity('sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.84, 0.7),
    intensity: 2.2,
    castShadows: true,
    shadowDistance: 120,
    shadowResolution: 1024,
  });
  sun.setEulerAngles(45, 35, 0);
  app.root.addChild(sun);

  const fill = new pc.Entity('fill');
  fill.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.45, 0.58, 0.95),
    intensity: 0.45,
  });
  fill.setEulerAngles(25, -120, 0);
  app.root.addChild(fill);

  const ground = createBox(app, {
    position: new pc.Vec3(0, -0.05, 0),
    scale: new pc.Vec3(180, 0.1, 180),
    color: new pc.Color(0.28, 0.42, 0.31),
  });
  app.root.addChild(ground);

  const boulevard = createBox(app, {
    position: new pc.Vec3(0, 0.01, 0),
    scale: new pc.Vec3(16, 0.04, 170),
    color: new pc.Color(0.16, 0.17, 0.2),
  });
  app.root.addChild(boulevard);

  const crossStreet = createBox(app, {
    position: new pc.Vec3(0, 0.02, 42),
    scale: new pc.Vec3(120, 0.04, 16),
    color: new pc.Color(0.16, 0.17, 0.2),
  });
  app.root.addChild(crossStreet);

  for (const x of [-34, -16, 16, 34]) {
    const block = createBox(app, {
      position: new pc.Vec3(x, 5, 58),
      scale: new pc.Vec3(10, 10 + Math.abs(x) * 0.1, 10),
      color: new pc.Color(0.79, 0.49, 0.34),
    });
    app.root.addChild(block);
  }

  for (const [x, z] of [[-48, -40], [-38, -62], [46, -32], [58, -58]]) {
    const home = createBox(app, {
      position: new pc.Vec3(x, 2.6, z),
      scale: new pc.Vec3(9, 5.2, 8),
      color: new pc.Color(0.86, 0.74, 0.6),
    });
    app.root.addChild(home);
  }

  const pizzaShop = createBox(app, {
    position: new pc.Vec3(0, 2.6, 72),
    scale: new pc.Vec3(12, 5.2, 9),
    color: new pc.Color(0.79, 0.42, 0.31),
  });
  app.root.addChild(pizzaShop);

  const car = createCar(app);
  app.root.addChild(car);

  const marker = createMarker(app);
  marker.setPosition(0, 0.6, 72);
  app.root.addChild(marker);

  let angle = 0;
  app.on('update', (dt) => {
    angle += dt;
    marker.setEulerAngles(0, angle * 50, 0);
    marker.setPosition(0, 0.7 + Math.sin(angle * 2) * 0.12, 72);
  });
}

function createBox(app, { position, scale, color }) {
  const entity = new pc.Entity();
  entity.addComponent('render', {
    type: 'box',
    castShadows: true,
    receiveShadows: true,
  });
  entity.setPosition(position);
  entity.setLocalScale(scale);
  entity.render.material = createMaterial(app, color);
  return entity;
}

function createCar(app) {
  const root = new pc.Entity('car');
  root.setPosition(0, 0.45, 56);

  const body = createBox(app, {
    position: new pc.Vec3(0, 0.5, 0),
    scale: new pc.Vec3(2.4, 0.8, 4.8),
    color: new pc.Color(0.86, 0.43, 0.24),
  });
  root.addChild(body);

  const cabin = createBox(app, {
    position: new pc.Vec3(0, 1.05, -0.1),
    scale: new pc.Vec3(1.8, 0.9, 2.2),
    color: new pc.Color(0.96, 0.9, 0.78),
  });
  root.addChild(cabin);

  return root;
}

function createMarker(app) {
  const marker = new pc.Entity('marker');
  marker.addComponent('render', {
    type: 'cylinder',
    castShadows: false,
    receiveShadows: false,
  });
  marker.setLocalScale(1.4, 4.5, 1.4);
  marker.render.material = createMaterial(app, new pc.Color(1, 0.72, 0.38), true);
  return marker;
}

function createMaterial(app, color, emissive = false) {
  const material = new pc.StandardMaterial();
  material.diffuse = color;
  material.roughness = 0.82;

  if (emissive) {
    material.emissive = color;
    material.emissiveIntensity = 0.6;
    material.opacity = 0.7;
    material.blendType = pc.BLEND_NORMAL;
  }

  material.update();
  return material;
}
