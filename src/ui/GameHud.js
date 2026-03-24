import { WORLD_BLUEPRINT } from '../world/worldBlueprint.js';

export class GameHud {
  constructor(container) {
    this.root = document.createElement('div');
    this.root.className = 'overlay';
    this.root.innerHTML = `
      <section class="panel panel--wide">
        <p class="eyebrow">Pizza Afterglow</p>
        <h1 class="headline">A calm evening delivery run</h1>
        <p class="muted" data-role="detail"></p>
        <p class="prompt" data-role="prompt"></p>
      </section>
      <section class="hud-stack">
        <div class="status-card status-card--icon">
          <span class="hud-icon">◈</span>
          <span class="status-label">District</span>
          <strong data-role="district">Downtown</strong>
        </div>
        <div class="status-card status-card--icon">
          <span class="hud-icon">⇢</span>
          <span class="status-label">Speed</span>
          <strong data-role="speed">0 km/h</strong>
          <div class="steer-meter">
            <span class="steer-arrow" data-role="left-arrow">◀</span>
            <span class="steer-center">Steer</span>
            <span class="steer-arrow" data-role="right-arrow">▶</span>
          </div>
        </div>
        <div class="status-card status-card--icon">
          <span class="hud-icon">◉</span>
          <span class="status-label">Pizza Load</span>
          <strong data-role="cargo">No order loaded</strong>
        </div>
        <div class="status-card status-card--icon">
          <span class="hud-icon">✦</span>
          <span class="status-label">Destination</span>
          <strong data-role="destination">Pizza shop hub</strong>
        </div>
        <div class="status-card status-card--icon">
          <span class="hud-icon">⌁</span>
          <span class="status-label">Shared City</span>
          <strong data-role="presence">Connecting...</strong>
        </div>
        <div class="status-card status-card--map">
          <div class="map-header">
            <span class="status-label">City Map</span>
            <strong>Corner Radar</strong>
          </div>
          <canvas class="minimap" data-role="minimap" width="180" height="180"></canvas>
          <p class="map-help">WASD drive • E interact • R reset</p>
        </div>
      </section>
    `;

    container.append(this.root);
    this.detail = this.root.querySelector('[data-role="detail"]');
    this.prompt = this.root.querySelector('[data-role="prompt"]');
    this.district = this.root.querySelector('[data-role="district"]');
    this.speed = this.root.querySelector('[data-role="speed"]');
    this.leftArrow = this.root.querySelector('[data-role="left-arrow"]');
    this.rightArrow = this.root.querySelector('[data-role="right-arrow"]');
    this.cargo = this.root.querySelector('[data-role="cargo"]');
    this.destination = this.root.querySelector('[data-role="destination"]');
    this.presence = this.root.querySelector('[data-role="presence"]');
    this.minimap = this.root.querySelector('[data-role="minimap"]');
    this.minimapContext = this.minimap.getContext('2d');
    this.playerPosition = { x: 0, z: 0 };
    this.deliveryState = { hasPizza: false, destination: null };
    this.drawMinimap();
  }

  setStatus({ detail }) {
    this.detail.textContent = detail;
  }

  setTelemetry({ district, speedKmh, steer = 0, position }) {
    this.district.textContent = district;
    this.speed.textContent = `${speedKmh} km/h`;
    this.leftArrow.classList.toggle('is-active', steer < -0.2);
    this.rightArrow.classList.toggle('is-active', steer > 0.2);
    if (position) {
      this.playerPosition = position;
    }
    this.drawMinimap();
  }

  setDeliveryState(state) {
    this.prompt.textContent = state.prompt;
    this.cargo.textContent = state.hasPizza
      ? `1 warm order loaded • ${state.completed} delivered`
      : `No order loaded • ${state.completed} delivered`;
    this.destination.textContent = state.destination
      ? `${state.destination.name} (${state.destination.district})`
      : 'Pizza shop hub';
    this.deliveryState = state;
    this.drawMinimap();
  }

  setPresenceState({ nickname, connectedPlayers, roomName }) {
    this.presence.textContent = `${nickname} • ${connectedPlayers} online • room ${roomName}`;
  }

  drawMinimap() {
    const context = this.minimapContext;
    if (!context) {
      return;
    }

    const size = this.minimap.width;
    context.clearRect(0, 0, size, size);
    context.fillStyle = '#101722';
    context.fillRect(0, 0, size, size);

    context.strokeStyle = 'rgba(255, 221, 182, 0.18)';
    context.lineWidth = 1;
    context.strokeRect(8, 8, size - 16, size - 16);

    const toMap = (x, z) => ({
      x: ((x + 150) / 300) * (size - 24) + 12,
      y: ((z + 150) / 300) * (size - 24) + 12,
    });

    context.strokeStyle = 'rgba(244, 211, 160, 0.75)';
    context.lineWidth = 3;
    WORLD_BLUEPRINT.roads.forEach((road) => {
      const start = toMap(road.x - road.width / 2, road.z - road.depth / 2);
      const end = toMap(road.x + road.width / 2, road.z + road.depth / 2);
      context.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    });

    WORLD_BLUEPRINT.pizzaPlaces.forEach((shop) => {
      const point = toMap(shop.x, shop.z);
      context.fillStyle = '#f48a4a';
      context.beginPath();
      context.arc(point.x, point.y, 4, 0, Math.PI * 2);
      context.fill();
    });

    if (this.deliveryState.destination) {
      const point = toMap(this.deliveryState.destination.position.x, this.deliveryState.destination.position.z);
      context.fillStyle = '#7fe1ff';
      context.beginPath();
      context.arc(point.x, point.y, 4, 0, Math.PI * 2);
      context.fill();
    }

    const player = toMap(this.playerPosition.x ?? 0, this.playerPosition.z ?? 0);
    context.fillStyle = '#fff4dc';
    context.beginPath();
    context.arc(player.x, player.y, 5, 0, Math.PI * 2);
    context.fill();
  }
}
