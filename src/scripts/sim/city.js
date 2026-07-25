import * as THREE from 'three';
import { BuildingType } from './buildings/buildingType.js';
import { createBuilding } from './buildings/buildingFactory.js';
import { Tile } from './tile.js';
import { VehicleGraph } from './vehicles/vehicleGraph.js';
import { PowerService } from './services/power.js';
import models from '../assets/models.js';
import { BuildingStatus } from './buildings/buildingStatus.js';
import { DevelopmentState } from './buildings/modules/development.js';
import { TaskGenerator } from './tasks.js';
const getBuildingCost = (type) => {
  if (models[type]) {
    return models[type].cost || 0;
  }
  switch(type) {
    case 'residential':
    case 'commercial':
    case 'industrial':
      return 50;
    case 'road':
    case 'power-line':
      return 10;
    case 'power-plant':
      return 500;
    default:
      return 0;
  }
};
export class City extends THREE.Group {
  debugMeshes = new THREE.Group();
  root = new THREE.Group();
  services = [];
  size = 16;
  simTime = 0;
  money = 10000;
  happiness = 50;
  playerName = 'Mayor';
  playerTag = '#0000';
  level = 1;
  xp = 0;
  activeTasks = TaskGenerator.getInitialTasks();
  taskHistory = [];
  tiles = [];
  vehicleGraph;
  constructor(size, name = 'My City') {
    super();
    this.name = name;
    this.size = size;
    this.add(this.debugMeshes);
    this.add(this.root);
    this.tiles = [];
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new Tile(x, y);
        tile.refreshView(this);
        this.root.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }
    this.services = [];
    this.services.push(new PowerService());
    this.vehicleGraph = new VehicleGraph(this.size);
    this.debugMeshes.add(this.vehicleGraph);
  }
  get population() {
    let population = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building) {
          if (tile.building.residents) {
            population += tile.building.residents.count;
          } else if (tile.building.type === 'residential') {
            population += 12;
          }
        }
      }
    }
    return population;
  }

  /**
   * Adds XP and handles leveling up
   * @param {number} amount 
   */
  addXp(amount) {
    this.xp += amount;
    let nextLevelXp = this.level * 100;
    
    
    while (this.xp >= nextLevelXp) {
      this.xp -= nextLevelXp;
      this.level++;
      nextLevelXp = this.level * 100;
      
      if (window.ui && window.ui.showXpToast) {
         window.ui.showXpToast(`LEVEL UP! LVL ${this.level}`);
      }
    }
  }

  checkTasks() {
    let tasksCompleted = false;
    for (let i = this.activeTasks.length - 1; i >= 0; i--) {
      const task = this.activeTasks[i];
      if (TaskGenerator.checkTask(task, this)) {
         this.addXp(task.xp);
         
         
         this.taskHistory.unshift(task);
         if (this.taskHistory.length > 5) {
            this.taskHistory.pop();
         }
         
         if (window.ui && window.ui.showXpToast) {
            window.ui.showXpToast(`Task Complete: ${task.title} (+${task.xp} XP)`);
         }
         
         
         const nextTask = TaskGenerator.generateNextTask(task);
         this.activeTasks.splice(i, 1);
         if (nextTask) {
            this.activeTasks.push(nextTask);
         }
         tasksCompleted = true;
      }
    }
    
    if (tasksCompleted && window.ui && window.ui.renderTasks) {
       window.ui.renderTasks();
    }
  }
  getTile(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      if (this.tiles[x] && this.tiles[x][y]) {
         return this.tiles[x][y];
      }
    }
    return null;
  }
  simulate(steps = 1) {
    let count = 0;
    while (count++ < steps) {
      this.services.forEach((service) => service.simulate(this));
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          this.getTile(x, y).simulate(this);
        }
      }
    }
    this.checkTasks();
    this.simTime++;
    if (this.simTime % 30 === 0) {
      let taxIncome = this.population * 2;
      let maintenanceCost = 0;
      let unpoweredCount = 0;
      let noRoadCount = 0;
      let abandonedCount = 0;
      let poweredCount = 0;
      let totalBuildings = 0;
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          const tile = this.getTile(x, y);
          if (tile.building) {
            maintenanceCost += 1;
            totalBuildings += 1;
            if (tile.building.status === BuildingStatus.NoPower) unpoweredCount++;
            if (tile.building.status === BuildingStatus.NoRoadAccess) noRoadCount++;
            if (tile.building.development && tile.building.development.state === DevelopmentState.abandoned) abandonedCount++;
            if (tile.building.power && tile.building.power.isFullyPowered) poweredCount++;
            if (tile.building.income && tile.building.power.isFullyPowered) {
               taxIncome += tile.building.income;
            }
          }
        }
      }
      this.money += taxIncome;
      this.money -= maintenanceCost;
      if (totalBuildings > 0) {
        let currentHappiness = 50;
        currentHappiness += (poweredCount / totalBuildings) * 20;
        currentHappiness -= (unpoweredCount / totalBuildings) * 30;
        currentHappiness -= (noRoadCount / totalBuildings) * 20;
        currentHappiness -= (abandonedCount / totalBuildings) * 40;
        if (this.population > 0) {
          if (taxIncome / this.population > 10) currentHappiness -= 15;
          else if (taxIncome / this.population < 5) currentHappiness += 10;
        }
        this.happiness = Math.floor(Math.max(0, Math.min(100, currentHappiness)));
      }
    }
  }
  toJSON() {
    return {
      name: this.name,
      playerName: this.playerName,
      playerTag: this.playerTag,
      level: this.level,
      xp: this.xp,
      size: this.size,
      simTime: this.simTime,
      money: this.money,
      happiness: this.happiness,
      activeTasks: this.activeTasks,
      taskHistory: this.taskHistory,
      tiles: this.tiles.map(col => col.map(t => t.toJSON()))
    };
  }
  load(data) {
    this.name = data.name;
    this.playerName = data.playerName || 'Mayor';
    this.playerTag = data.playerTag || '#0000';
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.activeTasks = data.activeTasks || TaskGenerator.getInitialTasks();
    this.taskHistory = data.taskHistory || [];
    this.size = data.size;
    this.simTime = data.simTime;
    this.money = data.money;
    this.happiness = data.happiness !== undefined ? data.happiness : 50;
    this.root.clear();
    this.tiles = [];
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tileData = data.tiles[x][y];
        const tile = new Tile(x, y);
        tile.terrain = tileData.terrain;
        if (tileData.building) {
          const bData = tileData.building;
          const buildingType = bData.modelId || bData.type;
          const building = createBuilding(x, y, buildingType);
          if (bData.rotation !== undefined) building.rotation.y = bData.rotation;
          if (bData.style) building.style = bData.style;
          if (bData.development && building.development) {
             building.development.state = bData.development.state;
             building.development.level = bData.development.level;
             building.development.residents = bData.development.residents;
             building.development.workers = bData.development.workers;
          }
          tile.setBuilding(building);
        }
        this.root.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        this.tiles[x][y].refreshView(this);
      }
    }
    this.debugMeshes.remove(this.vehicleGraph);
    this.vehicleGraph = new VehicleGraph(this.size);
    this.debugMeshes.add(this.vehicleGraph);
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building && tile.building.type === BuildingType.road) {
          this.vehicleGraph.updateTile(x, y, tile.building);
        }
      }
    }
    if (window.game) {
       window.game.setupGrid(this);
    }
  }
  expand() {
    const expandCost = 15000;
    if (this.money < expandCost) {
      console.log('Not enough money to expand!');
      return false;
    }
    this.money -= expandCost;
    const newSize = this.size + 4;
    for (let x = this.size; x < newSize; x++) {
      const column = [];
      for (let y = 0; y < newSize; y++) {
        const tile = new Tile(x, y);
        this.root.add(tile);
        column.push(tile);
      }
      this.tiles.push(column);
    }
    for (let x = 0; x < this.size; x++) {
      for (let y = this.size; y < newSize; y++) {
        const tile = new Tile(x, y);
        this.root.add(tile);
        this.tiles[x].push(tile);
      }
    }
    const oldSize = this.size;
    this.size = newSize;
    for (let x = 0; x < newSize; x++) {
      for (let y = 0; y < newSize; y++) {
        if (x >= oldSize || y >= oldSize) {
           this.tiles[x][y].refreshView(this);
        }
      }
    }
    if (window.game) {
       window.game.setupGrid(this);
    }
    this.debugMeshes.remove(this.vehicleGraph);
    this.vehicleGraph = new VehicleGraph(this.size);
    this.debugMeshes.add(this.vehicleGraph);
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        if (tile.building && tile.building.type === BuildingType.road) {
          this.vehicleGraph.updateTile(x, y, tile.building);
        }
      }
    }
    return true;
  }
  placeBuilding(x, y, buildingType) {
    const cost = getBuildingCost(buildingType);
    if (this.money < cost) {
      console.log('Not enough money to build!');
      return;
    }
    const tile = this.getTile(x, y);
    if (tile && !tile.building) {
      this.money -= cost;
      tile.setBuilding(createBuilding(x, y, buildingType));
      
      
      this.addXp(5);
      if (window.ui && window.ui.showXpToast) {
         window.ui.showXpToast('+5 XP');
      }
      
      tile.refreshView(this);
      this.getTile(x - 1, y)?.refreshView(this);
      this.getTile(x + 1, y)?.refreshView(this);
      this.getTile(x, y - 1)?.refreshView(this);
      this.getTile(x, y + 1)?.refreshView(this);
      if (tile.building.type === BuildingType.road) {
        this.vehicleGraph.updateTile(x, y, tile.building);
      }
      this.checkTasks();
    }
  }
  bulldoze(x, y) {
    const tile = this.getTile(x, y);
    if (tile.building) {
      const bulldozeCost = 10;
      if (this.money < bulldozeCost) {
        console.log('Not enough money to bulldoze!');
        return;
      }
      this.money -= bulldozeCost;
      if (tile.building.type === BuildingType.road) {
        this.vehicleGraph.updateTile(x, y, null);
      }
      tile.building.dispose();
      tile.setBuilding(null);
      tile.refreshView(this);
      this.getTile(x - 1, y)?.refreshView(this);
      this.getTile(x + 1, y)?.refreshView(this);
      this.getTile(x, y - 1)?.refreshView(this);
      this.getTile(x, y + 1)?.refreshView(this);
    }
  }
  draw() {
    this.vehicleGraph.updateVehicles();
  }
  findTile(start, filter, maxDistance) {
    const startTile = this.getTile(start.x, start.y);
    const visited = new Set();
    const tilesToSearch = [];
    tilesToSearch.push(startTile);
    while (tilesToSearch.length > 0) {
      const tile = tilesToSearch.shift();
      if (visited.has(tile.id)) {
        continue;
      } else {
        visited.add(tile.id);
      }
      const distance = startTile.distanceTo(tile);
      if (distance > maxDistance) continue;
      tilesToSearch.push(...this.getTileNeighbors(tile.x, tile.y));
      if (filter(tile)) {
        return tile;
      }
    }
    return null;
  }
  getTileNeighbors(x, y) {
    const neighbors = [];
    if (x > 0) {
      neighbors.push(this.getTile(x - 1, y));
    }
    if (x < this.size - 1) {
      neighbors.push(this.getTile(x + 1, y));
    }
    if (y > 0) {
      neighbors.push(this.getTile(x, y - 1));
    }
    if (y < this.size - 1) {
      neighbors.push(this.getTile(x, y + 1));
    }
    return neighbors;
  }
}