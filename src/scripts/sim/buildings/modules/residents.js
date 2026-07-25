import config from '../../../config.js';
import { Citizen } from '../../citizen.js';
import { City } from '../../city.js';
import { Zone as ResidentialZone } from '../../buildings/zones/zone.js';
import { DevelopmentState } from './development.js';
import { SimModule } from './simModule.js';
export class ResidentsModule extends SimModule {
  #zone;
  #residents = [];
  constructor(zone) {
    super();
    this.#zone = zone;
  }
  get count() {
    return this.#residents.length;
  }
  get maximum() {
    return Math.pow(config.modules.residents.maxResidents, this.#zone.development.level);
  }
  simulate(city) {
    if (this.#zone.development.state === DevelopmentState.abandoned && this.#residents.length > 0) {
      this.evictAll();
    } else if (this.#zone.development.state === DevelopmentState.developed) {
      if (this.#residents.length < this.maximum && Math.random() < config.modules.residents.residentMoveInChance) {
        this.#residents.push(new Citizen(this.#zone));
      }
    }
    for (const resident of this.#residents) {
      resident.simulate(city);
    }
  }
  #evictAll() {
    for (const resident of this.#residents) {
      resident.dispose();
    }
    this.#residents = [];
  }
  dispose() {
    this.#evictAll();
  }
  toHTML() {
    let html = `<div class="info-heading">Residents (${this.#residents.length}/${this.maximum})</div>`;
    html += '<ul class="info-citizen-list">';
    for (const resident of this.#residents) {
      html += resident.toHTML();
    }
    html += '</ul>';
    return html;
  }
}