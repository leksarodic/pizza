import * as THREE from 'three';

const palettes = {
  apartments: [0xdc7850, 0xc0534e, 0xc79e62, 0x7f90ab, 0xe29b67],
  houses: [0xe7c39d, 0xd98558, 0x95ad8e, 0xcd6e62, 0xb5c8d3],
  industrial: [0x878f94, 0xa16e4b, 0x5f6c74, 0x7a6f65],
  towers: [0x8698a7, 0xbe7f62, 0xd7a96a],
};

export const WORLD_BLUEPRINT = {
  spawnPoint: { x: 0, y: 0.35, z: 92 },
  districts: [
    { name: 'Hilltop', minX: -160, maxX: -40, minZ: 55, maxZ: 160 },
    { name: 'Downtown', minX: -40, maxX: 46, minZ: 36, maxZ: 150 },
    { name: 'Waterfront', minX: 46, maxX: 160, minZ: 24, maxZ: 160 },
    { name: 'Old Town', minX: -160, maxX: -30, minZ: -18, maxZ: 55 },
    { name: 'Central Park', minX: -30, maxX: 35, minZ: -10, maxZ: 45 },
    { name: 'Market Street', minX: 35, maxX: 160, minZ: -10, maxZ: 55 },
    { name: 'Residential', minX: -160, maxX: 34, minZ: -160, maxZ: -18 },
    { name: 'Industry', minX: 34, maxX: 160, minZ: -160, maxZ: -10 },
  ],
  roads: [
    { x: 0, z: 0, width: 18, depth: 300 },
    { x: -72, z: 0, width: 16, depth: 300 },
    { x: 72, z: 0, width: 16, depth: 300 },
    { x: 0, z: 84, width: 300, depth: 18 },
    { x: 0, z: 12, width: 300, depth: 18 },
    { x: 0, z: -72, width: 300, depth: 18 },
    { x: -92, z: -30, width: 82, depth: 12 },
    { x: 92, z: -100, width: 78, depth: 12 },
    { x: -108, z: 104, width: 60, depth: 10 },
    { x: 118, z: 64, width: 62, depth: 10 },
    { x: -118, z: 34, width: 46, depth: 10 },
  ],
  buildingPlots: [
    ...createGrid([-20, 20], [44, 140], 5, 6, palettes.towers, { width: 9, depth: 9, minHeight: 12, maxHeight: 26 }),
    ...createGrid([-136, -24], [-140, -28], 4, 4, palettes.houses, { width: 12, depth: 10, minHeight: 4, maxHeight: 7 }),
    ...createGrid([-136, -84], [70, 138], 3, 4, palettes.houses, { width: 11, depth: 10, minHeight: 4, maxHeight: 8 }),
    ...createGrid([-144, -84], [-6, 42], 3, 3, palettes.houses, { width: 10, depth: 10, minHeight: 5, maxHeight: 8 }),
    ...createGrid([44, 136], [-140, -26], 5, 4, palettes.industrial, { width: 13, depth: 13, minHeight: 6, maxHeight: 11 }),
    ...createGrid([52, 138], [22, 54], 4, 2, palettes.apartments, { width: 11, depth: 11, minHeight: 6, maxHeight: 14 }),
    ...createGrid([82, 134], [68, 134], 3, 4, palettes.apartments, { width: 12, depth: 12, minHeight: 8, maxHeight: 16 }),
    ...createGrid([-58, -30], [74, 132], 2, 4, palettes.apartments, { width: 8, depth: 8, minHeight: 7, maxHeight: 15 }),
  ],
  specialBuildings: [
    {
      kind: 'gasStation',
      base: { x: 72, z: -12, width: 10, height: 3, depth: 7, color: 0xe4d2ba },
      canopy: { x: 86, z: -12, width: 16, height: 0.6, depth: 10, color: 0xcb634e },
      pumps: [{ x: 82, z: -12 }, { x: 90, z: -12 }],
    },
    {
      kind: 'warehouseRow',
      units: [
        { x: 84, z: -78, width: 14, height: 6, depth: 10, color: 0x7b8087 },
        { x: 99, z: -78, width: 14, height: 7, depth: 10, color: 0x7b8087 },
        { x: 114, z: -78, width: 14, height: 8, depth: 10, color: 0x7b8087 },
        { x: 129, z: -78, width: 14, height: 9, depth: 10, color: 0x7b8087 },
      ],
    },
  ],
  plazas: [
    { x: 0, z: 48, radius: 9, sculpture: true },
  ],
  water: {
    river: { x: 102, z: 18, width: 100, depth: 248 },
    promenade: { x: 52, z: 18, width: 14, depth: 228 },
    piers: [
      { x: 62, z: 76 }, { x: 62, z: 50 }, { x: 62, z: 24 }, { x: 62, z: -2 }, { x: 62, z: -28 },
    ],
  },
  parks: [
    { x: 2, z: 15, width: 56, depth: 46, color: 0x5d8452 },
  ],
  hills: [
    { x: -104, z: 112, radiusTop: 34, radiusBottom: 48, height: 18, topPadRadius: 12 },
  ],
  streetlights: [
    [0, 62], [0, 108], [72, -40], [72, 34], [-72, -40], [-72, 28], [48, 94], [-48, 94],
    [72, 94], [72, 136], [-108, 104], [-118, -70], [118, -104], [52, 14], [-40, 12],
  ],
  benches: [
    [52, 86], [52, 92], [-16, 8], [16, 8], [-104, 112], [4, 48], [-6, 48],
  ],
  parkedCars: [
    [-86, -68], [-60, -90], [88, -118], [114, -84], [70, 40], [-74, 94], [90, 18], [-116, 34], [18, 118], [-12, 122],
  ],
  trees: [
    { xs: [-20, -4, 12, 26], zs: [2, 18, 30], color: 0x4a734d },
    { xs: [-130, -116, -102, -88], zs: [-134, -116, -94], color: 0x4d7448 },
    { xs: [52, 64, 78], zs: [98, 120, 140], color: 0x537c56 },
  ],
  signs: [
    [0, 84], [72, 12], [-72, -72], [72, -72], [52, 108], [-108, 104], [118, -98],
  ],
  trashBins: [
    [-10, 38], [10, 38], [54, 42], [74, -14], [-94, -38],
  ],
  fences: [
    { x: 44, minZ: -120, maxZ: 124 },
  ],
  crosswalks: [
    { x: 0, z: 84, width: 8, depth: 18, horizontal: true },
    { x: 72, z: 12, width: 8, depth: 16, horizontal: true },
    { x: -72, z: -72, width: 8, depth: 16, horizontal: true },
  ],
  pizzaPlaces: [
    {
      id: 'downtown-shop',
      name: 'Afterglow Pizza',
      x: 0,
      y: 0,
      z: 92,
      width: 10,
      height: 5,
      depth: 8,
      color: 0xc76b4d,
      roofColor: 0x4b2c34,
      signColor: 0xffd6a2,
    },
  ],
  deliveryDestinations: [
    { name: 'Riverside Loft', district: 'Waterfront', position: { x: 68, y: 0, z: 86 } },
    { name: 'Maple Court', district: 'Residential', position: { x: -104, y: 0, z: -72 } },
    { name: 'Foundry Office', district: 'Industry', position: { x: 90, y: 0, z: -108 } },
    { name: 'Hilltop Overlook', district: 'Hilltop', position: { x: -104, y: 0, z: 112 } },
    { name: 'Park Kiosk', district: 'Central Park', position: { x: 18, y: 0, z: 10 } },
  ],
  billboards: [
    {
      x: 56,
      y: 7,
      z: 40,
      width: 7,
      height: 3.6,
      postHeight: 4.5,
      color: 0xf3c26b,
      text: 'HOT SLICE',
      image: '',
    },
    {
      x: -86,
      y: 6.5,
      z: 22,
      width: 6,
      height: 3,
      postHeight: 4,
      color: 0x98b8c9,
      text: 'CITY FM',
      image: '',
    },
  ],
};

export const WORLD_BLUEPRINT_NOTES = `
Edit this file to craft your city by hand.

Useful sections:
- roads: add or resize driveable streets
- buildingPlots: add simple buildings quickly
- specialBuildings: hand-place better landmarks like gas stations or warehouses
- streetlights, benches, trees, parkedCars: add more world props
- pizzaPlaces: add more pizza shops or change the main hub
- deliveryDestinations: add homes, offices, or shops for pizza runs
- billboards: add ads; set image to a local asset path later if you want textured signs

Example billboard image path:
- image: '/ads/pizza-night.png'
Put the image inside public/ads/ and it will be available in the build.
`;

function createGrid([minX, maxX], [minZ, maxZ], countX, countZ, palette, dimensions) {
  const blocks = [];
  const stepX = (maxX - minX) / Math.max(1, countX - 1);
  const stepZ = (maxZ - minZ) / Math.max(1, countZ - 1);

  for (let ix = 0; ix < countX; ix += 1) {
    for (let iz = 0; iz < countZ; iz += 1) {
      blocks.push({
        x: minX + stepX * ix,
        z: minZ + stepZ * iz,
        width: dimensions.width,
        depth: dimensions.depth,
        height: dimensions.minHeight + ((ix * 2 + iz) % (dimensions.maxHeight - dimensions.minHeight + 1)),
        color: palette[(ix + iz) % palette.length],
      });
    }
  }

  return blocks;
}

export function vectorFrom(position) {
  return new THREE.Vector3(position.x, position.y ?? 0, position.z);
}
