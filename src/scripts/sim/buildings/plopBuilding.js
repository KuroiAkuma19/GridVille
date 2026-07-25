import * as THREE from 'three';
import { Building } from './building.js';
import models from '../../assets/models.js';
export class PlopBuilding extends Building {
  constructor(x = 0, y = 0, modelId = '') {
    super(x, y);
    this.modelId = modelId;
    const modelData = models[modelId];
    this.name = modelData ? modelData.title : 'Building';
    this.type = modelData ? modelData.type : 'building';
    this.cost = modelData ? (modelData.cost || 0) : 0;
    this.income = modelData ? (modelData.income || 0) : 0;
    this.power.required = 10;
    if (modelData && modelData.rotation !== undefined) {
       this.rotation.y = THREE.MathUtils.degToRad(modelData.rotation);
    } else {
       this.rotation.y = THREE.MathUtils.degToRad(90 * Math.floor(4 * Math.random()));
    }
  }
  refreshView() {
    let mesh = window.assetManager.getModel(this.modelId, this);
    this.setMesh(mesh);
  }
  simulate(city) {
    super.simulate(city);
  }
  toJSON() {
    const data = super.toJSON();
    data.modelId = this.modelId;
    return data;
  }
  toHTML() {
    let html = super.toHTML();
    if (this.income > 0) {
      html += `
        <span class="info-label">Monthly Income</span>
        <span class="info-value">$${this.income}</span>
        <br>`;
    }
    return html;
  }
}
