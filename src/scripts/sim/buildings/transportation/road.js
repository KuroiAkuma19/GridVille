import * as THREE from 'three';
import { Building } from '../building.js';
import { City } from '../../city.js';
export class Road extends Building {
  constructor(x, y) {
    super(x, y);
    this.type = 'road';
    this.name = 'Road';
    this.style = 'tile-road-straight';
    this.hideTerrain = true;
    this.roadAccess.enabled = false;
  }
  refreshView(city) {
    let top = (city.getTile(this.x, this.y - 1)?.building?.type === this.type) ?? false;
    let bottom = (city.getTile(this.x, this.y + 1)?.building?.type === this.type) ?? false;
    let left = (city.getTile(this.x - 1, this.y)?.building?.type === this.type) ?? false;
    let right = (city.getTile(this.x + 1, this.y)?.building?.type === this.type) ?? false;
    if (top && bottom && left && right) {
      this.style = 'tile-road-intersection';
      this.rotation.y = 0;
    } else if (!top && bottom && left && right) { 
      this.style = 'tile-road-intersection-t';
      this.rotation.y  = 0;
    } else if (top && !bottom && left && right) { 
      this.style = 'tile-road-intersection-t';
      this.rotation.y  = THREE.MathUtils.degToRad(180);
    } else if (top && bottom && !left && right) { 
      this.style = 'tile-road-intersection-t';
      this.rotation.y  = THREE.MathUtils.degToRad(90);
    } else if (top && bottom && left && !right) { 
      this.style = 'tile-road-intersection-t';
      this.rotation.y  = THREE.MathUtils.degToRad(270);
    } else if (top && !bottom && left && !right) { 
      this.style = 'tile-road-curve';
      this.rotation.y  = THREE.MathUtils.degToRad(180);
    } else if (top && !bottom && !left && right) { 
      this.style = 'tile-road-curve';
      this.rotation.y  = THREE.MathUtils.degToRad(90);
    } else if (!top && bottom && left && !right) { 
      this.style = 'tile-road-curve';
      this.rotation.y  = THREE.MathUtils.degToRad(270);
    } else if (!top && bottom && !left && right) { 
      this.style = 'tile-road-curve';
      this.rotation.y  = 0;
    } else if (top && bottom && !left && !right) { 
      this.style = 'tile-road-straight';
      this.rotation.y  = 0;
    } else if (!top && !bottom && left && right) { 
      this.style = 'tile-road-straight';
      this.rotation.y  = THREE.MathUtils.degToRad(90);
    } else if (top && !bottom && !left && !right) { 
      this.style = 'tile-road-end';
      this.rotation.y  = THREE.MathUtils.degToRad(180);
    } else if (!top && bottom && !left && !right) { 
      this.style = 'tile-road-end';
      this.rotation.y  = 0;
    } else if (!top && !bottom && left && !right) { 
      this.style = 'tile-road-end';
      this.rotation.y  = THREE.MathUtils.degToRad(270);
    } else if (!top && !bottom && !left && right) { 
      this.style = 'tile-road-end';
      this.rotation.y  = THREE.MathUtils.degToRad(90);
    }
    const mesh = window.assetManager.getModel(this.style, this);
    this.setMesh(mesh);
    city.vehicleGraph.updateTile(this.x, this.y, this);
  }
  toHTML() {
    let html = super.toHTML();
    html += `
    <span class="info-label">Style </span>
    <span class="info-value">${this.style}</span>
    <br>
    `;
    return html;
  }
}