export default {
  modules: {
    development: {
      abandonThreshold: 10,     
      abandonChance: 0.25,  
      constructionTime: 3,
      levelUpChance: 0.05,
      redevelopChance: 0.25,         
    },
    jobs: {
      maxWorkers: 2,       
    },
    residents: {
      maxResidents: 2,         
      residentMoveInChance: 0.5,
    },
    roadAccess: {
      searchDistance: 3       
    },
  },
  citizen: {
    minWorkingAge: 16,       
    retirementAge: 65,       
    maxJobSearchDistance: 4   
  },
  vehicle: {
    speed: 0.0005,            
    fadeTime: 500,  
    maxLifetime: 10000,
    spawnInterval: 1000     
  },
}
