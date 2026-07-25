import config from '../../../config.js';
import { City } from '../../city.js';
import { Building } from '../building.js';
import { SimModule } from './simModule.js';
export class RoadAccessModule extends SimModule {
  building;
  enabled = true;
  value;
  constructor(building) {
    super();
    this.building = building;
  }
  simulate(city) {
    if (!this.enabled) {
      this.value = true;
    } else {
      const road = city.findTile(
        this.building, 
        (tile) => tile.building?.type === 'road', 
        config.modules.roadAccess.searchDistance);
      this.value = (road !== null);
    }
  }
}