<script setup lang="ts">
import GameCanvas from './components/GameCanvas.vue';
</script>

<template>
  <GameCanvas />
</template>

<style>
/* Global styles reset for full screen canvas */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
