import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';
export class PowerPlant extends Building {
  powerCapacity = 100;
  powerConsumed = 0;
  constructor(x, y) {
    super(x, y);
    this.type = BuildingType.powerPlant;
  }
  get powerAvailable() {
    if (this.roadAccess.value) {
      return this.powerCapacity - this.powerConsumed;
    } else {
      return 0;
    }
  }
  refreshView() {
    let mesh = window.assetManager.getModel('nuclear-power-plant', this);
    this.setMesh(mesh);
  }
  toHTML() {
    let html = super.toHTML();
    html += `
      <div class="info-heading">Power</div>
      <span class="info-label">Power Capacity (kW)</span>
      <span class="info-value">${this.powerCapacity}</span>
      <br>
      <span class="info-label">Power Consumed (kW)</span>
      <span class="info-value">${this.powerConsumed}</span>
      <br>
      <span class="info-label">Power Available (kW)</span>
      <span class="info-value">${this.powerAvailable}</span>
      <br>
    `;
    return html;
  }
}