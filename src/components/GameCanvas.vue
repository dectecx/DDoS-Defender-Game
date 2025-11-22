<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { GridManager } from '../game/GridManager';
import { EnemyManager } from '../game/EnemyManager';
import { TowerManager } from '../game/TowerManager';
import { ProjectileManager } from '../game/ProjectileManager';
import { InteractionManager } from '../game/InteractionManager';
import { WaveManager } from '../game/WaveManager';
import { gameState } from '../game/GameState';
import { EnemyType } from '../game/types';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationFrameId: number;

// Systems
let gridManager: GridManager | null = null;
let enemyManager: EnemyManager | null = null;
let towerManager: TowerManager | null = null;
let projectileManager: ProjectileManager | null = null;
let interactionManager: InteractionManager | null = null;
let waveManager: WaveManager | null = null;

let lastTime = 0;

const resizeCanvas = () => {
  if (!canvasRef.value) return;
  canvasRef.value.width = window.innerWidth;
  canvasRef.value.height = window.innerHeight;
  draw();
};

const handleCanvasClick = (event: MouseEvent) => {
  if (!interactionManager || !canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const result = interactionManager.handleClick(x, y);
  if (result && result.action === 'BUILD' && towerManager) {
    towerManager.addTower(result.x, result.y, result.type);
  }
};

const draw = () => {
  if (!ctx || !canvasRef.value || !gridManager || !enemyManager || !towerManager || !projectileManager) return;
  
  // Clear screen
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // Draw Systems
  gridManager.draw(ctx);
  towerManager.draw(ctx);
  enemyManager.draw(ctx);
  projectileManager.draw(ctx);
  
  // Draw UI Overlay
  ctx.fillStyle = '#00ff00';
  ctx.font = '20px monospace';
  ctx.fillText('DDoS Defender - System Online', 20, 40);
  ctx.fillText(`Wave: ${gameState.wave}`, 20, 70);
  ctx.fillText(`Enemies: ${enemyManager.enemies.length}`, 20, 100);
  ctx.fillText(`Money: $${gameState.money}`, 20, 130);
  ctx.fillText(`HP: ${gameState.hp}%`, 20, 160);
  
  if (gameState.isGameOver) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYSTEM OFFLINE (GAME OVER)', canvasRef.value.width / 2, canvasRef.value.height / 2);
    ctx.textAlign = 'left';
  }
};

const loop = (timestamp: number) => {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (!gameState.isGameOver) {
    if (waveManager) waveManager.update(deltaTime);
    if (enemyManager) enemyManager.update(deltaTime);
    if (projectileManager) projectileManager.update(deltaTime);
    if (towerManager) towerManager.update(deltaTime, timestamp);
  }

  draw();
  animationFrameId = requestAnimationFrame(loop);
};

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d');
    
    // Initialize Systems
    gridManager = new GridManager({ width: 20, height: 12, cellSize: 64 });
    enemyManager = new EnemyManager(gridManager);
    projectileManager = new ProjectileManager(enemyManager);
    towerManager = new TowerManager(gridManager, enemyManager, projectileManager);
    interactionManager = new InteractionManager(gridManager);
    waveManager = new WaveManager(enemyManager);

    window.addEventListener('resize', resizeCanvas);
    canvasRef.value.addEventListener('click', handleCanvasClick);
    
    resizeCanvas();
    requestAnimationFrame(loop);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('click', handleCanvasClick);
  }
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
