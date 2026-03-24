# Pizza Afterglow

Pizza Afterglow is a calm 3D browser game prototype about driving a small pizza car through a stylized evening city. The goal is not speed or pressure. You can cruise, explore, pick up a pizza when you feel like it, and share the city with a few other players.

## What is in the prototype

- Third-person arcade driving with a forgiving camera
- Open city with downtown, residential streets, park, waterfront, industrial area, and hilltop
- Optional pizza pickup and delivery loop with no timer
- Lightweight browser multiplayer presence
- Calm start menu, pause menu, HUD, and reset action
- Static frontend build that works with GitHub Pages

## Quickstart

### Requirements

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173/
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

The preview server will print a local URL in the terminal.

## Controls

- `W` / `ArrowUp`: accelerate
- `S` / `ArrowDown`: brake or reverse
- `A` / `ArrowLeft`: steer left
- `D` / `ArrowRight`: steer right
- `E`: pick up or deliver pizza when near an interaction point
- `R`: reset the car to the pizza shop if you get stuck
- `Esc`: pause or resume

## How to play

1. Start the game from the menu.
2. Drive around freely or head to the pizza shop in downtown.
3. Press `E` near the pizza shop beacon to load a delivery.
4. Follow the destination marker to the delivery point.
5. Press `E` again when you arrive.
6. Keep exploring or return for another order.

There is no countdown timer, no fail state for being slow, and no racing pressure.

## Project structure

- `src/core/`: app bootstrap, config, render loop
- `src/world/`: world blueprint, city renderer, world helpers
- `src/player/`: input, local car controller, follow camera
- `src/delivery/`: pizza hub and delivery logic
- `src/network/`: multiplayer sync and remote player smoothing
- `src/ui/`: HUD and menu overlays

## Editing the world yourself

The main file for hand-crafting the city is [`src/world/worldBlueprint.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/worldBlueprint.js).

This is the file you should edit when you want to add or change:

- roads
- buildings
- lamps
- benches
- parked cars
- pizza places
- delivery destinations
- billboards / ads
- district ranges

Useful blueprint sections:

- `WORLD_BLUEPRINT.roads`
- `WORLD_BLUEPRINT.buildingPlots`
- `WORLD_BLUEPRINT.specialBuildings`
- `WORLD_BLUEPRINT.pizzaPlaces`
- `WORLD_BLUEPRINT.deliveryDestinations`
- `WORLD_BLUEPRINT.billboards`

The rendering layer in [`src/world/CityWorld.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/CityWorld.js) now reads from that blueprint instead of hardcoding most of the map.

### Adding image ads

1. Put your image in `public/ads/`
2. In [`src/world/worldBlueprint.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/worldBlueprint.js), set a billboard like:

```js
{
  x: 56,
  y: 7,
  z: 40,
  width: 7,
  height: 3.6,
  postHeight: 4.5,
  image: '/ads/my-ad.png',
  text: ''
}
```

If `image` is empty, the game will render a simple colored board with text instead.

## Multiplayer

The prototype uses `y-webrtc` and `Yjs` for lightweight browser-to-browser room sync.

### Current behavior

- Players who open the same room can see each other
- Each player shares nickname, car position, car rotation, district, and pizza state
- Remote cars are smoothed client-side
- The default room is `afterglow-main`

You can join a different room with a query string:

```text
http://localhost:5173/?room=late-night-block
```

### Multiplayer tradeoffs

- This is peer-to-peer presence, not authoritative multiplayer
- It depends on public signaling infrastructure
- GitHub Pages can host the frontend, but not a custom relay or dedicated backend
- Some restrictive networks may prevent peers from seeing each other reliably

## GitHub Pages deployment

The workflow in [`.github/workflows/deploy.yml`](/Users/leksarodic/Documents/Aleksa/AI/pizza/.github/workflows/deploy.yml) builds and deploys the game on pushes to `main`.

### Required repository setting

Before the workflow can deploy successfully:

1. Open the repository on GitHub
2. Go to `Settings` → `Pages`
3. Set `Source` to `GitHub Actions`
4. Save

After that, push to `main` or rerun the workflow.

### Base path

[`vite.config.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/vite.config.js) uses relative asset paths for GitHub Actions builds so the static bundle works more reliably under GitHub Pages repository subpaths.

### Correct URL to open

If this repository is named `pizza`, the deployed site URL is usually:

```text
https://leksarodic.github.io/pizza/
```

Not:

```text
https://leksarodic.github.io/
```

If you open the root domain for a project site, the browser may try to load the wrong files such as `/src/main.js` and show a MIME type error.

### 404 fallback

The repository also includes [`404.html`](/Users/leksarodic/Documents/Aleksa/AI/pizza/404.html), which redirects unknown Pages routes back to the project root. This helps when someone opens an incorrect subpath or refreshes a non-root URL.

## Main files to know

- [`src/main.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/main.js)
- [`src/core/GameApp.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/core/GameApp.js)
- [`src/world/worldBlueprint.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/worldBlueprint.js)
- [`src/world/CityWorld.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/world/CityWorld.js)
- [`src/player/CarController.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/player/CarController.js)
- [`src/delivery/DeliveryManager.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/delivery/DeliveryManager.js)
- [`src/network/MultiplayerClient.js`](/Users/leksarodic/Documents/Aleksa/AI/pizza/src/network/MultiplayerClient.js)

## Development log

- `docs: add AGENTS.md workflow rules`
- `chore: initialize project scaffold`
- `feat: add third-person car controller`
- `feat: create pizza shop interaction`
- `feat: add basic webRTC multiplayer sync`
- `feat: add calm start and pause menus`
- `chore: install frontend dependencies`
- `ci: add GitHub Pages deployment workflow`
- `docs: expand README with setup and deployment notes`
- `fix: improve camera and driving feel`
- `feat: polish city visuals and steering HUD`
- `feat: add editable world blueprint file`

## Future improvements

- Add a visual world editor on top of the blueprint file
- Add better collisions with curbs and building boundaries
- Add more pizza shops and district-specific architecture
- Add gamepad controls
- Add richer multiplayer state like emotes, lights, or shared delivery markers
