<script setup lang="ts">
import { computed } from 'vue';
import { TowerType } from '../game/types';
import { TowerConfig } from '../config/towers.config';
import { gameState } from '../game/GameState';

// Props
const props = defineProps<{
  selectedTower: TowerType | null;
  codeFarmerCost: number;
}>();

// Emits
const emit = defineEmits<{
  selectTower: [type: TowerType | null];
}>();

// Tower card data
const towerCards = computed(() => [
  {
    type: TowerType.RATE_LIMIT,
    name: 'Rate Limiter',
    emoji: '🔥',
    cost: TowerConfig[TowerType.RATE_LIMIT].baseCost,
    damage: TowerConfig[TowerType.RATE_LIMIT].damage,
    range: TowerConfig[TowerType.RATE_LIMIT].range,
    rate: (1000 / TowerConfig[TowerType.RATE_LIMIT].cooldown).toFixed(1) + '/s',
    special: 'Fast Fire',
    color: '#ff4444'
  },
  {
    type: TowerType.WAF,
    name: 'WAF',
    emoji: '💥',
    cost: TowerConfig[TowerType.WAF].baseCost,
    damage: TowerConfig[TowerType.WAF].damage,
    range: TowerConfig[TowerType.WAF].range,
    rate: (1000 / TowerConfig[TowerType.WAF].cooldown).toFixed(1) + '/s',
    special: 'Area Damage',
    color: '#ff8800'
  },
  {
    type: TowerType.DPI,
    name: 'DPI Scanner',
    emoji: '🎯',
    cost: TowerConfig[TowerType.DPI].baseCost,
    damage: TowerConfig[TowerType.DPI].damage,
    range: TowerConfig[TowerType.DPI].range,
    rate: (1000 / TowerConfig[TowerType.DPI].cooldown).toFixed(1) + '/s',
    special: 'High Damage',
    color: '#ff00ff'
  },
  {
    type: TowerType.CACHE,
    name: 'Cache',
    emoji: '❄️',
    cost: TowerConfig[TowerType.CACHE].baseCost,
    damage: TowerConfig[TowerType.CACHE].damage,
    range: TowerConfig[TowerType.CACHE].range,
    rate: (1000 / TowerConfig[TowerType.CACHE].cooldown).toFixed(1) + '/s',
    special: 'Slow Effect',
    color: '#00d4ff'
  },
  {
    type: TowerType.CODE_FARMER,
    name: 'Code Farmer',
    emoji: '💰',
    cost: props.codeFarmerCost,
    damage: 0,
    range: 0,
    rate: '-',
    special: '+5 Gold/sec',
    color: '#ffd700'
  },
  {
    type: TowerType.SUPERVISOR,
    name: 'Supervisor',
    emoji: '⚡',
    cost: TowerConfig[TowerType.SUPERVISOR].baseCost,
    damage: 0,
    range: TowerConfig[TowerType.SUPERVISOR].range,
    rate: '-',
    special: 'Atk Speed +20%',
    color: '#ffaa00'
  },
  {
    type: TowerType.SYSTEM_ANALYST,
    name: 'Analyst',
    emoji: '🔍',
    cost: TowerConfig[TowerType.SYSTEM_ANALYST].baseCost,
    damage: 0,
    range: TowerConfig[TowerType.SYSTEM_ANALYST].range,
    rate: '-',
    special: 'Range +1',
    color: '#00ff88'
  }
]);

const canAfford = (cost: number) => {
  return gameState.money >= cost;
};

// Get selected tower data
const selectedTowerData = computed(() => {
  if (!props.selectedTower) return null;
  return towerCards.value.find(t => t.type === props.selectedTower);
});

// Handle tower click - toggle selection
const handleTowerClick = (type: TowerType, cost: number) => {
  if (!canAfford(cost)) return;
  
  // If clicking the same tower, deselect by emitting null
  if (props.selectedTower === type) {
    emit('selectTower', null); // Deselect
  } else {
    // Select new tower
    emit('selectTower', type);
  }
};
</script>

<template>
  <div class="tower-build-panel">
    <!-- Tower Cards Scroll Area -->
    <div class="tower-cards-scroll">
      <div 
        v-for="tower in towerCards" 
        :key="tower.type"
        class="tower-card"
        :class="{ 
          active: selectedTower === tower.type,
          disabled: !canAfford(tower.cost)
        }"
        :style="{ '--tower-color': tower.color }"
        @click="handleTowerClick(tower.type, tower.cost)"
      >
        <div class="tower-icon">{{ tower.emoji }}</div>
        <div class="tower-name">{{ tower.name }}</div>
        <div class="tower-cost" :class="{ 'too-expensive': !canAfford(tower.cost) }">
          ${{ tower.cost }}
        </div>
      </div>
    </div>
  </div>
  
  <!-- Info Panel (Absolute positioned) -->
  <div class="tower-info-panel" v-if="selectedTowerData">
    <div class="info-header">
      <span class="info-icon" :style="{ color: selectedTowerData.color }">
        {{ selectedTowerData.emoji }}
      </span>
      <span class="info-title">{{ selectedTowerData.name }}</span>
      <button class="close-btn" @click="emit('selectTower', null)" title="Close">✕</button>
    </div>
    
    <div class="info-body">
      <div class="info-row cost-row">
        <span class="row-label">Cost:</span>
        <span class="row-value" :class="{ 'too-expensive': !canAfford(selectedTowerData.cost) }">
          ${{ selectedTowerData.cost }}
        </span>
      </div>
      
      <div class="info-stats-grid">
        <div class="stat-item" v-if="selectedTowerData.damage > 0">
          <span class="stat-label">DMG</span>
          <span class="stat-value">{{ selectedTowerData.damage }}</span>
        </div>
        <div class="stat-item" v-if="selectedTowerData.range > 0">
          <span class="stat-label">RNG</span>
          <span class="stat-value">{{ selectedTowerData.range }}</span>
        </div>
        <div class="stat-item" v-if="selectedTowerData.rate !== '-'">
          <span class="stat-label">RATE</span>
          <span class="stat-value">{{ selectedTowerData.rate }}</span>
        </div>
      </div>
      
      <div class="info-special">{{ selectedTowerData.special }}</div>
    </div>
  </div>
</template>

<style scoped>
.tower-build-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(10px);
  border-top: 2px solid rgba(0, 255, 0, 0.3);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

/* Scrollable tower cards area */
.tower-cards-scroll {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  padding-right: 280px; /* Space for info panel */
  overflow-x: auto;
  overflow-y: hidden;
}

.tower-card {
  width: 100px;
  height: 110px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid var(--tower-color, #00ff00);
  border-radius: 10px;
  padding: 8px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, outline 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-shrink: 0;
  position: relative;
  outline: 0px solid transparent;
}

.tower-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 255, 0, 0.4);
  outline: 2px solid var(--tower-color, #00ff00);
  outline-offset: 2px;
}

.tower-card.active {
  background: rgba(0, 212, 255, 0.15);
  border-color: #00d4ff;
  box-shadow: 0 0 25px rgba(0, 212, 255, 0.8),
              inset 0 0 15px rgba(0, 212, 255, 0.2);
  outline: 2px solid #00d4ff;
  outline-offset: 2px;
}

.tower-card.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.8);
}

.tower-card.disabled:hover {
  transform: none;
  box-shadow: none;
}

.tower-icon {
  font-size: 30px;
}

.tower-name {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.tower-cost {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
}

.tower-cost.too-expensive {
  color: #ff4444;
}

/* Info Panel - Absolute positioned */
.tower-info-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 260px;
  height: 160px;
  background: rgba(5, 5, 5, 0.95);
  border-left: 2px solid rgba(0, 255, 0, 0.3);
  display: flex;
  flex-direction: column;
  z-index: 101;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
}

.info-icon {
  font-size: 20px;
}

.info-title {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  font-weight: bold;
  color: #00ff00;
}

.close-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 68, 68, 0.2);
  border: 1px solid #ff4444;
  border-radius: 4px;
  color: #ff4444;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.close-btn:hover {
  background: rgba(255, 68, 68, 0.4);
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

.info-body {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.row-label {
  font-size: 11px;
  color: #ffd700;
}

.row-value {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
}

.row-value.too-expensive {
  color: #ff4444;
}

/* Compact stats grid */
.info-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.stat-label {
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 12px;
  color: #00ff00;
  font-weight: bold;
}

.info-special {
  padding: 6px 10px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #00d4ff;
  text-align: center;
  font-weight: bold;
}

/* Scrollbar styling */
.tower-cards-scroll::-webkit-scrollbar {
  height: 6px;
}

.tower-cards-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.tower-cards-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 0, 0.5);
  border-radius: 3px;
}

.tower-cards-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 0, 0.7);
}

/* Responsive */
@media (max-width: 768px) {
  .tower-build-panel {
    height: 140px;
  }
  
  .tower-info-panel {
    width: 240px;
  }
  
  .tower-cards-scroll {
    padding: 10px;
    gap: 10px;
  }
  
  .tower-card {
    width: 100px;
    height: 110px;
  }
  
  .tower-icon {
    font-size: 28px;
  }
  
  .tower-name {
    font-size: 11px;
  }
}
</style>
