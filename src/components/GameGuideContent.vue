<script setup lang="ts">
import { ref } from 'vue';
import { TowerConfig } from '../config/towers.config';
import { TowerType } from '../game/types';

// Props
const props = defineProps<{
  inGame?: boolean;
}>();

// Emits
const emit = defineEmits<{
  back: [];
}>();

const activeTab = ref('howto');

const setTab = (tab: string) => {
  activeTab.value = tab;
};

const handleBack = () => {
  emit('back');
};

// Tower data from config
const towers = [
  { type: TowerType.RATE_LIMIT, ...TowerConfig[TowerType.RATE_LIMIT] },
  { type: TowerType.WAF, ...TowerConfig[TowerType.WAF] },
  { type: TowerType.DPI, ...TowerConfig[TowerType.DPI] },
  { type: TowerType.CACHE, ...TowerConfig[TowerType.CACHE] },
  { type: TowerType.CODE_FARMER, ...TowerConfig[TowerType.CODE_FARMER] },
  { type: TowerType.SUPERVISOR, ...TowerConfig[TowerType.SUPERVISOR] },
  { type: TowerType.SYSTEM_ANALYST, ...TowerConfig[TowerType.SYSTEM_ANALYST] }
];
</script>

<template>
  <div class="guide-content">
    <h1 class="guide-title">Game Guide</h1>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'howto' }" @click="setTab('howto')">
        How to Play
      </button>
      <button class="tab" :class="{ active: activeTab === 'towers' }" @click="setTab('towers')">
        Towers
      </button>
      <button class="tab" :class="{ active: activeTab === 'enemies' }" @click="setTab('enemies')">
        Enemies
      </button>
      <button class="tab" :class="{ active: activeTab === 'tips' }" @click="setTab('tips')">
        Tips & Strategy
      </button>
    </div>

    <!-- Content -->
    <div class="tab-content-container">
      <!-- How to Play Tab -->
      <div v-if="activeTab === 'howto'" class="tab-content">
        <h2>How to Play</h2>
        <p><strong>Objective:</strong> Defend your server from DDoS attacks by placing defensive towers along the
          network path.</p>

        <h3>Basic Controls</h3>
        <ul>
          <li><strong>Place Tower:</strong> Click on an empty cell to place the selected tower</li>
          <li><strong>Select Tower:</strong> Click on a placed tower to view its stats and sell it</li>
          <li><strong>Pause:</strong> Press ESC to pause/resume the game</li>
          <li><strong>Speed Control:</strong> Use 1x/2x/3x buttons to change game speed</li>
        </ul>

        <h3>Game Mechanics</h3>
        <ul>
          <li><strong>Money:</strong> Earn money by defeating enemies. Use it to build and upgrade towers</li>
          <li><strong>HP:</strong> Each enemy that reaches the end reduces your HP. Game over at 0 HP</li>
          <li><strong>Waves:</strong> Enemies come in waves. Defeat all enemies to progress</li>
          <li><strong>Experience:</strong> Towers gain experience and level up by defeating enemies</li>
        </ul>
      </div>

      <!-- Towers Tab -->
      <div v-if="activeTab === 'towers'" class="tab-content">
        <h2>Defensive Towers</h2>
        <table class="tower-table">
          <thead>
            <tr>
              <th>Tower</th>
              <th>Cost</th>
              <th>Range</th>
              <th>Damage</th>
              <th>Speed</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tower in towers" :key="tower.type">
              <td><strong>{{ tower.displayName }}</strong></td>
              <td>${{ tower.baseCost }}</td>
              <td>{{ tower.range > 0 ? tower.range : 'N/A' }}</td>
              <td>{{ tower.damage > 0 ? tower.damage : 'N/A' }}</td>
              <td>{{ tower.cooldown > 999 ? 'N/A' : `${(1000 / tower.cooldown).toFixed(1)}/s` }}</td>
              <td>{{ tower.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Enemies Tab -->
      <div v-if="activeTab === 'enemies'" class="tab-content">
        <h2>Enemy Types</h2>

        <div class="enemy-card">
          <h3>Basic Request</h3>
          <p><strong>HP:</strong> Low | <strong>Speed:</strong> Normal</p>
          <p>Standard DDoS bot. Easy to defeat but comes in large numbers.</p>
        </div>

        <div class="enemy-card">
          <h3>Fast Bot</h3>
          <p><strong>HP:</strong> Low | <strong>Speed:</strong> Fast</p>
          <p>Quick-moving attack. Difficult to target but fragile.</p>
        </div>

        <div class="enemy-card">
          <h3>Heavy Botnet</h3>
          <p><strong>HP:</strong> High | <strong>Speed:</strong> Slow</p>
          <p>Slow but heavily armored. Requires sustained fire to eliminate.</p>
        </div>

        <div class="enemy-card">
          <h3>Boss Attack</h3>
          <p><strong>HP:</strong> Very High | <strong>Speed:</strong> Variable | <strong>Special:</strong> Can
            disable towers</p>
          <p>Appears every 10 waves. Extremely dangerous with special abilities.</p>
        </div>
      </div>

      <!-- Tips Tab -->
      <div v-if="activeTab === 'tips'" class="tab-content">
        <h2>Strategy Tips</h2>

        <ul>
          <li><strong>Early Game:</strong> Start with RATE_LIMIT towers for balanced defense</li>
          <li><strong>Positioning:</strong> Place towers at corners and curves for maximum coverage</li>
          <li><strong>Tower Synergy:</strong> Use SUPERVISOR near damage dealers to boost attack speed</li>
          <li><strong>Income:</strong> Build CODE_FARMER towers early for passive gold generation</li>
          <li><strong>Upgrades:</strong> Let towers kill enemies to gain experience and level up</li>
          <li><strong>Boss Waves:</strong> Prepare extra defenses before wave 10, 20, 30, etc.</li>
          <li><strong>Selling:</strong> Don't be afraid to sell and rebuild. You get 70% refund</li>
          <li><strong>Speed:</strong> Use fast towers (CACHE) for fast enemies, slow towers (DPI) for bosses</li>
        </ul>
      </div>
    </div>

    <!-- Back Button -->
    <button class="menu-btn" @click="handleBack">
      ← Back
    </button>
  </div>
</template>

<style scoped>
.guide-content {
  width: 100%;
  max-width: 900px;
}

.guide-title {
  font-family: 'Courier New', monospace;
  font-size: 36px;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  margin: 0 0 30px 0;
  text-align: center;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px 20px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 8px;
  color: #00ff00;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
}

.tab:hover {
  background: rgba(0, 255, 0, 0.2);
}

.tab.active {
  background: #00ff00;
  color: #0a0a0a;
  font-weight: bold;
  border-color: #00ff00;
}

/* Content */
.tab-content-container {
  font-family: 'Courier New', monospace;
  color: #ccc;
  line-height: 1.8;
  min-height: 400px;
  margin-bottom: 30px;
}

.tab-content h2 {
  color: #00d4ff;
  font-size: 24px;
  margin: 0 0 20px 0;
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
  padding-bottom: 10px;
}

.tab-content h3 {
  color: #00ff00;
  font-size: 18px;
  margin: 20px 0 10px 0;
}

.tab-content p {
  margin: 10px 0;
}

.tab-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.tab-content li {
  margin: 8px 0;
}

.tab-content strong {
  color: #00ff00;
}

/* Tower Table */
.tower-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 13px;
}

.tower-table th {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
  padding: 12px 8px;
  text-align: left;
  border: 1px solid rgba(0, 255, 0, 0.3);
}

.tower-table td {
  padding: 10px 8px;
  border: 1px solid rgba(0, 255, 0, 0.2);
}

.tower-table tr:hover {
  background: rgba(0, 255, 0, 0.05);
}

/* Enemy Cards */
.enemy-card {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
}

.enemy-card h3 {
  color: #00ff00;
  margin: 0 0 10px 0;
}

.enemy-card p {
  margin: 6px 0;
}

/* Menu Button */
.menu-btn {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  padding: 16px 32px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 10px;
  color: #00ff00;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.menu-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .tower-table {
    font-size: 11px;
  }

  .tower-table th,
  .tower-table td {
    padding: 8px 4px;
  }

  .tab {
    font-size: 12px;
    padding: 10px 12px;
    min-width: 100px;
  }
}
</style>
