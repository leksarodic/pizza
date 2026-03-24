export class InputController {
  constructor() {
    this.keys = new Set();
    this.resetPressed = false;
    this.pausePressed = false;
    this.onKeyDown = (event) => this.handleKey(event, true);
    this.onKeyUp = (event) => this.handleKey(event, false);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  handleKey(event, pressed) {
    const code = event.code;

    if (pressed) {
      this.keys.add(code);
      if (code === 'KeyR') {
        this.resetPressed = true;
      }
      if (code === 'Escape') {
        this.pausePressed = true;
      }
      return;
    }

    this.keys.delete(code);
  }

  getAxis(negative, positive) {
    const hasNegative = negative.some((code) => this.keys.has(code));
    const hasPositive = positive.some((code) => this.keys.has(code));
    return Number(hasPositive) - Number(hasNegative);
  }

  getState() {
    const state = {
      accelerate: this.keys.has('ArrowUp') || this.keys.has('KeyW'),
      brake: this.keys.has('ArrowDown') || this.keys.has('KeyS'),
      steer: this.getAxis(['ArrowLeft', 'KeyA'], ['ArrowRight', 'KeyD']),
      interact: this.keys.has('KeyE'),
      pause: this.pausePressed,
      reset: this.resetPressed,
    };

    this.resetPressed = false;
    this.pausePressed = false;
    return state;
  }
}
