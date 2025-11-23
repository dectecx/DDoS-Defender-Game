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
const selectedTower = ref<TowerType>(TowerType.RATE_LIMIT);

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
  
  // Clear screen
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // Draw Systems
  gridManager.draw(ctx);
  towerManager.draw(ctx);
  enemyManager.draw(ctx);
  projectileManager.draw(ctx);
  
  // Draw range indicator for selected tower
  if (selectedTowerForInfo.value) {
    towerManager.drawRangeIndicator(ctx, selectedTowerForInfo.value.id);
  }
  
  // Draw UI Overlay (Canvas part)
  ctx.fillStyle = '#00ff00';
  ctx.font = '20px monospace';
  ctx.fillText('DDoS Defender - System Online', 20, 40);
  ctx.fillText(`Wave: ${gameState.wave}`, 20, 70);
  ctx.fillText(`Enemies: ${enemyManager.enemies.length}`, 20, 100);
  ctx.fillText(`Money: $${gameState.money}`, 20, 130);
  ctx.fillText(`HP: ${gameState.hp}%`, 20, 160);
  
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

  if (!gameState.isGameOver && !gameState.isVictory) {
    // Update game systems
    if (waveManager) waveManager.update(deltaTime);
    if (enemyManager) enemyManager.update(deltaTime);
    if (projectileManager) projectileManager.update(deltaTime);
    if (towerManager) {
      towerManager.update(deltaTime, timestamp);
      
      // CODE_FARMER passive income (accumulate to handle fractional gold per frame)
      const passiveIncomePerSec = towerManager.buffSystem.getPassiveIncome();
      if (passiveIncomePerSec > 0) {
        incomeAccumulator += passiveIncomePerSec * deltaTime;
        
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
    
    resizeCanvas();
    requestAnimationFrame(loop);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
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
</script>

<template>
  <div class="game-container">
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
    
    <div class="ui-overlay" v-if="!gameState.isGameOver && !gameState.isVictory">
      <div class="tower-selection">
        <button 
          :class="{ active: selectedTower === TowerType.RATE_LIMIT }"
          @click="selectedTower = TowerType.RATE_LIMIT"
        >
          Rate Limit ($100)
        </button>
        <button 
          :class="{ active: selectedTower === TowerType.WAF }"
          @click="selectedTower = TowerType.WAF"
        >
          WAF ($200)
        </button>
        <button 
          :class="{ active: selectedTower === TowerType.DPI }"
          @click="selectedTower = TowerType.DPI"
        >
          DPI ($300)
        </button>
        <button 
          :class="{ active: selectedTower === TowerType.CACHE }"
          @click="selectedTower = TowerType.CACHE"
        >
          Cache ($150)
        </button>
      </div>
      <div class="tower-selection" style="margin-top: 10px;">
        <button 
          :class="{ active: selectedTower === TowerType.CODE_FARMER }"
          @click="selectedTower = TowerType.CODE_FARMER"
          class="buff-tower"
        >
          💰 Farmer (${{ codeFarmerCost }})
        </button>
        <button 
          :class="{ active: selectedTower === TowerType.SUPERVISOR }"
          @click="selectedTower = TowerType.SUPERVISOR"
          class="buff-tower"
        >
          ⚡ Supervisor ($300)
        </button>
        <button 
          :class="{ active: selectedTower === TowerType.SYSTEM_ANALYST }"
          @click="selectedTower = TowerType.SYSTEM_ANALYST"
          class="buff-tower"
        >
          🎯 Analyst ($350)
        </button>
      </div>
      
      <!-- Passive Income Display -->
      <div v-if="passiveIncomeRate > 0" class="income-display">
        💰 Passive Income: +{{ passiveIncomeRate }}g/sec
      </div>
    </div>
    
    <!-- Tower Info Panel -->
    <TowerInfoPanel
      :show="showTowerInfo"
      :tower="selectedTowerForInfo"
      :towerManager="towerManager"
      @close="handleTowerInfoClose"
      @sell="handleTowerSell"
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
</style>
