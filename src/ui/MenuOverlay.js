export class MenuOverlay {
  constructor(container, { onStart, onResume }) {
    this.onStart = onStart;
    this.onResume = onResume;
    this.root = document.createElement('div');
    this.root.className = 'menu-layer';
    this.root.innerHTML = `
      <section class="menu-card" data-role="start">
        <p class="eyebrow">Pizza Afterglow</p>
        <h2 class="menu-title">Coast through a shared city at your own pace</h2>
        <p class="menu-copy">
          Pick up a pizza when you feel like it, wander through the neighborhoods,
          and enjoy the late-evening glow without any timer or pressure.
        </p>
        <div class="menu-actions">
          <button type="button" data-action="start">Start Driving</button>
        </div>
      </section>
      <section class="menu-card menu-card--small is-hidden" data-role="pause">
        <p class="eyebrow">Paused</p>
        <h2 class="menu-title">Take a breath, then head back out</h2>
        <p class="menu-copy">The city will still be here when you are ready.</p>
        <div class="menu-actions">
          <button type="button" data-action="resume">Resume Cruise</button>
        </div>
      </section>
    `;

    container.append(this.root);
    this.startCard = this.root.querySelector('[data-role="start"]');
    this.pauseCard = this.root.querySelector('[data-role="pause"]');
    this.root.querySelector('[data-action="start"]').addEventListener('click', () => this.onStart());
    this.root.querySelector('[data-action="resume"]').addEventListener('click', () => this.onResume());
  }

  showStart() {
    this.root.classList.remove('is-hidden');
    this.startCard.classList.remove('is-hidden');
    this.pauseCard.classList.add('is-hidden');
  }

  showPause() {
    this.root.classList.remove('is-hidden');
    this.startCard.classList.add('is-hidden');
    this.pauseCard.classList.remove('is-hidden');
  }

  hide() {
    this.root.classList.add('is-hidden');
  }
}
