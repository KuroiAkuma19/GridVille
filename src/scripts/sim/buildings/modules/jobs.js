import config from '../../../config.js';
import { Citizen } from '../../citizen.js';
import { City } from '../../city.js';
import { Zone } from '../../buildings/zones/zone.js';
import { DevelopmentState } from './development.js';
import { SimModule } from './simModule.js';
export class JobsModule extends SimModule {
  #zone;
  workers = [];
  constructor(zone) {
    super();
    this.#zone = zone;
  }
  get maxWorkers() {
    if (this.#zone.development.state !== DevelopmentState.developed) {
      return 0;
    } else {
      return Math.pow(config.modules.jobs.maxWorkers, this.#zone.development.level);
    }
  }
  get availableJobs() {
    return this.maxWorkers - this.workers.length;
  }
  get filledJobs() {
    return this.workers.length;
  }
  simulate(city) {
    if (this.#zone.development.state === DevelopmentState.abandoned) {
      this.#layOffWorkers();
    }
  }
  #layOffWorkers() {
    for (const worker of this.workers) {
      worker.setWorkplace(null);
    }
    this.workers = [];
  }
  dispose() {
    this.#layOffWorkers();
  }
  toHTML() {
    let html = `<div class="info-heading">Workers (${this.filledJobs}/${this.maxWorkers})</div>`;
    html += '<ul class="info-citizen-list">';
    for (const worker of this.workers) {
      html += worker.toHTML();
    }
    html += '</ul>';
    return html;
  }
}