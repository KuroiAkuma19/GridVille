import fs from 'fs';
import path from 'path';

const modelsDir = './src/public/models';
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb'));

const models = {};

function getBuildingType(filename) {
    if (filename.includes('house') || filename.includes('apartment') || filename.includes('cabin') || filename.includes('residential')) return 'residential';
    if (filename.includes('office') || filename.includes('shop') || filename.includes('cafe') || filename.includes('burger') || filename.includes('hospital') || filename.includes('casino') || filename.includes('bank') || filename.includes('stadium') || filename.includes('skyscraper') || filename.includes('market') || filename.includes('commercial')) return 'commercial';
    if (filename.includes('factory') || filename.includes('industry') || filename.includes('warehouse') || filename.includes('refinery')) return 'industrial';
    if (filename.includes('power')) return 'power';
    if (filename.includes('road') || filename.includes('intersection')) return 'road';
    if (filename.includes('car') || filename.includes('truck') || filename.includes('bus')) return 'vehicle';
    if (filename.includes('grass') || filename.includes('tree') || filename.includes('rock') || filename.includes('mountain') || filename.includes('fence')) return 'prop';
    return 'commercial'; // default to commercial if unknown building
}

files.forEach(file => {
    const id = file.replace('.glb', '');
    const type = getBuildingType(file);
    
    let cost = 100;
    let income = 0;
    let category = type;
    
    if (type === 'residential') { cost = 100; income = 10; }
    else if (type === 'commercial') { cost = 500; income = 50; }
    else if (type === 'industrial') { cost = 1000; income = 150; }
    else if (type === 'prop') { cost = 10; category = 'prop'; }
    else if (type === 'road') { cost = 10; category = 'road'; }
    else if (type === 'power') { cost = 1000; category = 'power'; }
    else if (type === 'vehicle') { cost = 0; category = 'vehicle'; }

    // Make big things more expensive
    if (file.includes('skyscraper') || file.includes('stadium') || file.includes('hospital')) {
        cost = 5000;
        income = 1000;
    }
    
    // Formatting title
    const title = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const obj = {
        type: category,
        filename: file,
        title: title
    };
    
    if (['residential', 'commercial', 'industrial'].includes(type)) {
        obj.cost = cost;
        obj.income = income;
    } else if (category === 'prop' || category === 'road' || category === 'power') {
        obj.cost = cost;
    }
    
    if (category === 'vehicle') {
        obj.rotation = 90;
    }
    
    if (category === 'road' || category === 'prop') {
        obj.castShadow = false;
    }

    models[id] = obj;
});

// Add construction model explicitly as it's a special type used by the game
models['under-construction'] = {
  type: "zone",
  filename: "construction-small.glb",
  scale: 3
};

const output = `export default ${JSON.stringify(models, null, 2)};\n`;
fs.writeFileSync('./src/scripts/assets/models.js', output);
console.log('Successfully generated models.js');
