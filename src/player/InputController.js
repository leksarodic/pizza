export class InputController {
  constructor() {
    this.keys = new Set();
    this.resetPressed = false;
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
      reset: this.resetPressed,
    };

    this.resetPressed = false;
    return state;
  }
}
