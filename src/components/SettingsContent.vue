<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { audioManager } from '../game/AudioManager';

// Props
const props = defineProps<{
  inGame?: boolean; // 是否在遊戲中使用（影響樣式）
}>();

// Emits
const emit = defineEmits<{
  back: [];
}>();

// Audio Settings
const masterVolume = ref(100);
const sfxVolume = ref(100);
const bgmVolume = ref(60);
const isMuted = ref(false);

// Game Settings
const defaultSpeed = ref(1);

// Load settings on mount
onMounted(() => {
  const settings = audioManager.getSettings();
  masterVolume.value = Math.round(settings.masterVolume * 100);
  sfxVolume.value = Math.round(settings.sfxVolume * 100);
  bgmVolume.value = Math.round(settings.bgmVolume * 100);
  isMuted.value = settings.isMuted;
  
  // Load game speed from localStorage
  const savedSpeed = localStorage.getItem('gameSpeed');
  if (savedSpeed) {
    defaultSpeed.value = parseInt(savedSpeed);
  }
});

// Handle volume changes
const updateMasterVolume = (value: number) => {
  audioManager.setMasterVolume(value / 100);
};

const updateSFXVolume = (value: number) => {
  audioManager.setSFXVolume(value / 100);
};

const updateBGMVolume = (value: number) => {
  audioManager.setBGMVolume(value / 100);
};

const toggleMute = () => {
  isMuted.value = audioManager.toggleMute();
};

// Handle game settings
const updateGameSpeed = (speed: number) => {
  defaultSpeed.value = speed;
  localStorage.setItem('gameSpeed', speed.toString());
};

const handleBack = () => {
  emit('back');
};
</script>

<template>
  <div class="settings-content">
    <h1 class="settings-title">Settings</h1>
    
    <!-- Audio Settings Section -->
    <section class="settings-section">
      <h2>Audio Settings</h2>
      
      <div class="setting-row">
        <label>Master Volume</label>
        <div class="volume-control">
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model.number="masterVolume"
            @input="updateMasterVolume(masterVolume)"
            class="volume-slider"
          />
          <span class="volume-value">{{ masterVolume }}%</span>
        </div>
      </div>
      
      <div class="setting-row">
        <label>Sound Effects</label>
        <div class="volume-control">
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model.number="sfxVolume"
            @input="updateSFXVolume(sfxVolume)"
            class="volume-slider"
          />
          <span class="volume-value">{{ sfxVolume }}%</span>
        </div>
      </div>
      
      <div class="setting-row">
        <label>Background Music</label>
        <div class="volume-control">
          <input 
            type="range" 
            min="0" 
            max="100" 
            v-model.number="bgmVolume"
            @input="updateBGMVolume(bgmVolume)"
            class="volume-slider"
          />
          <span class="volume-value">{{ bgmVolume }}%</span>
        </div>
      </div>
      
      <div class="setting-row">
        <label>Mute All Audio</label>
        <button 
          class="toggle-btn"
          :class="{ active: isMuted }"
          @click="toggleMute"
        >
          {{ isMuted ? '🔇 Muted' : '🔊 Unmuted' }}
        </button>
      </div>
    </section>
    
    <!-- Game Settings Section -->
    <section class="settings-section">
      <h2>Game Settings</h2>
      
      <div class="setting-row">
        <label>Default Game Speed</label>
        <div class="speed-btns">
          <button 
            class="speed-btn" 
            :class="{ active: defaultSpeed === 1 }"
            @click="updateGameSpeed(1)"
          >
            1x
          </button>
          <button 
            class="speed-btn" 
            :class="{ active: defaultSpeed === 2 }"
            @click="updateGameSpeed(2)"
          >
            2x
          </button>
          <button 
            class="speed-btn" 
            :class="{ active: defaultSpeed === 3 }"
            @click="updateGameSpeed(3)"
          >
            3x
          </button>
        </div>
      </div>
    </section>
    
    <!-- Back Button -->
    <button class="menu-btn back-btn" @click="handleBack">
      ← Back
    </button>
  </div>
</template>

<style scoped>
.settings-content {
  width: 100%;
  max-width: 600px;
}

.settings-title {
  font-family: 'Courier New', monospace;
  font-size: 36px;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  margin: 0 0 40px 0;
  text-align: center;
}

.settings-section {
  margin-bottom: 40px;
}

.settings-section h2 {
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #00d4ff;
  margin: 0 0 20px 0;
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
  padding-bottom: 10px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}

.setting-row label {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ccc;
  flex: 0 0 180px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.volume-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 255, 0, 0.2);
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #00ff00;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #00ff00;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.volume-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00ff00;
  min-width: 50px;
  text-align: right;
}

.toggle-btn {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 10px 24px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 8px;
  color: #00ff00;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(0, 255, 0, 0.2);
}

.toggle-btn.active {
  background: rgba(255, 0, 0, 0.2);
  border-color: #ff0000;
  color: #ff0000;
}

.speed-btns {
  display: flex;
  gap: 12px;
}

.speed-btn {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 10px 20px;
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid #00ff00;
  border-radius: 8px;
  color: #00ff00;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.speed-btn:hover {
  background: rgba(0, 255, 0, 0.2);
}

.speed-btn.active {
  background: #00ff00;
  color: #0a0a0a;
  font-weight: bold;
}

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
  margin-top: 20px;
}

.menu-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
}

.back-btn {
  margin-top: 40px;
}

/* Responsive */
@media (max-width: 768px) {
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .setting-row label {
    flex: initial;
  }
  
  .volume-control {
    width: 100%;
  }
}
</style>
