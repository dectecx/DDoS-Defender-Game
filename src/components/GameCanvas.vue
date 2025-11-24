<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { GridManager } from '../game/GridManager';
import { EnemyManager } from '../game/EnemyManager';
import { TowerManager } from '../game/TowerManager';
import { ProjectileManager } from '../game/ProjectileManager';
import { InteractionManager } from '../game/InteractionManager';
import { WaveManager } from '../game/WaveManager';
import { gameState, GameActions } from '../game/GameState';
import { EnemyType, TowerType } from '../game/types';
import type { Tower } from '../game/types';
import level1 from '../game/levels/level1.json';
import WaveTransition from './WaveTransition.vue';
import TowerInfoPanel from './TowerInfoPanel.vue';
import PauseMenu from './PauseMenu.vue';
import TopStatusBar from './TopStatusBar.vue';
import TowerBuildPanel from './TowerBuildPanel.vue';
import GameOverModal from './GameOverModal.vue';
import { audioManager, SoundEffect, BackgroundMusic } from '../game/AudioManager';
import { GameConfig } from '../config/game.config';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number;

// Systems
let gridManager: GridManager | null = null;
let enemyManager: EnemyManager | null = null;
let towerManager: TowerManager | null = null;
let projectileManager: ProjectileManager | null = null;
let interactionManager: InteractionManager | null = null;
let waveManager: WaveManager | null = null;

let lastTime = 0;
let incomeAccumulator = 0; // For passive income accumulation
let audioStarted = false; // Track if audio has been started (browser autoplay policy)

// UI State
const selectedTower = ref<TowerType | null>(null);
const isPaused = ref(false);
const gameSpeed = ref(1); // Game speed multiplier: 1x, 2x, or 3x

// Wave Transition State
const showWaveTransition = ref(false);
const currentWaveRewards = ref({ baseGold: 0, bonusGold: 0 });
const waveTimeout = ref(30000);
const completedWaveNum = ref(0);

// Tower Info Panel State
const showTowerInfo = ref(false);
const selectedTowerForInfo = ref<Tower | null>(null);

// Dynamic pricing tracking (updated when towers are built/sold)
const codeFarmerCount = ref(0);

const codeFarmerCost = computed(() => {
  return 250 + (codeFarmerCount.value * 100);
});

const passiveIncomeRate = computed(() => {
  return codeFarmerCount.value * 5;
});

// Reactive refs for wave enemy tracking (updated in draw loop)
const totalEnemiesInWave = ref(0);
const currentEnemyCount = ref(0);

// Helper to update CODE_FARMER count
const updateCodeFarmerCount = () => {
  if (towerManager) {
    codeFarmerCount.value = towerManager.towers.filter(t => t.type === TowerType.CODE_FARMER).length;
  }
};

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  draw();
};

const handleCanvasClick = (event: MouseEvent) => {
  if (!interactionManager || !canvasRef.value || !towerManager) return;
  
  // Start audio on first user interaction (browser autoplay policy)
  if (!audioStarted) {
    audioManager.playBGM(BackgroundMusic.GAMEPLAY);
    audioStarted = true;
  }
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  if (!selectedTower.value) return;
  const result = interactionManager.handleClick(x, y, selectedTower.value);
  
  if (result) {
    if (result.action === 'BUILD') {
      towerManager.addTower(result.x, result.y, result.type);
      audioManager.playSFX(SoundEffect.TOWER_BUILD);
      
      // Update CODE_FARMER count for dynamic UI
      if (result.type === TowerType.CODE_FARMER) {
        updateCodeFarmerCount();
      }
    } else if (result.action === 'SELECT') {
      const tower = towerManager.getTowerAt(result.x, result.y);
      if (tower) {
        selectedTowerForInfo.value = tower;
        showTowerInfo.value = true;
      }
    }
  }
};

const draw = () => {
  if (!ctx || !canvasRef.value || !gridManager || !enemyManager || !towerManager || !projectileManager) return;
  
  // Update reactive enemy counts from WaveManager
  if (waveManager) {
    totalEnemiesInWave.value = waveManager.totalEnemiesInWave;
  }
  if (enemyManager) {
    currentEnemyCount.value = enemyManager.enemies.length;
  }
  
  // Clear screen
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // Draw Systems
  gridManager.draw(ctx);
  
  // Draw path markers (spawn and base indicators)
  if (gridManager) {
    gridManager.drawPathMarkers(ctx, performance.now());
  }
  
  towerManager.draw(ctx);
  enemyManager.draw(ctx);
  projectileManager.draw(ctx);
  
  // Draw range indicator for selected tower
  if (selectedTowerForInfo.value) {
    towerManager.drawRangeIndicator(ctx, selectedTowerForInfo.value.id);
  }
  
  
  if (gameState.isGameOver) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM OFFLINE (GAME OVER)', canvasRef.value.width / 2, canvasRef.value.height / 2);
    ctx.textAlign = 'left';
  } else if (gameState.isVictory) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('THREAT MITIGATED (VICTORY)', canvasRef.value.width / 2, canvasRef.value.height / 2);
    ctx.textAlign = 'left';
  }
};

const loop = (timestamp: number) => {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (!gameState.isGameOver && !gameState.isVictory && !isPaused.value) {
    // Apply game speed multiplier to deltaTime
    const adjustedDeltaTime = deltaTime * gameSpeed.value;
    
    // Update game systems with adjusted deltaTime
    if (waveManager) waveManager.update(adjustedDeltaTime);
    if (enemyManager) enemyManager.update(adjustedDeltaTime);
    if (projectileManager) projectileManager.update(adjustedDeltaTime);
    if (towerManager) {
      towerManager.update(adjustedDeltaTime, timestamp);
      
      // CODE_FARMER passive income (accumulate to handle fractional gold per frame)
      const passiveIncomePerSec = towerManager.buffSystem.getPassiveIncome();
      if (passiveIncomePerSec > 0) {
        incomeAccumulator += passiveIncomePerSec * adjustedDeltaTime;
        
        // Award whole gold amounts
        const goldToAdd = Math.floor(incomeAccumulator);
        if (goldToAdd > 0) {
          GameActions.addMoney(goldToAdd);
          incomeAccumulator -= goldToAdd;
        }
      }
    }
  }

  draw();
  animationFrameId = requestAnimationFrame(loop);
};

onMounted(() => {
  // Load game speed from localStorage
  const savedSpeed = localStorage.getItem('gameSpeed');
  if (savedSpeed) {
    gameSpeed.value = parseInt(savedSpeed);
  }
  
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    
    // Initialize Systems
    gridManager = new GridManager({ 
      width: GameConfig.grid.width, 
      height: GameConfig.grid.height, 
      cellSize: GameConfig.grid.cellSize 
    });
    gridManager.initialize(level1.mapLayout);
    enemyManager = new EnemyManager(gridManager);
    projectileManager = new ProjectileManager(enemyManager);
    towerManager = new TowerManager(gridManager, enemyManager, projectileManager);
    interactionManager = new InteractionManager(gridManager);
    waveManager = new WaveManager(enemyManager);

    // Set up circular dependencies (let EnemyManager access TowerManager for Boss skill)
    enemyManager.setTowerManager(towerManager);
    
    // Set up ProjectileManager -> TowerManager for experience awards
    projectileManager.setTowerManager(towerManager);
    
    // Set up InteractionManager -> TowerManager for dynamic costs
    interactionManager.setTowerManager(towerManager);

    // Set up wave transition callback
    waveManager.onWaveTransitionStart = (wave, rewards, timeout) => {
      completedWaveNum.value = wave;
      currentWaveRewards.value = rewards;
      waveTimeout.value = timeout;
      showWaveTransition.value = true;
    };

    window.addEventListener('resize', resizeCanvas);
    canvasRef.value.addEventListener('click', handleCanvasClick);
    window.addEventListener('keydown', handleKeyPress);
    
    resizeCanvas();
    requestAnimationFrame(loop);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('keydown', handleKeyPress);
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('click', handleCanvasClick);
  }
  cancelAnimationFrame(animationFrameId);
});

/**
 * Handle wave transition - called when user clicks "Start Next Wave"
 */
const handleWaveTransitionComplete = (bonusGold: number) => {
  showWaveTransition.value = false;
  if (waveManager) {
    waveManager.startNextWave(bonusGold);
    audioManager.playSFX(SoundEffect.WAVE_START);
  }
};

/**
 * Handle tower info panel close
 */
const handleTowerInfoClose = () => {
  showTowerInfo.value = false;
  selectedTowerForInfo.value = null;
};

/**
 * Handle tower sell
 */
const handleTowerSell = (towerId: string) => {
  if (!towerManager) return;
  
  const tower = towerManager.towers.find(t => t.id === towerId);
  const wasFarmer = tower?.type === TowerType.CODE_FARMER;
  
  const refund = towerManager.sellTower(towerId);
  if (refund > 0) {
    GameActions.addMoney(refund);
    audioManager.playSFX(SoundEffect.TOWER_SELL);
    console.log(`Tower sold for ${refund}g`);
    
    // Update CODE_FARMER count for dynamic UI
    if (wasFarmer) {
      updateCodeFarmerCount();
    }
  }
  
  showTowerInfo.value = false;
  selectedTowerForInfo.value = null;
};

// Pause functionality
const togglePause = () => {
  if (!gameState.isGameOver && !gameState.isVictory) {
    isPaused.value = !isPaused.value;
    
    // Play pause/resume sound effect
    if (isPaused.value) {
      audioManager.playSFX(SoundEffect.GAME_PAUSE);
    } else {
      audioManager.playSFX(SoundEffect.GAME_RESUME);
    }
  }
};

// Game speed control
const setGameSpeed = (speed: number) => {
  gameSpeed.value = speed;
  localStorage.setItem('gameSpeed', speed.toString());
};

// Handle restart from Game Over modal
const handleRestart = () => {
  // Reload the page to restart game completely
  window.location.reload();
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    togglePause();
  }
};
</script>

<template>
  <div class="game-container">
    <!-- Top Status Bar -->
    <TopStatusBar
      v-if="!gameState.isGameOver && !gameState.isVictory"
      :totalWaves="level1.waves.length"
      :currentWaveEnemies="currentEnemyCount"
      :totalWaveEnemies="totalEnemiesInWave"
      :passiveIncome="passiveIncomeRate"
      :isPaused="isPaused"
      :gameSpeed="gameSpeed"
      @togglePause="togglePause"
      @setSpeed="setGameSpeed"
    />

    <!-- Main Canvas -->
    <canvas ref="canvasRef" class="game-canvas"></canvas>
    
    <!-- Wave Transition Overlay -->
    <WaveTransition 
      :show="showWaveTransition"
      :completedWave="completedWaveNum"
      :baseGold="currentWaveRewards.baseGold"
      :maxBonusGold="currentWaveRewards.bonusGold"
      :timeoutDuration="waveTimeout"
      @startNextWave="handleWaveTransitionComplete"
    />
    
    <!-- Tower Info Panel -->
    <TowerInfoPanel
      :show="showTowerInfo"
      :tower="selectedTowerForInfo"
      :towerManager="towerManager"
      @close="handleTowerInfoClose"
      @sell="handleTowerSell"
    />
    
    <!-- Pause Menu -->
    <PauseMenu
      :show="isPaused"
      @resume="togglePause"
    />
    
    <!-- Game Over Modal -->
    <GameOverModal
      :show="gameState.isGameOver || gameState.isVictory"
      :isVictory="gameState.isVictory"
      :wave="gameState.wave"
      :score="gameState.money"
      @restart="handleRestart"
    />
    
    <!-- Tower Build Panel -->
    <TowerBuildPanel
      v-if="!gameState.isGameOver && !gameState.isVictory"
      :selectedTower="selectedTower"
      :codeFarmerCost="codeFarmerCost"
      @selectTower="selectedTower = $event"
    />
  </div>
</template>

<style scoped>
.game-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.ui-overlay {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #00ff00;
}

.pause-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  border: 2px solid #00ff00;
  padding: 10px 20px;
  cursor: pointer;
  font-family: monospace;
  font-weight: bold;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pause-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

.tower-selection {
  display: flex;
  gap: 10px;
}

button {
  background: #1a1a1a;
  color: #00ff00;
  border: 1px solid #00ff00;
  padding: 8px 16px;
  cursor: pointer;
  font-family: monospace;
  font-weight: bold;
  transition: all 0.2s;
}

button:hover {
  background: #003300;
}

button.active {
  background: #00ff00;
  color: #000;
}

.buff-tower {
  border-color: #ffd700 !important;
  background: rgba(255, 215, 0, 0.1) !important;
}

.buff-tower.active {
  background: #ffd700 !important;
  color: #000 !important;
}

.income-display {
  margin-top: 10px;
  padding: 8px 16px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid #ffd700;
  border-radius: 4px;
  color: #ffd700;
  font-family: monospace;
  font-weight: bold;
  text-align: center;
}

.speed-control {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.speed-label {
  font-family: monospace;
  color: #00d4ff;
  font-weight: bold;
  font-size: 14px;
}

.speed-btn-game {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  border: 2px solid #00d4ff;
  padding: 6px 12px;
  cursor: pointer;
  font-family: monospace;
  font-weight: bold;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 40px;
}

.speed-btn-game:hover {
  background: rgba(0, 212, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.speed-btn-game.active {
  background: #00d4ff;
  color: #000;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
}
</style>
