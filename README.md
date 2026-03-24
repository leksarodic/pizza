# Pizza Afterglow

Pizza Afterglow is a calm 3D browser game prototype about casually driving a pizza car through a stylized evening city. Deliveries are there to gently guide exploration, not to create pressure. You can ignore the next order for a while, take the scenic route, and just enjoy the shared city atmosphere.

## MVP features

- Third-person arcade-style car driving with forgiving handling
- Medium-sized city with multiple districts:
  - downtown blocks
  - residential neighborhood
  - central park
  - waterfront promenade
  - industrial yard
  - hilltop overlook
- Pizza shop hub with optional pickup and delivery loop
- Simple destination beacons and on-screen guidance
- Lightweight WebRTC multiplayer presence with visible remote cars and player labels
- Calm start menu, pause menu, HUD, and reset action
- Static Vite build configured for GitHub Pages deployment

## Tech stack

- Vite for local development and static production builds
- Three.js for rendering
- Yjs + `y-webrtc` for lightweight browser-to-browser room sync
- Vanilla ES modules with a modular feature layout

## Project structure

- `src/core/` bootstrap, config, main app loop
- `src/world/` city layout, districts, props, landmarks
- `src/player/` local input, car controller, follow camera
- `src/delivery/` pizza hub and delivery progression
- `src/network/` multiplayer room sync and remote player smoothing
- `src/ui/` HUD and menu overlays

## Crafting the world yourself

The main file for hand-authoring the city is [`src/world/worldBlueprint.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/worldBlueprint.js).

That file is meant to be your editable city sheet:

- add or resize roads in `WORLD_BLUEPRINT.roads`
- place new buildings in `WORLD_BLUEPRINT.buildingPlots`
- add custom pizza places in `WORLD_BLUEPRINT.pizzaPlaces`
- add delivery points in `WORLD_BLUEPRINT.deliveryDestinations`
- place lamps, benches, trees, parked cars, and fences in the prop arrays
- add ad boards in `WORLD_BLUEPRINT.billboards`

For image ads later:

1. Put the image inside `public/ads/`
2. Set `image: '/ads/your-file.png'` on a billboard in the blueprint

The renderer in [`src/world/CityWorld.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/CityWorld.js) now reads from that blueprint instead of hardcoding most city content directly.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Start the local dev server:

```bash
npm run dev
```

3. Build the static production bundle:

```bash
npm run build
```

4. Preview the production build locally if needed:

```bash
npm run preview
```

## Controls

- `W` / `ArrowUp`: accelerate
- `S` / `ArrowDown`: brake or reverse
- `A` / `ArrowLeft`: steer left
- `D` / `ArrowRight`: steer right
- `E`: pick up or deliver pizza when near an interaction point
- `R`: reset the car to the pizza shop if you get stuck
- `Esc`: pause or resume

## How the delivery loop works

- Start near the pizza shop in the downtown district.
- Drive close to the glowing pizza shop beacon and press `E` to load an order.
- Follow the destination marker to a home, kiosk, office, or scenic stop.
- Press `E` again when you arrive to complete the delivery.
- After delivery, the city stays open. You can head back for another order whenever you want.

There is no timer, no score pressure, and no fail state for taking the long way around.

## Multiplayer architecture

The MVP uses `y-webrtc`, which creates a lightweight WebRTC room directly from the browser while relying on public signaling servers for peer discovery. This keeps the project deployable as static files on GitHub Pages.

### Current behavior

- Players in the same room automatically appear to each other.
- Each player broadcasts:
  - nickname
  - car position
  - car rotation
  - current district
  - whether a pizza is loaded
- Remote cars are smoothed client-side with interpolation.
- The default room is `afterglow-main`.
- You can join a different session with a query string such as:

```text
?room=late-night-block
```

### Tradeoffs

- This is not authoritative multiplayer. Each client owns its own motion.
- Public signaling makes the prototype easy to ship, but it is less controllable than a custom service.
- Peer-to-peer connectivity may behave differently across strict NATs or restrictive networks.
- GitHub Pages can host the game, but it does not host signaling or relay infrastructure.

### Upgrade path

If the project grows beyond MVP, the next steps would be:

- move signaling to a managed service you control
- add room/lobby UI instead of query-string rooms
- sync lightweight delivery state per player
- add reconciliation or a thin authoritative server for shared interactions

## GitHub Pages deployment

The repository includes a workflow at [`.github/workflows/deploy.yml`](/Users/leksarodic/Documents/Aleksa/AI/pizza/.github/workflows/deploy.yml) that builds and deploys the static site whenever code is pushed to `main`.

### Repository settings required

1. Open GitHub repository settings.
2. Go to `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main` or manually run the workflow.

### Pages base path

[`vite.config.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/vite.config.js) automatically uses the repository name as the base path when the GitHub Actions environment is building the app, so static assets resolve correctly under the repository subpath.

## Development log

- `docs: add AGENTS.md workflow rules`
- `chore: initialize project scaffold`
- `feat: add third-person car controller`
- `feat: create pizza shop interaction`
- `feat: add basic webRTC multiplayer sync`
- `feat: add calm start and pause menus`
- `chore: install frontend dependencies`
- `ci: add GitHub Pages deployment workflow`

## Expanding the project later

### Add more map content

- Extend [`src/world/CityWorld.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/CityWorld.js) with new road meshes, landmarks, and district props.
- Add new district ranges in the district definitions so the HUD reflects new areas.
- Create more destination points in [`src/delivery/DeliveryManager.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/delivery/DeliveryManager.js).

### Improve the driving model

- Add suspension feel visually without switching to heavy physics.
- Add gamepad axes in [`src/player/InputController.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/player/InputController.js).
- Add curb, wall, or traffic-calming collision proxies if the city needs stronger road boundaries.
- Move the current arcade controller into a tunable config file for per-surface handling.

### Improve multiplayer

- Show room selection in the start menu.
- Sync emotes, headlights, or lightweight delivery states.
- Add connection quality feedback and reconnection UI.
- Move from public WebRTC signaling to a dedicated service when reliability matters more than zero-backend simplicity.
