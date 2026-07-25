import { City } from '../../city.js';
import { JobsModule } from '../modules/jobs.js';
import { BuildingType } from '../buildingType.js';
import { Zone } from './zone.js';
export class IndustrialZone extends Zone {
  jobs = new JobsModule(this);
  constructor(x, y) {
    super(x, y);
    this.name = generateBusinessName();
    this.type = BuildingType.industrial;
    const models = [
      'industry-building',
      'industry-factory-hall',
      'industry-factory-old',
      'industry-factory',
      'industry-warehouse'
    ];
    this.style = models[Math.floor(Math.random() * models.length)];
  }
  simulate(city) {
    super.simulate(city);
    this.jobs.simulate();
  }
  dispose() {
    this.jobs.dispose();
    super.dispose();
  }
  toHTML() {
    let html = super.toHTML();
    html += this.jobs.toHTML();
    return html;
  }
}
const prefixes = ['Apex', 'Vortex', 'Elevate', 'Zenith', 'Nova', 'Synapse', 'Pulse', 'Enigma', 'Catalyst', 'Axiom'];
const suffixes = ['Dynamics', 'Ventures', 'Solutions', 'Technologies', 'Innovations', 'Industries', 'Enterprises', 'Systems', 'Mechanics', 'Manufacturing'];
const businessSuffixes = ['LLC', 'Inc.', 'Co.', 'Corp.', 'Ltd.'];
function generateBusinessName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const businessSuffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];
  return prefix + ' ' + suffix + ' ' + businessSuffix;
}