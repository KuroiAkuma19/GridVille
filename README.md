# 🏙️ GridVille

> A lightweight, low-poly isometric city builder built for the modern web.

GridVille is a beautifully optimized, browser-based city simulation game. Step into the shoes of the Mayor to zone residential and commercial districts, build power plants, pave roads, and watch your tiny metropolis grow into a sprawling city—all rendered in buttery smooth 3D directly in your browser.

## ✨ Features

- **Isometric 3D Engine**: Built with Three.js for a clean, low-poly aesthetic and fluid camera controls.
- **Dynamic Simulation**: Your city lives and breathes. Power lines connect your grid, citizens move in, and commercial zones thrive based on proximity and power.
- **Progression System**: Complete Mayor Tasks to earn XP, level up, and unlock new building types.
- **Save Anywhere**: Instantly export your city as a `.json` save code and import it anywhere to pick up right where you left off—no accounts required!
- **Highly Optimized**: Intelligent asset management, shared material instancing, and optimized raycasting ensure the game runs smoothly even on lower-end hardware.

## 🚀 Getting Started (Local Development)

To run the game locally on your machine, you'll need [Node.js](https://nodejs.org/) installed.

1. Clone this repository
2. Open your terminal and navigate to the project folder
3. Run the following commands:

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

4. Open your browser to `http://localhost:3000` (or the port specified in your terminal).

## 🌐 Deployment (GitHub Pages)

GridVille is a fully static client-side application (built with Vite), making it incredibly easy to host for free on GitHub Pages!

1. Push your code to a GitHub repository.
2. In your repository settings, navigate to **Pages**.
3. Under **Build and deployment**, set the source to **GitHub Actions**.
4. GitHub will automatically detect that it's a Vite project and guide you through a quick deployment action. 
5. Your city-builder will be live for the world to play!

## 🛠️ Built With

- **[Three.js](https://threejs.org/)** - 3D Rendering Engine
- **[Vite](https://vitejs.dev/)** - Frontend Build Tool
- **HTML/CSS/JS** - Zero heavy frontend frameworks, pure vanilla magic

---
*Based on the original SimCity Three.js concepts.*
