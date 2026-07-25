import * as THREE from 'three';
import { VehicleGraphTile } from './vehicleGraphTile.js';
import { VehicleGraphHelper } from './vehicleGraphHelper.js';
import config from '../../config.js';
import { Vehicle } from './vehicle.js';
import { Road } from '../buildings/transportation/road.js';
export class VehicleGraph extends THREE.Group {
  constructor(size) {
    super();
    this.size = size;
    this.tiles = [];
    this.vehicles = new THREE.Group();
    this.add(this.vehicles);
    this.helper = new VehicleGraphHelper();
    this.add(this.helper);
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        column.push(null);
      }
      this.tiles.push(column);
    }
    this.helper.refreshView(this);
    setInterval(this.spawnVehicle.bind(this), config.vehicle.spawnInterval);
  }
  updateVehicles() {
    for (const vehicle of this.vehicles.children) {
      vehicle.simulate();
    }
  }
  updateTile(x, y, road) {
    const existingTile = this.getTile(x, y);
    const leftTile = this.getTile(x - 1, y);
    const rightTile = this.getTile(x + 1, y);
    const topTile = this.getTile(x, y - 1);
    const bottomTile = this.getTile(x, y + 1);
    existingTile?.disconnectAll();
    leftTile?.getWorldRightSide()?.out?.disconnectAll();
    rightTile?.getWorldLeftSide()?.out?.disconnectAll();
    topTile?.getWorldBottomSide()?.out?.disconnectAll();
    bottomTile?.getWorldTopSide()?.out?.disconnectAll();
    if (road) {
      const tile = VehicleGraphTile.create(x, y, road.rotation.y, road.style);
      if (leftTile) {
        tile.getWorldLeftSide().out?.connect(leftTile.getWorldRightSide().in);
        leftTile.getWorldRightSide().out?.connect(tile.getWorldLeftSide().in);
      }
      if (rightTile) {
        tile.getWorldRightSide().out?.connect(rightTile.getWorldLeftSide().in);
        rightTile.getWorldLeftSide().out?.connect(tile.getWorldRightSide().in);
      }
      if (topTile) {
        tile.getWorldTopSide().out?.connect(topTile.getWorldBottomSide().in);
        topTile.getWorldBottomSide().out?.connect(tile.getWorldTopSide().in);
      }
      if (bottomTile) {
        tile.getWorldBottomSide().out?.connect(bottomTile.getWorldTopSide().in);
        bottomTile.getWorldTopSide().out?.connect(tile.getWorldBottomSide().in);
      }
      this.tiles[x][y] = tile;
      this.add(tile);      
    } else {
      this.tiles[x][y] = null;
    }
    this.helper.refreshView(this);
  }
  getTile(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.tiles[x][y];
    } else {
      return null;
    }
  }
  spawnVehicle() {
    const startingTile = this.getStartingTile();
    if (startingTile != null) {
      const origin = startingTile.getRandomNode();
      const destination = origin?.getRandomNextNode();
      if (origin && destination) {
        const vehicle = new Vehicle(origin, destination);
        this.vehicles.add(vehicle);
      }
    }
  }
  getStartingTile() {
    const tiles = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        let tile = this.getTile(x, y);
        if (tile) tiles.push(tile);
      }
    }
    if (tiles.length === 0) {
      return null;
    } else {
      const i = Math.floor(tiles.length * Math.random());
      return tiles[i];
    }
  }
}