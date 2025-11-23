# 🛡️ DDoS Defender

A cybersecurity-themed tower defense game built with **Vue 3**, **TypeScript**, and **HTML5 Canvas**.

> **Current Version**: 0.8.5 (Phase 11 - UI/UX Complete)  
> **Status**: Feature-complete gameplay with professional UI/UX system

---

## 🎮 About

DDoS Defender is a strategic tower defense game where you protect your server infrastructure from waves of network attacks. Build and upgrade security towers, manage your resources, and survive increasingly difficult attack waves.

### 🌟 Key Features

- **8 Unique Security Towers**: From Firewalls to AI Defenders, each with distinct abilities
- **4 Attack Types**: Face DDoS floods, malware packets, botnets, and boss attacks
- **Tower Progression**: Towers gain experience and level up through combat
- **Special Buff System**: CODE_FARMER (passive income), SUPERVISOR (attack speed), SYSTEM_ANALYST (range)
- **Professional UI**: Main menu, pause system, settings, and in-game guide
- **Full Audio System**: Background music and sound effects for all actions
- **Wave-based Gameplay**: 30+ waves with progressive difficulty and boss battles

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd DDoS-Defender-Game

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 🎯 How to Play

1. **Place Towers**: Click on green grid cells to place security towers
2. **Manage Resources**: Earn gold by defeating enemies and use it wisely
3. **Upgrade Strategically**: Click towers to view stats and sell/upgrade options
4. **Survive Waves**: Each wave gets progressively harder - plan ahead!
5. **Buff System**: Use CODE_FARMER for income, SUPERVISOR/ANALYST for combat boosts

### Controls
- **Click**: Place towers, select UI elements
- **ESC**: Pause/Resume game
- **Speed Settings**: Adjust game speed from settings (1x/2x/3x)

---

## 🏗️ Project Structure

```
src/
├── components/          # Vue components (GameCanvas, PauseMenu, etc.)
├── views/              # Router views (MainMenu, GameView, Settings, Guide)
├── game/               # Game systems
│   ├── managers/       # GridManager, TowerManager, WaveManager, etc.
│   ├── entities/       # Tower, Enemy, Projectile classes
│   └── systems/        # ExperienceSystem, BuffSystem, AudioManager
├── config/             # Game configuration (towers, buffs, audio, etc.)
├── router/             # Vue Router setup
└── assets/             # Audio files, images, data (maps, waves)
```

---

## 📚 Documentation

- **[Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)** - Detailed phase-by-phase development progress
- **[Game Flow & Mechanics](docs/design/game-flow.md)** - How the game works
- **[Buff System Specification](docs/specs/buff-system.md)** - How tower buffs work
- **[Enemy Specifications](docs/specs/enemy-stats.md)** - Enemy types and behaviors
- **[Tower Specifications](docs/specs/tower-stats.md)** - Complete tower stats and mechanics
- **[Wave Configuration and Design](docs/specs/wave-config.md)** - Wave configuration and progression
- **[Wave Types and Spawn Schedules](docs/specs/wave-types.md)** - Wave types and spawn schedules

---

## 🎨 Tech Stack

- **Frontend**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas 2D
- **Routing**: Vue Router 4
- **Build Tool**: Vite
- **State Management**: Vue Reactive (lightweight)
- **Audio**: Web Audio API with custom AudioManager

---

## 🔧 Development Status

### ✅ Completed Phases
- **Phase 1-6**: MVP (Basic infrastructure, gameplay, content)
- **Phase 7**: Wave system enhancement
- **Phase 8**: Tower enhancements (upgrades, selling, buffs)
- **Phase 9**: Enemy rewards system
- **Phase 11**: UI/UX improvements (main menu, pause, settings, guide)
- **Phase 12**: Audio system (BGM, SFX, volume controls)
- **Phase 13**: Configuration management

### 🚧 Upcoming
- **Game Speed Control**: Implement speed multiplier in game loop
- **Phase 10**: Grid enhancements (blocked cells, spawn markers)
- **Phase 14**: Testing & QA setup

See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for detailed progress tracking.

---

## 🤝 Contributing

This is a personal learning project, but feedback and suggestions are welcome!

---

**Enjoy defending your servers!** 🛡️⚡
