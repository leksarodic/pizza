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
        <div class="status-card">
          <span class="status-label">District</span>
          <strong data-role="district">Downtown</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Speed</span>
          <strong data-role="speed">0 km/h</strong>
          <div class="steer-meter">
            <span class="steer-arrow" data-role="left-arrow">◀</span>
            <span class="steer-center">Steer</span>
            <span class="steer-arrow" data-role="right-arrow">▶</span>
          </div>
        </div>
        <div class="status-card">
          <span class="status-label">Controls</span>
          <strong>WASD / Arrows, R reset</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Pizza Load</span>
          <strong data-role="cargo">No order loaded</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Destination</span>
          <strong data-role="destination">Pizza shop hub</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Shared City</span>
          <strong data-role="presence">Connecting...</strong>
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
  }

  setStatus({ detail }) {
    this.detail.textContent = detail;
  }

  setTelemetry({ district, speedKmh, steer = 0 }) {
    this.district.textContent = district;
    this.speed.textContent = `${speedKmh} km/h`;
    this.leftArrow.classList.toggle('is-active', steer < -0.2);
    this.rightArrow.classList.toggle('is-active', steer > 0.2);
  }

  setDeliveryState(state) {
    this.prompt.textContent = state.prompt;
    this.cargo.textContent = state.hasPizza
      ? `1 warm order loaded • ${state.completed} delivered`
      : `No order loaded • ${state.completed} delivered`;
    this.destination.textContent = state.destination
      ? `${state.destination.name} (${state.destination.district})`
      : 'Pizza shop hub';
  }

  setPresenceState({ nickname, connectedPlayers, roomName }) {
    this.presence.textContent = `${nickname} • ${connectedPlayers} online • room ${roomName}`;
  }
}
