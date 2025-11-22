import type { Tower } from '../types';

/**
 * Buff types that can be applied to towers
 */
export const BuffType = {
  INCOME: 'INCOME',                // CODE_FARMER: Passive gold income
  ATTACK_SPEED: 'ATTACK_SPEED',    // SUPERVISOR: Cooldown reduction
  RANGE: 'RANGE'                   // SYSTEM_ANALYST: Range increase
} as const;

export type BuffType = typeof BuffType[keyof typeof BuffType];

/**
 * Buff interface
 */
export interface Buff {
  id: string;
  type: BuffType;
  sourceId: string;      // ID of tower providing the buff
  value: number;         // Buff strength
  appliedAt: number;     // Timestamp when applied
}

/**
 * BuffSystem - Manages tower buffs and their effects
 */
export class BuffSystem {
  private buffs: Map<string, Buff[]> = new Map(); // towerId -> buffs[]
  private incomeTowers: Set<string> = new Set();  // Track CODE_FARMER towers

  /**
   * Apply a buff to a tower
   * @param targetTowerId Tower receiving the buff
   * @param sourceTowerId Tower providing the buff
   * @param type Buff type
   * @param value Buff value
   */
  applyBuff(targetTowerId: string, sourceTowerId: string, type: BuffType, value: number) {
    if (!this.buffs.has(targetTowerId)) {
      this.buffs.set(targetTowerId, []);
    }

    const towerBuffs = this.buffs.get(targetTowerId)!;
    
    // Check if buff from this source already exists
    const existingBuff = towerBuffs.find(b => b.sourceId === sourceTowerId && b.type === type);
    
    if (existingBuff) {
      // Update existing buff
      existingBuff.value = value;
      existingBuff.appliedAt = Date.now();
    } else {
      // Add new buff
      towerBuffs.push({
        id: `${sourceTowerId}-${type}-${Date.now()}`,
        type,
        sourceId: sourceTowerId,
        value,
        appliedAt: Date.now()
      });
    }
  }

  /**
   * Remove all buffs from a specific source tower
   * @param sourceTowerId Tower that was providing buffs
   */
  removeBuffsFromSource(sourceTowerId: string) {
    for (const [towerId, buffs] of this.buffs.entries()) {
      const filtered = buffs.filter(b => b.sourceId !== sourceTowerId);
      if (filtered.length === 0) {
        this.buffs.delete(towerId);
      } else {
        this.buffs.set(towerId, filtered);
      }
    }
  }

  /**
   * Remove all buffs from a tower (when tower is sold)
   * @param towerId Tower to remove buffs from
   */
  removeAllBuffs(towerId: string) {
    this.buffs.delete(towerId);
  }

  /**
   * Get total buff value for a tower and buff type
   * Applies stacking limits
   * @param towerId Tower ID
   * @param type Buff type
   * @returns Total buff value
   */
  getTotalBuff(towerId: string, type: BuffType): number {
    const towerBuffs = this.buffs.get(towerId);
    if (!towerBuffs) return 0;

    const relevantBuffs = towerBuffs.filter(b => b.type === type);
    
    // Apply stacking limit (max 2 stacks for ATTACK_SPEED and RANGE)
    if (type === BuffType.ATTACK_SPEED || type === BuffType.RANGE) {
      const limitedBuffs = relevantBuffs.slice(0, 2);
      return limitedBuffs.reduce((sum, buff) => sum + buff.value, 0);
    }
    
    // INCOME buffs don't stack on individual towers
    return relevantBuffs.length > 0 ? relevantBuffs[0]!.value : 0;
  }

  /**
   * Get all buffs for a tower
   * @param towerId Tower ID
   * @returns Array of buffs
   */
  getBuffs(towerId: string): Buff[] {
    return this.buffs.get(towerId) || [];
  }

  /**
   * Register a CODE_FARMER tower for income generation
   * @param towerId Tower ID
   */
  registerIncomeTower(towerId: string) {
    this.incomeTowers.add(towerId);
  }

  /**
   * Unregister a CODE_FARMER tower
   * @param towerId Tower ID
   */
  unregisterIncomeTower(towerId: string) {
    this.incomeTowers.delete(towerId);
  }

  /**
   * Calculate total passive income
   * Each CODE_FARMER provides fixed 5 gold/sec
   * @returns Gold per second
   */
  calculatePassiveIncome(): number {
    const count = this.incomeTowers.size;
    return count * 5; // 5 gold/sec per tower
  }

  /**
   * Apply buffs from a buff tower to nearby towers
   * @param buffTower The tower providing buffs
   * @param allTowers All towers in the game
   * @param buffType Type of buff to apply
   * @param buffValue Value of the buff
   * @param buffRange Range in cells
   */
  applyAreaBuffs(
    buffTower: Tower,
    allTowers: Tower[],
    buffType: BuffType,
    buffValue: number,
    buffRange: number
  ) {
    // Remove old buffs from this source first
    this.removeBuffsFromSource(buffTower.id);

    // Find towers in range and apply buffs
    for (const target of allTowers) {
      if (target.id === buffTower.id) continue; // Don't buff self

      const distance = Math.sqrt(
        Math.pow(target.x - buffTower.x, 2) + 
        Math.pow(target.y - buffTower.y, 2)
      );

      if (distance <= buffRange) {
        this.applyBuff(target.id, buffTower.id, buffType, buffValue);
      }
    }
  }

  /**
   * Clear all buffs (for reset/cleanup)
   */
  clear() {
    this.buffs.clear();
    this.incomeTowers.clear();
  }
}
