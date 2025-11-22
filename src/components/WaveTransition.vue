<template>
  <div v-if="show" class="wave-transition-overlay">
    <div class="wave-transition-content">
      <h2>Wave {{ completedWave }} Complete!</h2>
      
      <div class="rewards">
        <div class="reward-item">
          <span class="label">Base Reward:</span>
          <span class="value">+{{ baseGold }}g</span>
        </div>
      </div>
      
      <div class="next-wave-info">
        <p class="countdown">Next wave in: <strong>{{ remainingSeconds }}s</strong></p>
        <p class="bonus">Bonus Gold: <strong>+{{ currentBonus }}g</strong></p>
      </div>
      
      <button 
        class="start-next-wave-btn" 
        @click="startNextWave"
      >
        Start Next Wave (Get {{ currentBonus }}g bonus)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  completedWave: number;
  baseGold: number;
  maxBonusGold: number;
  timeoutDuration: number; // milliseconds
}>();

const emit = defineEmits<{
  startNextWave: [bonusGold: number];
}>();

const elapsedTime = ref(0);
let intervalId: number | null = null;

const remainingTime = computed(() => {
  return Math.max(0, props.timeoutDuration - elapsedTime.value);
});

const remainingSeconds = computed(() => {
  return Math.ceil(remainingTime.value / 1000);
});

const currentBonus = computed(() => {
  const ratio = remainingTime.value / props.timeoutDuration;
  return Math.floor(props.maxBonusGold * ratio);
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    startTimer();
  } else {
    stopTimer();
  }
});

function startTimer() {
  elapsedTime.value = 0;
  
  intervalId = window.setInterval(() => {
    elapsedTime.value += 50; // Update every 50ms for smooth countdown
    
    if (elapsedTime.value >= props.timeoutDuration) {
      stopTimer();
      emit('startNextWave', 0); // No bonus if time expires
    }
  }, 50);
}

function stopTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function startNextWave() {
  stopTimer();
  emit('startNextWave', currentBonus.value);
}
</script>

<style scoped>
.wave-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.wave-transition-content {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a88 100%);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  text-align: center;
  color: white;
  min-width: 400px;
}

h2 {
  margin: 0 0 24px 0;
  font-size: 32px;
  color: #4fc3f7;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.rewards {
  margin: 20px 0;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.reward-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 18px;
}

.label {
  color: #b0bec5;
}

.value {
  color: #ffd54f;
  font-weight: bold;
}

.next-wave-info {
  margin: 24px 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.countdown {
  font-size: 24px;
  margin: 8px 0;
  color: #fff;
}

.bonus {
  font-size: 20px;
  margin: 8px 0;
  color: #ffd54f;
}

strong {
  font-size: 1.2em;
}

.start-next-wave-btn {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  border: none;
  color: white;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(67, 160, 71, 0.4);
}

.start-next-wave-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(67, 160, 71, 0.6);
  background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
}

.start-next-wave-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(67, 160, 71, 0.4);
}
</style>
