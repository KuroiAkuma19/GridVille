import { BuildingType } from '../buildings/buildingType.js';
import { City } from '../city.js';
export class PowerService {
  simulate(city) {
    const powerPlantList = [];
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        const building = city.getTile(x, y).building;
        if (building) {
          if (building.type === BuildingType.powerPlant) {
            const powerPlant = building;
            powerPlant.powerConsumed = 0;
            powerPlantList.push({
              powerPlant,
              frontier: [tile],
              visited: []
            });
          } else {
            building.power.supplied = 0;
          }
        }
      }
    }
    if (powerPlantList.length === 0) {
      return;
    }
    let searching = true;
    while (searching) {
      searching = false;
      for (const item of powerPlantList) {
        const { powerPlant, frontier, visited } = item;
        if (powerPlant.powerAvailable === 0) continue;
        if (frontier.length > 0) {
          searching = true;
          const tile = frontier.shift();
          const building = tile.building;
          visited.push(tile);
          if (building.power.supplied < building.power.required) {
            const powerSupplied = Math.min(powerPlant.powerAvailable, building.power.required);
            powerPlant.powerConsumed += powerSupplied;
            building.power.supplied = powerSupplied;
          }
          const { x, y } = tile;
          const shouldVisit = (tile) => tile && !visited.includes(tile) && tile.building;
          let left = city.getTile(x - 1, y);
          let right = city.getTile(x + 1, y);
          let top = city.getTile(x, y - 1);
          let bottom = city.getTile(x, y + 1);
          if (shouldVisit(left)) {
            frontier.push(left);
          }
          if (shouldVisit(right)) {
            frontier.push(right);
          }
          if (shouldVisit(top)) {
            frontier.push(top);
          }            
          if (shouldVisit(bottom)) {
            frontier.push(bottom);
          }
        }
      }
    }
  }
  dispose() {
  }
  toHTML() {
  }
}