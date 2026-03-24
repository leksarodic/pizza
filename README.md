# Pizza Afterglow

A calm 3D browser game prototype about wandering through a low-pressure city, delivering pizzas when you feel like it, and sharing the streets with a few other players.

## Status

This repository is being built in small phases. The first phase sets up the static frontend scaffold, Three.js rendering, and the modular folder structure used for the MVP.

## Planned architecture

- `src/core/` app bootstrap, render loop, shared config
- `src/world/` city layout, props, landmarks, districts
- `src/player/` local car controller, camera, input
- `src/delivery/` pizza hub, routes, destinations, progression
- `src/network/` lightweight peer presence, sync, interpolation
- `src/ui/` HUD, menus, prompts
- `src/audio/` ambience and engine sound

## Local development

1. Install dependencies with `npm install`
2. Start the dev server with `npm run dev`
3. Build for production with `npm run build`
