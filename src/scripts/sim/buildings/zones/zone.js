import * as THREE from 'three';
import { DevelopmentModule, DevelopmentState } from '../modules/development.js';
import { Building } from '../building.js';
export class Zone extends Building {
  style = '';
  development = new DevelopmentModule(this);
  constructor(x = 0, y = 0) {
    super(x, y);
    this.name = 'Zone';
    this.power.required = 10;
    this.rotation.y = THREE.MathUtils.degToRad(90 * Math.floor(4 * Math.random()));
  }
  refreshView() {
    let modelName;
    switch (this.development.state) {
      case DevelopmentState.underConstruction:
      case DevelopmentState.undeveloped:
        modelName = 'under-construction';
        break;
      default:
        modelName = this.style;
        break;
    }
    let mesh = window.assetManager.getModel(modelName, this);
    if (this.development.state === DevelopmentState.abandoned) {
      mesh.traverse((obj) => {
        if (obj.material) {
          obj.material.color = new THREE.Color(0x707070);
        }
      });
    }
    this.setMesh(mesh);
  }
  simulate(city) {
    super.simulate(city);
    this.development.simulate(city);
  }
  toJSON() {
    const data = super.toJSON();
    data.style = this.style;
    data.development = {
      state: this.development.state,
      level: this.development.level,
      residents: this.development.residents,
      workers: this.development.workers
    };
    return data;
  }
  toHTML() {
    let html = super.toHTML();
    html += this.development.toHTML();
    return html;
  }
}