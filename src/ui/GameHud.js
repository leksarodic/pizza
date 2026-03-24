export class GameHud {
  constructor(container) {
    this.root = document.createElement('div');
    this.root.className = 'overlay';
    this.root.innerHTML = `
      <section class="panel panel--wide">
        <p class="eyebrow">Pizza Afterglow</p>
        <h1 class="headline">A calm evening delivery run</h1>
        <p class="muted" data-role="detail"></p>
      </section>
      <section class="hud-stack">
        <div class="status-card">
          <span class="status-label">District</span>
          <strong data-role="district">Downtown</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Speed</span>
          <strong data-role="speed">0 km/h</strong>
        </div>
        <div class="status-card">
          <span class="status-label">Controls</span>
          <strong>WASD / Arrows, R reset</strong>
        </div>
      </section>
    `;

    container.append(this.root);
    this.detail = this.root.querySelector('[data-role="detail"]');
    this.district = this.root.querySelector('[data-role="district"]');
    this.speed = this.root.querySelector('[data-role="speed"]');
  }

  setStatus({ detail }) {
    this.detail.textContent = detail;
  }

  setTelemetry({ district, speedKmh }) {
    this.district.textContent = district;
    this.speed.textContent = `${speedKmh} km/h`;
  }
}
