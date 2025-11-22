<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { GridManager } from '../game/GridManager';
import { EnemyManager } from '../game/EnemyManager';
import { TowerManager } from '../game/TowerManager';
import { ProjectileManager } from '../game/ProjectileManager';
import { InteractionManager } from '../game/InteractionManager';
import { WaveManager } from '../game/WaveManager';
import { gameState } from '../game/GameState';
import { EnemyType, TowerType } from '../game/types';
import level1 from '../game/levels/level1.json';
import WaveTransition from './WaveTransition.vue';

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

// UI State
const selectedTower = ref<TowerType>(TowerType.RATE_LIMIT);

// Wave Transition State
const showWaveTransition = ref(false);
const currentWaveRewards = ref({ baseGold: 0, bonusGold: 0 });
const waveTimeout = ref(30000);
const completedWaveNum = ref(0);

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  draw();
};

const handleCanvasClick = (event: MouseEvent) => {
  if (!interactionManager || !canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const result = interactionManager.handleClick(x, y, selectedTower.value);
  if (result && result.action === 'BUILD' && towerManager) {
    towerManager.addTower(result.x, result.y, result.type);
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
    if (waveManager) waveManager.update(deltaTime);
    if (enemyManager) enemyManager.update(deltaTime);
    if (projectileManager) projectileManager.update(deltaTime);
    if (towerManager) towerManager.update(deltaTime, timestamp);
  }

  draw();
  animationFrameId = requestAnimationFrame(loop);
};

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    
    // Initialize Systems
    gridManager = new GridManager({ width: 20, height: 12, cellSize: 64 });
    gridManager.initialize(level1.mapLayout);
    enemyManager = new EnemyManager(gridManager);
    projectileManager = new ProjectileManager(enemyManager);
    towerManager = new TowerManager(gridManager, enemyManager, projectileManager);
    interactionManager = new InteractionManager(gridManager);
    waveManager = new WaveManager(enemyManager);

    // Set up circular dependencies (let EnemyManager access TowerManager for Boss skill)
    enemyManager.setTowerManager(towerManager);

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
  }
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
    </div>
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
</style>
