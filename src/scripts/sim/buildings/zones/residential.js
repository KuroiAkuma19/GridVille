import { City } from '../../city.js';
import { Zone } from './zone.js';
import { ResidentsModule } from '../modules/residents.js';
import { BuildingType } from '../buildingType.js';
export class ResidentialZone extends Zone {
  residents = new ResidentsModule(this);
  constructor(x, y) {
    super(x, y);
    this.name = generateBuildingName();
    this.type = BuildingType.residential;
    const models = [
      'building-house-block-big',
      'building-house-block-old',
      'building-house-block',
      'building-house-family-large',
      'building-house-family-small',
      'building-house-modern-big',
      'building-house-modern',
      'building-apartment-china'
    ];
    this.style = models[Math.floor(Math.random() * models.length)];
  }
  simulate(city) {
    super.simulate(city);
    this.residents.simulate(city);
  }
  dispose() {
    this.residents.dispose();
    super.dispose();
  }
  toHTML() {
    let html = super.toHTML();
    html += this.residents.toHTML();
    return html;
  }
}
const prefixes = ['Emerald', 'Ivory', 'Crimson', 'Opulent', 'Celestial', 'Enchanted', 'Serene', 'Whispering', 'Stellar', 'Tranquil'];
const suffixes = ['Tower', 'Residence', 'Manor', 'Court', 'Plaza', 'House', 'Mansion', 'Place', 'Villa', 'Gardens'];
function generateBuildingName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return prefix + ' ' + suffix;
}