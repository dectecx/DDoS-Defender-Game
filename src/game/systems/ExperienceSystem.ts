import type { Tower } from '../types';

/**
 * ExperienceSystem - Manages tower leveling and stat progression
 */
export class ExperienceSystem {
  /**
   * Maximum tower level
   */
  static readonly MAX_LEVEL = 10;

  /**
   * Calculate experience required for next level
   * Formula: 50 * level^1.5
   * @param level Current level
   * @returns Experience required for next level
   */
  static calculateMaxExp(level: number): number {
    if (level >= this.MAX_LEVEL) return Infinity;
    return Math.floor(50 * Math.pow(level, 1.5));
  }

  /**
   * Calculate stat value after level increases
   * @param baseValue Base stat value (at level 1)
   * @param level Current level
   * @param type Stat type to calculate
   * @returns New stat value
   */
  static calculateStatIncrease(
    baseValue: number,
    level: number,
    type: 'damage' | 'range' | 'cooldown'
  ): number {
    const multipliers = {
      damage: 1.05,    // +5% per level
      range: 1.02,     // +2% per level
      cooldown: 0.97   // -3% per level (lower is better)
    };

    return baseValue * Math.pow(multipliers[type], level - 1);
  }

  /**
   * Add experience to a tower and check for level up
   * @param tower Tower to add experience to
   * @param exp Experience amount
   * @returns True if tower leveled up
   */
  static addExperience(tower: Tower, exp: number): boolean {
    if (tower.level >= this.MAX_LEVEL) return false;

    tower.exp += exp;
    
    if (tower.exp >= tower.maxExp) {
      return this.levelUp(tower);
    }
    
    return false;
  }

  /**
   * Level up a tower
   * @param tower Tower to level up
   * @returns True if level up was successful
   */
  static levelUp(tower: Tower): boolean {
    if (tower.level >= this.MAX_LEVEL) return false;

    tower.level++;
    tower.exp -= tower.maxExp;
    tower.maxExp = this.calculateMaxExp(tower.level);

    console.log(`Tower ${tower.id} leveled up to ${tower.level}!`);
    
    return true;
  }

  /**
   * Get level progress as percentage
   * @param tower Tower to check
   * @returns Progress percentage (0-100)
   */
  static getLevelProgress(tower: Tower): number {
    if (tower.level >= this.MAX_LEVEL) return 100;
    return (tower.exp / tower.maxExp) * 100;
  }

  /**
   * Calculate total stats boost from levels
   * @param level Current level
   * @returns Object with multipliers for each stat
   */
  static getStatMultipliers(level: number): {
    damage: number;
    range: number;
    cooldown: number;
  } {
    return {
      damage: Math.pow(1.05, level - 1),
      range: Math.pow(1.02, level - 1),
      cooldown: Math.pow(0.97, level - 1)
    };
  }
}
