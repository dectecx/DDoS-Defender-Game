<script setup lang="ts">
import { RouterView } from 'vue-router';
// App is now the router container
</script>

<template>
  <RouterView />
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
