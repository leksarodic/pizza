# AGENTS.md

## Mission
Build a calm 3D browser game where the player drives a pizza delivery car through an open city. The main goal is relaxed exploration, atmosphere, and optional pizza deliveries. This is not a racing game.

## Product goals
- Make driving feel enjoyable and accessible
- Make the city pleasant to explore
- Keep the delivery loop simple and low pressure
- Add lightweight multiplayer presence so the city feels shared
- Keep the project deployable as a static frontend on GitHub Pages
- Prioritize a polished MVP over ambitious but unfinished systems

## Non-goals
- No racing focus
- No countdown pressure
- No combat
- No police or chase mechanics
- No survival mechanics
- No complex economy
- No overly realistic vehicle simulation
- No heavy backend unless absolutely necessary

## Technical direction
- Prefer Three.js for 3D rendering
- Use a lightweight arcade-style driving model
- Keep the architecture modular
- Separate gameplay logic, rendering, input, audio, UI, and networking concerns
- Design multiplayer as a thin layer over local gameplay state
- Ensure the project can build into static files for GitHub Pages

## MVP priorities
1. Project scaffold and basic scene
2. Car controls and follow camera
3. Open city environment
4. Pizza pickup and delivery loop
5. Basic multiplayer presence and movement sync
6. Minimal UI and menus
7. Atmosphere and polish
8. Deployment pipeline for GitHub Pages

## Workflow rules
- Always work in small, logical steps
- After every meaningful change, create a Git commit
- Do not group unrelated changes into a single commit
- Keep the project runnable after each phase
- Prefer shipping a working simple version before expanding systems
- Update documentation as the implementation evolves

## Commit policy
Use conventional, descriptive commit messages.

Examples:
- chore: initialize project scaffold
- docs: add AGENTS.md
- feat: add player car controller
- feat: build downtown street layout
- feat: add pizza pickup interaction
- feat: sync remote player transforms
- fix: smooth camera follow behavior
- ci: add GitHub Pages deployment workflow
- docs: document Pages deployment setup

## Architecture guidelines
Keep code organized by responsibility.

Suggested areas:
- `core/` for app bootstrap, game loop, shared config
- `world/` for map, environment, props, districts
- `player/` for car controller, camera, local player state
- `delivery/` for pizza jobs, pickup points, destinations
- `network/` for multiplayer transport, peers, sync, interpolation
- `ui/` for HUD, menus, prompts
- `audio/` for engine and ambient sounds
- `assets/` for models, textures, and static files

## Multiplayer rules
- Multiplayer is meant to support shared presence, not competition
- Auto-create a player session when someone opens the site
- Sync only what is needed for the MVP
- Keep local prediction simple
- Smooth remote movement with interpolation where possible
- If using PeerJS or WebRTC, document all limitations clearly
- If Pages hosting restricts part of the multiplayer flow, explain fallback behavior in README

## GitHub Pages rules
- Build output must be static
- Configure asset paths correctly for repository-based Pages hosting
- Add a GitHub Actions workflow for automatic deployment
- Document any required repository settings
- Validate that the deployed build works under the repository subpath

## UX rules
- Driving should feel calm and forgiving
- The UI should stay minimal and readable
- Exploration should always be possible
- Deliveries should guide the player, not pressure them
- Multiplayer should feel ambient and social, not stressful

## Guardrails
- Do not overengineer physics
- Do not introduce large dependencies unless they clearly help
- Do not build advanced systems before the MVP is playable
- Do not sacrifice clarity for cleverness
- Do not break the build
- Do not leave setup undocumented

## Definition of done for MVP
The MVP is done when:
- A player can open the site and drive around a city
- A pizza can be picked up and delivered
- The city has multiple recognizable districts
- Other connected players can appear and move in the same session
- The UI explains enough to play
- The project builds and deploys to GitHub Pages
- README explains setup, controls, multiplayer, and deployment