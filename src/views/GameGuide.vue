<script setup lang="ts">
import { useRouter } from 'vue-router';
import GameGuideContent from '../components/GameGuideContent.vue';

const router = useRouter();

const goBack = () => {
  router.push('/');
};
</script>

<template>
  <div class="guide-view">
    <div class="guide-container">
      <div class="guide-card">
        <GameGuideContent @back="goBack" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-view {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  overflow-y: auto;
}

.guide-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
}

.guide-card {
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(0, 255, 0, 0.3);
  border-radius: 20px;
  padding: 40px;
  max-width: 900px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 255, 0, 0.2);
}
</style>
