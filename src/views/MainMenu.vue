<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showCredits = ref(false);
const developerName = ref('Dec');

const startGame = () => {
  router.push('/game');
};

const openGuide = () => {
  router.push('/guide');
};

const openSettings = () => {
  router.push('/settings');
};

const toggleCredits = () => {
  showCredits.value = !showCredits.value;
};
</script>

<template>
  <div class="main-menu">
    <!-- Background Animation -->
    <div class="bg-animation">
      <div class="grid-bg"></div>
    </div>

    <!-- Main Content -->
    <div class="menu-container">
      <div class="menu-card">
        <!-- Title -->
        <h1 class="game-title">
          <span class="title-line">DDoS</span>
          <span class="title-line">Defender</span>
        </h1>
        <p class="game-subtitle">Protect the Server. Stop the Attack.</p>

        <!-- Menu Buttons -->
        <div class="menu-buttons">
          <button class="menu-btn primary" @click="startGame">
            <span class="btn-icon">▶</span>
            Start Game
          </button>

          <button class="menu-btn" @click="openGuide">
            <span class="btn-icon">📖</span>
            Game Guide
          </button>

          <button class="menu-btn" @click="openSettings">
            <span class="btn-icon">⚙️</span>
            Settings
          </button>

          <button class="menu-btn" @click="toggleCredits">
            <span class="btn-icon">ℹ️</span>
            Credits
          </button>
        </div>

        <!-- Version -->
        <div class="version">v0.8.0 - Phase 11</div>
      </div>
    </div>

    <!-- Credits Modal -->
    <div v-if="showCredits" class="modal-overlay" @click="toggleCredits">
      <div class="modal-card" @click.stop>
        <h2>Credits</h2>
        <div class="credits-content">
          <p><strong>DDoS Defender</strong></p>
          <p>A tower defense game with cybersecurity theme</p>
          <br>
          <p><strong>Development:</strong></p>
          <p>Lead Developer: {{ developerName }}</p>
          <p>AI Assistant: Google Gemini</p>
          <br>
          <p><strong>Technologies:</strong></p>
          <p>Vue 3, TypeScript, Canvas API</p>
          <br>
          <p>© 2025 - Built by {{ developerName }}</p>
        </div>
        <button class="menu-btn" @click="toggleCredits">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-menu {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
}

/* Animated Background */
.bg-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  overflow: hidden;
}

.grid-bg {
  position: absolute;
  width: 200%;
  height: 200%;
  background-image:
    linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px),
    linear-gradient(180deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridScroll 20s linear infinite;
}

@keyframes gridScroll {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(50px, 50px);
  }
}

/* Menu Container */
.menu-container {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.menu-card {
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 20px;
  padding: 60px 80px;
  box-shadow: 0 20px 60px rgba(0, 255, 0, 0.2);
  text-align: center;
  max-width: 500px;
  width: 90%;
}

/* Title */
.game-title {
  font-family: 'Courier New', monospace;
  font-size: 64px;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 20px rgba(0, 255, 0, 0.8);
  margin: 0 0 10px 0;
  line-height: 1.1;
}

.title-line {
  display: block;
}

.game-subtitle {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: #00d4ff;
  margin: 0 0 50px 0;
  opacity: 0.9;
}

/* Menu Buttons */
.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
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
  gap: 12px;
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
  font-size: 22px;
}

.menu-btn.primary:hover {
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
}

.btn-icon {
  font-size: 20px;
}

/* Version */
.version {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: rgba(0, 255, 0, 0.5);
  margin-top: 20px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 255, 0, 0.3);
}

.modal-card h2 {
  font-family: 'Courier New', monospace;
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  margin: 0 0 20px 0;
}

.credits-content {
  font-family: 'Courier New', monospace;
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 30px;
  text-align: left;
}

.credits-content p {
  margin: 4px 0;
}

.credits-content strong {
  color: #00d4ff;
}

/* Responsive */
@media (max-width: 768px) {
  .menu-card {
    padding: 40px 30px;
  }

  .game-title {
    font-size: 48px;
  }

  .game-subtitle {
    font-size: 16px;
  }

  .menu-btn {
    font-size: 16px;
    padding: 14px 24px;
  }

  .menu-btn.primary {
    font-size: 20px;
  }
}
</style>
