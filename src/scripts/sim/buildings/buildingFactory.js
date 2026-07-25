import { BuildingType } from './buildingType.js';
import { CommercialZone } from './zones/commercial.js';
import { ResidentialZone } from './zones/residential.js';
import { IndustrialZone } from './zones/industrial.js';
import { Road } from './transportation/road.js';
import { Building } from './building.js';
import { PowerPlant } from './power/powerPlant.js';
import { PowerLine } from './power/powerLine.js';
import { PlopBuilding } from './plopBuilding.js';
import models from '../../assets/models.js';
export function createBuilding(x, y, type) {
  switch (type) {
    case BuildingType.residential: 
      return new ResidentialZone(x, y);
    case BuildingType.commercial: 
      return new CommercialZone(x, y);
    case BuildingType.industrial: 
      return new IndustrialZone(x, y);
    case BuildingType.road: 
      return new Road(x, y);
    case BuildingType.powerPlant:
      return new PowerPlant(x, y);
    case BuildingType.powerLine:
      return new PowerLine(x, y);
    default:
      if (models[type]) {
        return new PlopBuilding(x, y, type);
      }
      console.error(`${type} is not a recognized building type or model ID.`);
  }
}