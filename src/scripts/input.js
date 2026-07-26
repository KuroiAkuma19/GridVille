export class InputManager {
  mouse = { x: 0, y: 0 };
  isLeftMouseDown = false;
  isMiddleMouseDown = false;
  isRightMouseDown = false;
  activePointers = new Map();
  constructor() {
    window.ui.gameWindow.addEventListener('pointerdown', this.#onPointerDown.bind(this), false);
    window.ui.gameWindow.addEventListener('pointerup', this.#onPointerUp.bind(this), false);
    window.ui.gameWindow.addEventListener('pointercancel', this.#onPointerUp.bind(this), false);
    window.ui.gameWindow.addEventListener('pointermove', this.#onPointerMove.bind(this), false);
    window.ui.gameWindow.addEventListener('contextmenu', (event) => event.preventDefault(), false);
  }
  #onPointerDown(event) {
    window.ui.gameWindow.setPointerCapture(event.pointerId);
    this.activePointers.set(event.pointerId, event);
    this.#updateButtons(event);
  }
  #onPointerUp(event) {
    window.ui.gameWindow.releasePointerCapture(event.pointerId);
    this.activePointers.delete(event.pointerId);
    this.#updateButtons(event);
  }
  #updateButtons(event) {
    if (this.activePointers.size > 1) {
      this.isLeftMouseDown = false;
      this.isRightMouseDown = false;
      this.isMiddleMouseDown = false;
      return;
    }
    // event.buttons works reliably for touch and mouse
    // Touch: 1 (Primary), Mouse Left: 1, Mouse Right: 2, Mouse Middle: 4
    this.isLeftMouseDown = (event.buttons & 1) !== 0;
    this.isRightMouseDown = (event.buttons & 2) !== 0;
    this.isMiddleMouseDown = (event.buttons & 4) !== 0;
  }
  #onPointerMove(event) {
    if (this.activePointers.has(event.pointerId)) {
      this.activePointers.set(event.pointerId, event);
    }
    if (this.activePointers.size <= 1) {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
    }
    this.#updateButtons(event);
  }
}