import { City } from '../../city.js';
import { Zone } from './zone.js';
import { JobsModule } from '../modules/jobs.js';
import { BuildingType } from '../buildingType.js';
export class CommercialZone extends Zone {
  jobs = new JobsModule(this);
  constructor(x, y) {
    super(x, y);
    this.name = generateBusinessName();
    this.type = BuildingType.commercial;
    const models = [
      'building-bank',
      'building-burger-joint',
      'building-cafe',
      'building-cinema',
      'building-hotel',
      'building-mall',
      'building-office',
      'building-office-tall',
      'building-restaurant'
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
const prefixes = ['Prime', 'Elite', 'Global', 'Exquisite', 'Vibrant', 'Luxury', 'Innovative', 'Sleek', 'Premium', 'Dynamic'];
const suffixes = ['Commerce', 'Trade', 'Marketplace', 'Ventures', 'Enterprises', 'Retail', 'Group', 'Emporium', 'Boutique', 'Mall'];
const businessSuffixes = ['LLC', 'Inc.', 'Co.', 'Corp.', 'Ltd.'];
function generateBusinessName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const businessSuffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];
  return prefix + ' ' + suffix + ' ' + businessSuffix;
}