export const TaskGenerator = {
  getInitialTasks: () => {
    return [
      { id: 'pop_50', type: 'population', target: 50, title: 'Boomtown', description: 'Reach a population of 50.', xp: 200 },
      { id: 'money_15k', type: 'money', target: 15000, title: 'Rolling in Dough', description: 'Have $15,000 in the bank.', xp: 150 },
      { id: 'happy_80', type: 'happiness', target: 80, title: 'Utopia', description: 'Reach 80% Happiness.', xp: 300 }
    ];
  },
  
  generateNextTask: (completedTask) => {
    if (completedTask.type === 'population') {
      let nextTarget = completedTask.target * 2;
      if (nextTarget === 100) nextTarget = 100;
      else if (nextTarget === 200) nextTarget = 250;
      else if (nextTarget === 500) nextTarget = 500;
      else nextTarget = Math.ceil(completedTask.target * 1.5 / 100) * 100;
      
      return {
        id: `pop_${nextTarget}`,
        type: 'population',
        target: nextTarget,
        title: `Growing City`,
        description: `Reach a population of ${nextTarget}.`,
        xp: Math.min(nextTarget * 2, 5000)
      };
    }
    
    if (completedTask.type === 'money') {
      const nextTarget = completedTask.target * 2;
      return {
        id: `money_${nextTarget}`,
        type: 'money',
        target: nextTarget,
        title: `Tycoon`,
        description: `Have $${nextTarget.toLocaleString()} in the bank.`,
        xp: Math.min(Math.floor(nextTarget * 0.02), 5000)
      };
    }
    
    if (completedTask.type === 'happiness') {
       if (completedTask.target < 95) {
          const nextTarget = completedTask.target + 5;
          return {
             id: `happy_${nextTarget}`,
             type: 'happiness',
             target: nextTarget,
             title: `Absolute Bliss`,
             description: `Reach ${nextTarget}% Happiness.`,
             xp: nextTarget * 10
          }
       }
    }
    
    return null;
  },
  
  checkTask: (task, city) => {
    if (task.type === 'population') return city.population >= task.target;
    if (task.type === 'money') return city.money >= task.target;
    if (task.type === 'happiness') return city.happiness >= task.target;
    return false;
  }
};
