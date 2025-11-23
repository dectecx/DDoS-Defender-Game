<template>
  <Transition name="panel-fade">
    <div v-if="show && tower" class="tower-info-panel-overlay" @click.self="handleClose">
      <div class="tower-info-panel">
        <!-- Header -->
        <div class="panel-header">
          <h2>{{ getTowerName(tower.type) }}</h2>
          <button class="close-btn" @click="handleClose">✕</button>
        </div>

        <!-- Level & Experience -->
        <div class="level-section">
          <div class="level-badge">
            <span class="level-label">LEVEL</span>
            <span class="level-number">{{ tower.level }}</span>
          </div>
          <div class="exp-container">
            <div class="exp-bar-bg">
              <div 
                class="exp-bar-fill" 
                :style="{ width: expPercentage + '%' }"
              ></div>
            </div>
            <div class="exp-text">
              {{ tower.exp }} / {{ tower.maxExp }} EXP
              <span v-if="tower.level >= 10" class="max-level">MAX</span>
            </div>
          </div>
        </div>

        <!-- Stats Display -->
        <div class="stats-section">
          <h3>Stats</h3>
          <div class="stat-row">
            <span class="stat-label">⚔️ Damage</span>
            <span class="stat-value">{{ Math.floor(tower.damage) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">🎯 Range</span>
            <span class="stat-value">
              {{ tower.range.toFixed(1) }}
              <span v-if="rangeBuff > 0" class="buff-bonus">
                +{{ (rangeBuff * 100).toFixed(0) }}% (+{{ rangeBuff.toFixed(1) }})
              </span>
              {{ rangeBuff > 0 ? ` = ${buffedRange.toFixed(1)}` : '' }} cells
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">⚡ Attack Speed</span>
            <span class="stat-value">
              {{ (1000 / tower.cooldown).toFixed(2) }}/s
              <span v-if="attackSpeedBuff > 0" class="buff-bonus">
                +{{ (attackSpeedBuff * 100).toFixed(0) }}%
              </span>
              {{ attackSpeedBuff > 0 ? ` = ${(1000 / buffedCooldown).toFixed(2)}/s` : '' }}
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-label">💰 Total Investment</span>
            <span class="stat-value highlight">{{ tower.totalInvestment }}g</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button class="sell-btn" @click="handleSell">
            <span class="sell-icon">💸</span>
            Sell for {{ sellPrice }}g
            <span class="sell-percentage">(70%)</span>
          </button>
        </div>

        <!-- Tower Description -->
        <div class="description-section">
          <p class="description">{{ getTowerDescription(tower.type) }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Tower, TowerType } from '../game/types';
import type { TowerManager } from '../game/TowerManager';
import { BuffType } from '../game/systems/BuffSystem';

interface Props {
  show: boolean;
  tower: Tower | null;
  towerManager: TowerManager | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'sell', towerId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Buff calculations
const rangeBuff = computed(() => {
  if (!props.tower || !props.towerManager) return 0;
  return props.towerManager.buffSystem.getTotalBuff(props.tower.id, BuffType.RANGE);
});

const attackSpeedBuff = computed(() => {
  if (!props.tower || !props.towerManager) return 0;
  return props.towerManager.buffSystem.getTotalBuff(props.tower.id, BuffType.ATTACK_SPEED);
});

const buffedRange = computed(() => {
  if (!props.tower) return 0;
  return props.tower.range + rangeBuff.value;
});

const buffedCooldown = computed(() => {
  if (!props.tower) return 0;
  return props.tower.cooldown * (1 - attackSpeedBuff.value);
});

const expPercentage = computed(() => {
  if (!props.tower) return 0;
  if (props.tower.level >= 10) return 100;
  return (props.tower.exp / props.tower.maxExp) * 100;
});

const sellPrice = computed(() => {
  if (!props.tower) return 0;
  return Math.floor(props.tower.totalInvestment * 0.7);
});

const handleClose = () => {
  emit('close');
};

const handleSell = () => {
  if (!props.tower) return;
  emit('sell', props.tower.id);
};

const getTowerName = (type: TowerType): string => {
  const names: Record<TowerType, string> = {
    RATE_LIMIT: 'Rate Limiter',
    WAF: 'Web Application Firewall',
    DPI: 'Deep Packet Inspector',
    CACHE: 'Cache Server',
    CODE_FARMER: 'Code Farmer',
    SUPERVISOR: 'Supervisor',
    SYSTEM_ANALYST: 'System Analyst'
  };
  return names[type] || type;
};

const getTowerDescription = (type: TowerType): string => {
  const descriptions: Record<TowerType, string> = {
    RATE_LIMIT: 'Balanced defense tower with moderate damage and range. Good all-around choice for any position.',
    WAF: 'Area-of-effect tower that deals splash damage. Best placed at choke points where enemies cluster.',
    DPI: 'High-damage sniper tower with extended range. Targets enemies with the most HP first.',
    CACHE: 'Fast-attacking tower that slows enemies. Reduces enemy movement speed by 50% for 3 seconds.',
    CODE_FARMER: 'Generates passive income of 5 gold per second. Cost increases with each farmer built.',
    SUPERVISOR: 'Buffs nearby towers with +20% attack speed (stacks up to 2 times). Range: 2 cells.',
    SYSTEM_ANALYST: 'Buffs nearby towers with +1 cell range (stacks up to 2 times). Range: 2 cells.'
  };
  return descriptions[type] || 'Tower description';
};
</script>

<style scoped>
.tower-info-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  z-index: 1000;
}

.tower-info-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-left: 2px solid #00d4ff;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  overflow-y: auto;
  box-shadow: -4px 0 20px rgba(0, 212, 255, 0.3);
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Header */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #0f3460;
}

.panel-header h2 {
  margin: 0;
  font-size: 24px;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.close-btn {
  background: transparent;
  border: none;
  color: #888;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Level Section */
.level-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(15, 52, 96, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.level-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #0f3460, #1a1a2e);
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid #00d4ff;
  min-width: 80px;
}

.level-label {
  font-size: 10px;
  color: #888;
  font-weight: bold;
  letter-spacing: 1px;
}

.level-number {
  font-size: 32px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  line-height: 1;
}

.exp-container {
  flex: 1;
}

.exp-bar-bg {
  background: rgba(0, 0, 0, 0.3);
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 212, 255, 0.3);
  margin-bottom: 6px;
}

.exp-bar-fill {
  background: linear-gradient(90deg, #00d4ff 0%, #0099ff 100%);
  height: 100%;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.exp-text {
  font-size: 12px;
  color: #00d4ff;
  text-align: center;
  font-weight: 500;
}

.max-level {
  color: #ffd700;
  font-weight: bold;
  margin-left: 8px;
}

/* Stats Section */
.stats-section {
  margin-bottom: 20px;
}

.stats-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #00d4ff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid #0f3460;
  transition: all 0.2s;
}

.stat-row:hover {
  background: rgba(0, 212, 255, 0.1);
  border-left-color: #00d4ff;
}

.stat-label {
  color: #aaa;
  font-size: 14px;
}

.stat-value {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.stat-value.highlight {
  color: #ffd700;
}

.buff-bonus {
  color: #00ff88;
  font-size: 12px;
  margin-left: 4px;
  font-weight: normal;
}

/* Actions Section */
.actions-section {
  margin-bottom: 16px;
}

.sell-btn {
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: 2px solid #c0392b;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.sell-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.5);
}

.sell-btn:active {
  transform: translateY(0);
}

.sell-icon {
  font-size: 20px;
}

.sell-percentage {
  font-size: 12px;
  opacity: 0.8;
  font-weight: normal;
}

/* Description Section */
.description-section {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.description {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #bbb;
  font-style: italic;
}

/* Transitions */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.3s ease;
}

.panel-fade-enter-active .tower-info-panel,
.panel-fade-leave-active .tower-info-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

.panel-fade-enter-from .tower-info-panel {
  transform: scale(0.9);
  opacity: 0;
}

.panel-fade-leave-to .tower-info-panel {
  transform: scale(0.9);
  opacity: 0;
}
</style>
