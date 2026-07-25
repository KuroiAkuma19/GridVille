import fs from 'fs';
import models from './src/scripts/assets/models.js';

for (const [key, model] of Object.entries(models)) {
  const name = key.toLowerCase();
  
  if (model.type === 'commercial' || model.type === 'industrial' || model.type === 'residential') {
    // Basic defaults
    let cost = 1000;
    let income = 100;
    
    // Props
    if (name.includes('bench') || name.includes('bike') || name.includes('basketball') || name.includes('balloon') || name.includes('atm') || name.includes('prop')) {
       cost = 50;
       income = 10;
    } 
    // Billboards/Signs
    else if (name.includes('billboard') || name.includes('sign') || name.includes('kiosk') || name.includes('food')) {
       cost = 200;
       income = 20;
    }
    // Very small shops
    else if (name.includes('shop') || name.includes('store') || name.includes('pizza') || name.includes('laundry')) {
       cost = 1000;
       income = 150;
    }
    // Normal buildings
    else if (name.includes('building') || name.includes('factory') || name.includes('office') || name.includes('house') || name.includes('apartments') || name.includes('mansion')) {
       cost = 5000;
       income = 500;
    }
    // Large infrastructure
    else if (name.includes('hospital') || name.includes('airport') || name.includes('stadium') || name.includes('university') || name.includes('ferry') || name.includes('power') || name.includes('mall') || name.includes('skyscraper') || name.includes('tower') || name.includes('bank') || name.includes('police')) {
       cost = 25000;
       income = 2000;
    }
    // Default fallback
    else {
       cost = 1000;
       income = 100;
    }

    model.cost = cost;
    model.income = income;
  }
}

// Convert back to export default string
const output = `export default ${JSON.stringify(models, null, 2)};\n`;
fs.writeFileSync('./src/scripts/assets/models.js', output);
console.log('Successfully updated models.js');
