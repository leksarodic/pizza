export class WorldEditTool {
  constructor(container) {
    this.root = document.createElement('section');
    this.root.className = 'builder-tool';
    this.root.innerHTML = `
      <button class="builder-toggle" type="button" data-role="toggle">Builder</button>
      <div class="builder-panel is-hidden" data-role="panel">
        <p class="builder-title">World Builder</p>
        <p class="builder-copy">Generate snippets for the blueprint file using your current car position.</p>
        <label class="builder-field">
          <span>Asset type</span>
          <select data-role="type">
            <option value="road">Road</option>
            <option value="building">Building</option>
            <option value="pizza">Pizza place</option>
            <option value="billboard">Billboard</option>
            <option value="lamp">Lamp</option>
          </select>
        </label>
        <div class="builder-grid">
          <label class="builder-field">
            <span>X</span>
            <input data-role="x" type="number" step="1" />
          </label>
          <label class="builder-field">
            <span>Z</span>
            <input data-role="z" type="number" step="1" />
          </label>
          <label class="builder-field">
            <span>Width</span>
            <input data-role="width" type="number" step="1" value="12" />
          </label>
          <label class="builder-field">
            <span>Depth</span>
            <input data-role="depth" type="number" step="1" value="12" />
          </label>
          <label class="builder-field">
            <span>Height</span>
            <input data-role="height" type="number" step="1" value="8" />
          </label>
          <label class="builder-field">
            <span>Label</span>
            <input data-role="label" type="text" value="NEW SPOT" />
          </label>
        </div>
        <div class="builder-actions">
          <button type="button" data-role="snap">Use car position</button>
          <button type="button" data-role="generate">Generate snippet</button>
          <button type="button" data-role="copy">Copy</button>
        </div>
        <p class="builder-hint">Paste the result into <code>src/world/worldBlueprint.js</code>.</p>
        <textarea data-role="output" spellcheck="false"></textarea>
      </div>
    `;

    container.append(this.root);
    this.panel = this.root.querySelector('[data-role="panel"]');
    this.type = this.root.querySelector('[data-role="type"]');
    this.x = this.root.querySelector('[data-role="x"]');
    this.z = this.root.querySelector('[data-role="z"]');
    this.width = this.root.querySelector('[data-role="width"]');
    this.depth = this.root.querySelector('[data-role="depth"]');
    this.height = this.root.querySelector('[data-role="height"]');
    this.label = this.root.querySelector('[data-role="label"]');
    this.output = this.root.querySelector('[data-role="output"]');

    this.root.querySelector('[data-role="toggle"]').addEventListener('click', () => {
      this.panel.classList.toggle('is-hidden');
    });
    this.root.querySelector('[data-role="snap"]').addEventListener('click', () => this.applyPlayerPosition());
    this.root.querySelector('[data-role="generate"]').addEventListener('click', () => this.generateSnippet());
    this.root.querySelector('[data-role="copy"]').addEventListener('click', async () => {
      this.generateSnippet();
      try {
        await navigator.clipboard.writeText(this.output.value);
      } catch {
        this.output.focus();
        this.output.select();
      }
    });
  }

  updatePlayerPosition(position) {
    this.playerPosition = position;
  }

  applyPlayerPosition() {
    if (!this.playerPosition) {
      return;
    }

    this.x.value = Math.round(this.playerPosition.x);
    this.z.value = Math.round(this.playerPosition.z);
  }

  generateSnippet() {
    const type = this.type.value;
    const x = Number(this.x.value || 0);
    const z = Number(this.z.value || 0);
    const width = Number(this.width.value || 10);
    const depth = Number(this.depth.value || 10);
    const height = Number(this.height.value || 6);
    const label = this.label.value || 'NEW SPOT';

    const snippetByType = {
      road: `{ x: ${x}, z: ${z}, width: ${width}, depth: ${depth} },`,
      building: `{ x: ${x}, z: ${z}, width: ${width}, depth: ${depth}, height: ${height}, color: 0xc79e62 },`,
      pizza: `{
  id: '${slugify(label)}',
  name: '${label}',
  x: ${x},
  y: 0,
  z: ${z},
  width: ${width},
  height: ${height},
  depth: ${depth},
  color: 0xc76b4d,
  roofColor: 0x4b2c34,
  signColor: 0xffd6a2,
},`,
      billboard: `{
  x: ${x},
  y: ${height},
  z: ${z},
  width: ${width},
  height: ${depth},
  postHeight: ${Math.max(4, height)},
  color: 0xf3c26b,
  text: '${label}',
  image: '',
},`,
      lamp: `[${x}, ${z}],`,
    };

    this.output.value = snippetByType[type];
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
