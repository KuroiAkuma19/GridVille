import * as THREE from 'three';
import { AssetManager } from './assets/assetManager.js';
import { CameraManager } from './camera.js';
import { InputManager } from './input.js';
import { City } from './sim/city.js';
import { SimObject } from './sim/simObject.js';
export class Game {
  city;
  focusedObject = null;
  inputManager;
  selectedObject = null;
  constructor(city) {
    this.city = city;
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene = new THREE.Scene();
    this.inputManager = new InputManager(window.ui.gameWindow);
    this.cameraManager = new CameraManager(window.ui.gameWindow);
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = false;
    window.ui.gameWindow.appendChild(this.renderer.domElement);
    this.raycaster = new THREE.Raycaster();
    window.assetManager = new AssetManager(() => {
      window.ui.hideLoadingText();
      this.city = new City(16);
      this.initialize(this.city);
      this.start();
      window.ui.setupStartScreen(this);
      window.ui.togglePause(); 
      setInterval(this.simulate.bind(this), 1000);
    });
    window.addEventListener('resize', this.onResize.bind(this), false);
  }
  initialize(city) {
    this.scene.clear();
    this.scene.add(city);
    this.#setupLights();
    this.setupGrid(city);
  }
  setupGrid(city) {
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.geometry.dispose();
      this.grid.material.dispose();
    }
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: window.assetManager.textures['grid'],
      transparent: true,
      opacity: 0.2
    });
    gridMaterial.map.repeat = new THREE.Vector2(city.size, city.size);
    gridMaterial.map.wrapS = city.size;
    gridMaterial.map.wrapT = city.size;
    const grid = new THREE.Mesh(
      new THREE.BoxGeometry(city.size, 0.1, city.size),
      gridMaterial
    );
    grid.position.set(city.size / 2 - 0.5, -0.04, city.size / 2 - 0.5);
    this.grid = grid;
    this.scene.add(grid);
  }
  #setupLights() {
    this.sun = new THREE.DirectionalLight(0xffffff, 2)
    this.sun.position.set(-10, 20, 0);
    this.sun.castShadow = false;
    this.scene.add(this.sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }
  start() {
    this.renderer.setAnimationLoop(this.draw.bind(this));
  }
  stop() {
    this.renderer.setAnimationLoop(null);
  }
  draw() {
    this.city.draw();
    this.updateFocusedObject();
    if (this.inputManager.isLeftMouseDown) {
      this.useTool();
    }
    this.sun.position.set(50, 100, 50);
    this.renderer.render(this.scene, this.cameraManager.camera);
  }
  simulate() {
    if (window.ui.isPaused) return;
    this.city.simulate(1);
    window.ui.updateTitleBar(this);
    window.ui.updateInfoPanel(this.selectedObject);
  }
  useTool() {
    switch (window.ui.activeToolId) {
      case 'select':
        this.updateSelectedObject();
        window.ui.updateInfoPanel(this.selectedObject);
        break;
      case 'bulldoze':
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.bulldoze(x, y);
        }
        break;
      default:
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.placeBuilding(x, y, window.ui.activeToolId);
        }
        break;
    }
  }
  updateSelectedObject() {
    this.selectedObject?.setSelected(false);
    this.selectedObject = this.focusedObject;
    this.selectedObject?.setSelected(true);
  }
  updateFocusedObject() {  
    this.focusedObject?.setFocused(false);
    const newObject = this.#raycast();
    if (newObject !== this.focusedObject) {
      this.focusedObject = newObject;
    }
    this.focusedObject?.setFocused(true);
  }
  #raycast() {
    const camPos = this.cameraManager.camera.position;
    if (this.lastMouseX === this.inputManager.mouse.x && 
        this.lastMouseY === this.inputManager.mouse.y &&
        this.lastCamPos && this.lastCamPos.equals(camPos)) {
       return this.focusedObject;
    }
    this.lastMouseX = this.inputManager.mouse.x;
    this.lastMouseY = this.inputManager.mouse.y;
    this.lastCamPos = camPos.clone();

    var coords = {
      x: (this.inputManager.mouse.x / this.renderer.domElement.clientWidth) * 2 - 1,
      y: -(this.inputManager.mouse.y / this.renderer.domElement.clientHeight) * 2 + 1
    };
    this.raycaster.setFromCamera(coords, this.cameraManager.camera);
    let intersections = this.raycaster.intersectObjects(this.city.root.children, true);
    if (intersections.length > 0) {
      const selectedObject = intersections[0].object.userData;
      return selectedObject;
    } else {
      return null;
    }
  }
  onResize() {
    this.cameraManager.resize(window.ui.gameWindow);
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
  }
}
window.onload = () => {
  window.game = new Game();
}