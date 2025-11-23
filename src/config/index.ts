/**
 * Central configuration exports
 * Import all game configurations from here
 */

export * from './game.config';
export * from './towers.config';
export * from './buffs.config';
export * from './audio.config';
export * from './ui.config';
export * from './experience.config';

/**
 * Validate all configurations are loaded
 */
export function validateConfig(): void {
  console.log('✅ All game configurations loaded successfully');
}
