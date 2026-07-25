import { Game } from './game';
import { SimObject } from './sim/simObject';
import playIconUrl from '/icons/play-color.png';
import pauseIconUrl from '/icons/pause-color.png';
import models from './assets/models.js';
export class GameUI {
  activeToolId = 'select';
  selectedControl = document.getElementById('button-select');
  isPaused = false;
  get gameWindow() {
    return document.getElementById('render-target');
  }
  showLoadingText() {
    document.getElementById('loading').style.visibility = 'visible';
  }
  hideLoadingText() {
    document.getElementById('loading').style.visibility = 'hidden';
  }
  onToolSelected(event) {
    if (this.selectedControl) {
      this.selectedControl.classList.remove('selected');
    }
    this.selectedControl = event.target;
    this.selectedControl.classList.add('selected');
    const newToolId = this.selectedControl.getAttribute('data-type');
    if (['residential', 'commercial', 'industrial'].includes(newToolId)) {
      this.showCatalog(newToolId);
    } else {
      this.activeToolId = newToolId;
      document.getElementById('catalog-panel').style.display = 'none';
      document.getElementById('tasks-panel').style.display = 'none';
    }
  }
  showCatalog(category) {
    document.getElementById('tasks-panel').style.display = 'none';
    const catalog = document.getElementById('catalog-panel');
    const catalogItems = document.getElementById('catalog-items');
    catalog.style.display = 'block';
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('catalog-title').innerText = title + ' Buildings';
    catalogItems.innerHTML = '';
    let firstItemClicked = false;
    
    let items = Object.entries(models).filter(([id, data]) => data.type === category && id !== 'under-construction');
    items.sort((a, b) => {
       const lvlA = a[1].unlockLevel || 1;
       const lvlB = b[1].unlockLevel || 1;
       if (lvlA !== lvlB) return lvlA - lvlB;
       return (a[1].cost || 0) - (b[1].cost || 0);
    });

    for (const [id, data] of items) {
          const isLocked = data.unlockLevel && window.game.city.level < data.unlockLevel;
          const item = document.createElement('div');
          item.className = 'catalog-item';
          if (isLocked) {
             item.style.opacity = '0.5';
             item.style.cursor = 'not-allowed';
          }
          item.innerHTML = `
            <div class="item-title">${data.title}</div>
            <div class="item-cost">Cost: $${data.cost || 0}</div>
            ${data.income ? `<div class="item-income">Income: $${data.income}/mo</div>` : ''}
            ${isLocked ? `<div style="color: #ff4444; font-size: 0.9em; margin-top: 5px;">🔓 Unlocks at LVL ${data.unlockLevel}</div>` : ''}
          `;
          item.onclick = () => {
             if (isLocked) {
                 this.showXpToast(`LOCKED! Reach LVL ${data.unlockLevel}`);
                 return;
             }
             this.activeToolId = id;
             Array.from(catalogItems.children).forEach(child => {
                child.style.outline = 'none';
             });
             item.style.outline = '2px solid #81b1e0';
          };
          catalogItems.appendChild(item);
          if (!firstItemClicked) {
             item.onclick();
             firstItemClicked = true;
          }
       }
  }
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      document.getElementById('pause-button-icon').src = playIconUrl;
      document.getElementById('paused-text').style.visibility = 'visible';
    } else {
      document.getElementById('pause-button-icon').src = pauseIconUrl;
      document.getElementById('paused-text').style.visibility = 'hidden';
    }
  }

  toggleTasksPanel() {
    const panel = document.getElementById('tasks-panel');
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
    } else {
      document.getElementById('catalog-panel').style.display = 'none';
      panel.style.display = 'block';
      this.renderTasks();
    }
  }

  renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    const city = window.game.city;
    
    
    for (const task of city.activeTasks) {
       const item = document.createElement('div');
       item.style.backgroundColor = '#334155';
       item.style.padding = '10px';
       item.style.borderRadius = '6px';
       item.style.color = 'white';
       item.style.border = '1px solid #475569';
       
       item.innerHTML = `
         <div style="font-weight: normal; font-size: 1.1em; margin-bottom: 4px; display: flex; justify-content: space-between;">
           <span>${task.title}</span>
           <span style="color: #fbbf24;">+${task.xp} XP</span>
         </div>
         <div style="font-size: 0.9em; color: #cbd5e1;">
           ${task.description}
         </div>
       `;
       list.appendChild(item);
    }

    
    if (city.taskHistory.length > 0) {
       const separator = document.createElement('div');
       separator.innerHTML = '<hr style="border-color: #4a5568; margin-top: 10px;">';
       list.appendChild(separator);
       
       for (const task of city.taskHistory) {
         const item = document.createElement('div');
         item.style.backgroundColor = '#064e3b';
         item.style.padding = '10px';
         item.style.borderRadius = '6px';
         item.style.color = 'white';
         item.style.border = '1px solid #10b981';
         
         item.innerHTML = `
           <div style="font-weight: normal; font-size: 1.1em; margin-bottom: 4px; display: flex; justify-content: space-between;">
             <span style="text-decoration: line-through; opacity: 0.8">${task.title}</span>
             <span style="color: #34d399;">✓</span>
           </div>
         `;
         list.appendChild(item);
       }
    }
  }

  setupStartScreen(game) {
    document.getElementById('start-game-button').addEventListener('click', () => {
      const cityName = document.getElementById('city-name-input').value;
      const playerName = document.getElementById('player-name-input').value;
      if (cityName) {
        game.city.name = cityName;
      }
      if (playerName) {
        game.city.playerName = playerName;
        game.city.playerTag = '#' + Math.floor(1000 + Math.random() * 9000);
      }
      document.getElementById('start-screen').style.display = 'none';
      if (this.isPaused) {
        this.togglePause();
      }
    });
  }
  updateTitleBar(game) {
    document.getElementById('city-name').innerHTML = game.city.name;
    document.getElementById('population-counter').innerHTML = game.city.population;
    document.getElementById('money-counter').innerHTML = game.city.money;
    document.getElementById('happiness-counter').innerHTML = game.city.happiness;
    
    document.getElementById('player-name').innerHTML = game.city.playerName;
    document.getElementById('player-tag').innerHTML = game.city.playerTag;
    document.getElementById('player-level').innerHTML = game.city.level;
    
    let currentXp = game.city.xp;
    let neededXp = game.city.level * 100;
    document.getElementById('xp-current').innerHTML = currentXp;
    document.getElementById('xp-needed').innerHTML = neededXp;
    document.getElementById('xp-bar-fill').style.width = `${(currentXp / neededXp) * 100}%`;
    
    const date = new Date('1/1/2023');
    date.setDate(date.getDate() + game.city.simTime);
    document.getElementById('sim-time').innerHTML = date.toLocaleDateString();
  }

  showXpToast(msg) {
    const toast = document.getElementById('xp-toast');
    if (!toast) return;
    toast.innerHTML = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, -20px)';
    
    if (this.xpTimeout) clearTimeout(this.xpTimeout);
    
    this.xpTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 0)';
    }, 1500);
  }
  updateInfoPanel(object) {
    const infoElement = document.getElementById('info-panel')
    if (object) {
      infoElement.style.visibility = 'visible';
      infoElement.innerHTML = object.toHTML();
    } else {
      infoElement.style.visibility = 'hidden';
      infoElement.innerHTML = '';
    }
  }
  saveCity() {
    const data = window.game.city.toJSON();
    localStorage.setItem('simcity_save', JSON.stringify(data));
    console.log('City saved!');
    alert('City saved successfully!');
  }
  loadCity(fromStartScreen = false) {
    const dataStr = localStorage.getItem('simcity_save');
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        window.game.city.load(data);
        console.log('City loaded!');
        if (fromStartScreen) {
           document.getElementById('start-screen').style.display = 'none';
           if (this.isPaused) this.togglePause();
        } else {
           alert('City loaded successfully!');
        }
      } catch (e) {
        console.error('Failed to load city', e);
        alert('Failed to load save data.');
      }
    } else {
      alert('No save data found.');
    }
  }

  exportSave() {
    const data = window.game.city.toJSON();
    const dataStr = JSON.stringify(data);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${window.game.city.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_save.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('City exported!');
  }

  importSave(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        window.game.city.load(data);
        localStorage.setItem('simcity_save', JSON.stringify(data));
        console.log('City imported!');
        document.getElementById('start-screen').style.display = 'none';
        if (this.isPaused) this.togglePause();
      } catch (err) {
        console.error('Failed to import city', err);
        alert('Invalid save file!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
}
window.ui = new GameUI();