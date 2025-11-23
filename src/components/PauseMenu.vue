<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Props {
  show: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  resume: [];
  close: [];
}>();

const showQuitConfirm = ref(false);

const handleResume = () => {
  emit('resume');
};

const handleSettings = () => {
  router.push('/settings');
};

const handleGuide = () => {
  router.push('/guide');
};

const confirmQuit = () => {
  showQuitConfirm.value = true;
};

const cancelQuit = () => {
  showQuitConfirm.value = false;
};

const quitToMenu = () => {
  router.push('/');
};
</script>

<template>
  <div v-if="props.show" class="pause-overlay" @click="handleResume">
    <div class="pause-menu" @click.stop>
      <!-- Pause Title -->
      <h1 class="pause-title">Game Paused</h1>
      
      <!-- Quit Confirmation -->
      <div v-if="showQuitConfirm" class="confirm-dialog">
        <p>Quit to main menu?</p>
        <p class="warning">⚠️ Current progress will be lost!</p>
        <div class="confirm-buttons">
          <button class="menu-btn danger" @click="quitToMenu">
            Quit
          </button>
          <button class="menu-btn" @click="cancelQuit">
            Cancel
          </button>
        </div>
      </div>
      
      <!-- Normal Menu -->
      <div v-else class="pause-buttons">
        <button class="menu-btn primary" @click="handleResume">
          ▶ Resume Game
        </button>
        
        <button class="menu-btn" @click="handleSettings">
          ⚙️ Settings
        </button>
        
        <button class="menu-btn" @click="handleGuide">
          📖 Game Guide
        </button>
        
        <button class="menu-btn danger" @click="confirmQuit">
          ⬅️ Quit to Menu
        </button>
      </div>
      
      <div class="pause-hint">Press ESC to resume</div>
    </div>
  </div>
</template>

<style scoped>
.pause-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.pause-menu {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 255, 0, 0.5);
  border-radius: 20px;
  padding: 50px 60px;
  box-shadow: 0 20px 60px rgba(0, 255, 0, 0.3);
  text-align: center;
  max-width: 450px;
  width: 90%;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.pause-title {
  font-family: 'Courier New', monospace;
  font-size: 42px;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  margin: 0 0 40px 0;
}

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.menu-btn:hover {
  background: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
  transform: translateY(-2px);
}

.menu-btn:active {
  transform: translateY(0);
}

.menu-btn.primary {
  background: linear-gradient(135deg, #00ff00 0%, #00d4ff 100%);
  border-color: #00ff00;
  color: #0a0a0a;
  font-weight: bold;
  font-size: 20px;
}

.menu-btn.primary:hover {
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
}

.menu-btn.danger {
  border-color: #ff0000;
  color: #ff0000;
  background: rgba(255, 0, 0, 0.1);
}

.menu-btn.danger:hover {
  background: rgba(255, 0, 0, 0.2);
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
}

.pause-hint {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: rgba(0, 255, 0, 0.6);
  margin-top: 30px;
}

/* Confirmation Dialog */
.confirm-dialog {
  font-family: 'Courier New', monospace;
}

.confirm-dialog p {
  font-size: 18px;
  color: #ccc;
  margin: 0 0 10px 0;
}

.confirm-dialog .warning {
  font-size: 16px;
  color: #ff9900;
  margin-bottom: 30px;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
}

.confirm-buttons .menu-btn {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .pause-menu {
    padding: 40px 30px;
  }
  
  .pause-title {
    font-size: 36px;
  }
  
  .menu-btn {
    font-size: 16px;
    padding: 14px 24px;
  }
  
  .menu-btn.primary {
    font-size: 18px;
  }
}
</style>
