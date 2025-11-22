<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number;

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  
  // Redraw after resize
  draw();
};

const draw = () => {
  if (!ctx || !canvasRef.value) return;
  
  // Clear screen
  ctx.fillStyle = '#1a1a1a'; // Dark background
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // Draw a test grid or text to verify
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  
  const cellSize = 40;
  for (let x = 0; x < canvasRef.value.width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasRef.value.height);
    ctx.stroke();
  }
  
  for (let y = 0; y < canvasRef.value.height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasRef.value.width, y);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#00ff00';
  ctx.font = '20px monospace';
  ctx.fillText('DDoS Defender - System Online', 20, 40);
};

const loop = () => {
  draw();
  animationFrameId = requestAnimationFrame(loop);
};

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    loop();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <canvas ref="canvasRef" class="game-canvas"></canvas>
</template>

<style scoped>
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
