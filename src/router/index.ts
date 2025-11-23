import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'MainMenu',
    component: () => import('../views/MainMenu.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('../views/GameView.vue')
  },
  {
    path: '/guide',
    name: 'Guide',
    component: () => import('../views/GameGuide.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
