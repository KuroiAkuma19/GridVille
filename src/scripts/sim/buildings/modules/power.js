import { SimModule } from './simModule.js';
export class PowerModule extends SimModule {
  supplied = 0;
  required = 0;
  constructor(powerRequired) {
    super();
    this.required = this.supplied;
  }
  get isFullyPowered () {
    return this.supplied >= this.required;
  }
}