<script setup lang="ts">
import { computed } from 'vue';
import { gameState } from '../game/GameState';

// Props
const props = defineProps<{
  totalWaves: number;
  currentWaveEnemies: number;
  totalWaveEnemies: number;
  passiveIncome: number;
  isPaused: boolean;
  gameSpeed: number;
}>();

// Emits
const emit = defineEmits<{
  togglePause: [];
  setSpeed: [speed: number];
}>();

// Computed properties
const enemyProgress = computed(() => {
  // Show progress based on enemies spawned (not defeated)
  if (props.totalWaveEnemies === 0) return 0;
  const spawned = props.totalWaveEnemies - props.currentWaveEnemies;
  return Math.max(0, Math.min(100, (spawned / props.totalWaveEnemies) * 100));
});

const hpColor = computed(() => {
  if (gameState.hp > 70) return '#00ff88';
  if (gameState.hp > 30) return '#ffd700';
  return '#ff4444';
});

const hpPercent = computed(() => {
  return (gameState.hp / gameState.maxHp) * 100;
});
</script>

<template>
  <div class="top-status-bar">
    <div class="status-left">
      <!-- Wave Indicator -->
      <div class="status-item wave">
        <span class="icon">🔥</span>
        <span class="label">Wave</span>
        <span class="value">{{ gameState.wave }}/{{ totalWaves }}</span>
      </div>
      
      <!-- HP Indicator -->
      <div class="status-item hp">
        <span class="icon">❤️</span>
        <span class="label">HP</span>
        <span class="value" :style="{ color: hpColor }">{{ gameState.hp }}%</span>
        <div class="hp-progress">
          <div class="hp-progress-fill" :style="{ 
            width: hpPercent + '%',
            backgroundColor: hpColor,
            boxShadow: `0 0 10px ${hpColor}`
          }"></div>
        </div>
      </div>
      
      <!-- Enemy Count -->
      <div class="status-item enemies">
        <span class="icon">👾</span>
        <span class="label">Enemies</span>
        <span class="value">{{ currentWaveEnemies }}/{{ totalWaveEnemies }}</span>
        <div class="enemy-progress">
          <div class="progress-fill" :style="{ width: enemyProgress + '%' }"></div>
        </div>
      </div>
      
      <!-- Score -->
      <div class="status-item score">
        <span class="icon">⭐</span>
        <span class="label">Score</span>
        <span class="value">{{ gameState.score }}</span>
      </div>
      
      <!-- Gold -->
      <div class="status-item gold">
        <span class="icon">💵</span>
        <span class="value">{{ gameState.money }}</span>
        <span class="income" v-if="passiveIncome > 0">+{{ passiveIncome }}/s</span>
      </div>
    </div>
    
    <div class="status-right">
      <!-- Pause Button -->
      <button class="pause-btn" @click="emit('togglePause')" :title="isPaused ? 'Resume (ESC)' : 'Pause (ESC)'">
        {{ isPaused ? '▶️' : '⏸️' }}
      </button>
      
      <!-- Speed Controls -->
      <div class="speed-controls">
        <button 
          class="speed-btn"
          :class="{ active: gameSpeed === 1 }"
          @click="emit('setSpeed', 1)"
          title="Normal Speed"
        >1x</button>
        <button 
          class="speed-btn"
          :class="{ active: gameSpeed === 2 }"
          @click="emit('setSpeed', 2)"
          title="Double Speed"
        >2x</button>
        <button 
          class="speed-btn"
          :class="{ active: gameSpeed === 3 }"
          @click="emit('setSpeed', 3)"
          title="Triple Speed"
        >3x</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(0, 255, 0, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
  font-family: 'Courier New', monospace;
}

.status-left {
  display: flex;
  gap: 30px;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.status-item .icon {
  font-size: 20px;
}

.status-item .label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
}

.status-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #00ff00;
}

.status-item.gold .value {
  color: #ffd700;
}

.status-item .income {
  font-size: 14px;
  color: #ffd700;
  margin-left: 4px;
}

/* Enemy Progress Bar */
.enemy-progress {
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 255, 0, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

/* HP Progress Bar */
.hp-progress {
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.hp-progress-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  /* Color set via inline style for dynamic HP color */
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff00, #00ff88);
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.status-right {
  display: flex;
  gap: 15px;
  align-items: center;
}

.pause-btn {
  font-size: 24px;
  width: 50px;
  height: 40px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 8px;
  color: #00ff00;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pause-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

.speed-controls {
  display: flex;
  gap: 6px;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px;
  border-radius: 8px;
  border: 2px solid rgba(0, 212, 255, 0.3);
}

.speed-btn {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  width: 45px;
  height: 32px;
  background: rgba(0, 212, 255, 0.1);
  border: 2px solid rgba(0, 212, 255, 0.5);
  border-radius: 6px;
  color: #00d4ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speed-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.speed-btn.active {
  background: #00d4ff;
  color: #000;
  border-color: #00d4ff;
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .top-status-bar {
    padding: 0 10px;
  }
  
  .status-left {
    gap: 15px;
  }
  
  .status-item .label {
    display: none;
  }
}
</style>
