import { CommercialZone } from './buildings/zones/commercial.js';
import { IndustrialZone } from './buildings/zones/industrial.js';
import { ResidentialZone } from './buildings/zones/residential.js';
import config from '../config.js';
export class Citizen {
  constructor(residence) {
    this.id = crypto.randomUUID();
    this.name = generateRandomName();
    this.age = 1 + Math.floor(100*Math.random());
    this.state = 'idle';
    this.stateCounter = 0;
    this.residence = residence;
    this.workplace = null;
    this.#initializeState();
  }
  #initializeState() {
    if (this.age < config.citizen.minWorkingAge) {
      this.state = 'school';
    } else if (this.age >= config.citizen.retirementAge) {
      this.state = 'retired';
    } else {
      this.state = 'unemployed';
    }
  }
  simulate(city) {
    switch (this.state) {
      case 'idle':
      case 'school':
      case 'retired':
        break;
      case 'unemployed':
        this.workplace = this.#findJob(city);
        if (this.workplace) {
          this.state = 'employed';
        }
        break;
      case 'employed':
        if (!this.workplace) {
          this.state = 'unemployed';
        }
        break;
      default:
        console.error(`Citizen ${this.id} is in an unknown state (${this.state})`);
    }
  }
  dispose() {
    const workerIndex = this.workplace?.jobs.workers.indexOf(this);
    if (workerIndex !== undefined && workerIndex > -1) {
      this.workplace.jobs.workers.splice(workerIndex);
    }
  }
  #findJob(city) {
    const tile = city.findTile(this.residence, (tile) => {
      if (tile.building?.type === 'industrial' || 
          tile.building?.type === 'commercial') {
        if (tile.building.jobs.availableJobs > 0) {
          return true;
        }
      }
      return false;
    }, config.citizen.maxJobSearchDistance);
    if (tile) {
      tile.building.jobs.workers.push(this);
      return tile.building;
    } else {
      return null;
    }
  }
  setWorkplace(workplace) {
    this.workplace = workplace;
  }
  toHTML() {
    return `
      <li class="info-citizen">
        <span class="info-citizen-name">${this.name}</span>
        <br>
        <span class="info-citizen-details">
          <span>
            <img class="info-citizen-icon" src="./icons/calendar.png">
            ${this.age} 
          </span>
          <span>
            <img class="info-citizen-icon" src="./icons/job.png">
            ${this.state}
          </span>
        </span>
      </li>
    `;
  }
}
function generateRandomName() {
  const firstNames = [
    'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella',
    'Liam', 'Noah', 'William', 'James', 'Benjamin',
    'Elizabeth', 'Margaret', 'Alice', 'Dorothy', 'Eleanor',
    'John', 'Robert', 'William', 'Charles', 'Henry',
    'Alex', 'Taylor', 'Jordan', 'Casey', 'Robin'
  ];
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Jones', 'Brown',
    'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
    'Clark', 'Lewis', 'Walker', 'Hall', 'Young',
    'Lee', 'King', 'Wright', 'Adams', 'Green'
  ];
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return randomFirstName + ' ' + randomLastName;
}