<script setup lang="ts">
import { useRouter } from 'vue-router';
import { GameActions } from '../game/GameState';

// Props
const props = defineProps<{
  show: boolean;
  isVictory: boolean;
  wave: number;
  score: number;
}>();

// Emits
const emit = defineEmits<{
  restart: [];
}>();

const router = useRouter();

const handleRestart = () => {
  GameActions.resetGame();
  emit('restart');
};

const handleMainMenu = () => {
  router.push('/');
};
</script>

<template>
  <Transition name="modal">
    <div class="game-over-overlay" v-if="show" @click.self="handleMainMenu">
      <div class="game-over-modal">
        <!-- Title -->
        <h1 class="game-over-title" :class="{ victory: isVictory }">
          <span class="icon">{{ isVictory ? '🎉' : '💥' }}</span>
          {{ isVictory ? 'VICTORY!' : 'GAME OVER' }}
        </h1>
        
        <!-- Stats -->
        <div class="game-over-stats">
          <div class="stat-item">
            <span class="stat-label">Wave Reached</span>
            <span class="stat-value">{{ wave }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Final Score</span>
            <span class="stat-value">{{ score }}</span>
          </div>
        </div>
        
        <!-- Message -->
        <p class="game-over-message">
          {{ isVictory 
            ? 'All threats neutralized! Your defenses held strong.' 
            : 'System compromised. Defense protocols failed.' 
          }}
        </p>
        
        <!-- Actions -->
        <div class="game-over-actions">
          <button class="btn-restart" @click="handleRestart">
            <span class="btn-icon">🔄</span>
            <span>Restart</span>
          </button>
          <button class="btn-menu" @click="handleMainMenu">
            <span class="btn-icon">🏠</span>
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.game-over-modal {
  background: rgba(26, 26, 26, 0.95);
  border: 3px solid #ff4444;
  border-radius: 20px;
  padding: 40px 50px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 0 30px rgba(255, 68, 68, 0.5),
              inset 0 0 30px rgba(255, 68, 68, 0.1);
  font-family: 'Courier New', monospace;
  text-align: center;
}

.game-over-modal.victory {
  border-color: #00ff88;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.5),
              inset 0 0 30px rgba(0, 255, 136, 0.1);
}

.game-over-title {
  font-size: 48px;
  color: #ff4444;
  margin: 0 0 30px 0;
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.game-over-title.victory {
  color: #00ff88;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
}

.game-over-title .icon {
  font-size: 56px;
}

.game-over-stats {
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
  padding: 20px 0;
  border-top: 1px solid rgba(0, 255, 0, 0.3);
  border-bottom: 1px solid rgba(0, 255, 0, 0.3);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #888;
  text-transform: uppercase;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.game-over-message {
  color: #ccc;
  font-size: 16px;
  line-height: 1.6;
  margin: 20px 0 30px 0;
}

.game-over-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-restart,
.btn-menu {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  padding: 15px 30px;
  border: 2px solid;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  justify-content: center;
}

.btn-restart {
  background: rgba(0, 255, 0, 0.1);
  border-color: #00ff00;
  color: #00ff00;
}

.btn-restart:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
  transform: translateY(-2px);
}

.btn-menu {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
  color: #00d4ff;
}

.btn-menu:hover {
  background: rgba(0, 212, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 24px;
}

/* Modal enter/leave transitions */
.modal-enter-active {
  animation: modal-fade-in 0.4s ease;
}

.modal-leave-active {
  animation: modal-fade-out 0.3s ease;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes modal-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .game-over-modal {
    padding: 30px 25px;
  }
  
  .game-over-title {
    font-size: 36px;
  }
  
  .game-over-actions {
    flex-direction: column;
  }
  
  .btn-restart,
  .btn-menu {
    width: 100%;
  }
}
</style>
