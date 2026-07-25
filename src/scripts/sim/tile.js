import * as THREE from 'three';
import { Building } from './buildings/building.js';
import { SimObject } from './simObject.js';
export class Tile extends SimObject {
  terrain = 'tile-plain_grass';
  #building = null;
  constructor(x, y) {
    super(x, y);
    this.name = `Tile-${this.x}-${this.y}`;
  }
  get building() {
    return this.#building;
  }
  setBuilding(value) {
    if (this.#building) {
      this.#building.dispose();
      this.remove(this.#building);
    }
    this.#building = value;
    if (value) {
      this.add(this.#building);
    }
  }
  refreshView(city) {
    this.building?.refreshView(city);
    if (this.building?.hideTerrain) {
      this.setMesh(null);
    } else {
      const mesh = window.assetManager.getModel(this.terrain, this);
      mesh.name = this.terrain;
      this.setMesh(mesh);
    }
  }
  simulate(city) {
    this.building?.simulate(city);
  }
  distanceTo(tile) {
    return Math.abs(this.x - tile.x) + Math.abs(this.y - tile.y);
  }
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      terrain: this.terrain,
      building: this.building ? this.building.toJSON() : null
    };
  }
  toHTML() {
    let html = `
      <div class="info-heading">Tile</div>
      <span class="info-label">Coordinates </span>
      <span class="info-value">X: ${this.x}, Y: ${this.y}</span>
      <br>
      <span class="info-label">Terrain </span>
      <span class="info-value">${this.terrain}</span>
      <br>
    `;
    if (this.building) {
      html += this.building.toHTML();
    }
    return html;
  }
};