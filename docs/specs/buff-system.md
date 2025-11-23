# Buff System Specification

## Overview
The buff system allows special towers to provide stat bonuses to nearby towers, enhancing their effectiveness.

## Buff Towers

### CODE_FARMER 💰
**Type**: Passive Income Generator  
**Cost**: $250 (base) + $100 per existing CODE_FARMER  
**Range**: N/A  
**Effect**: Generates +5 gold/second  

**Mechanics**:
- Does not attack or buff other towers
- Each farmer provides fixed 5 gold/second (no diminishing returns)
- Cost scaling encourages strategic placement timing
- Price displayed dynamically in UI

---

### SUPERVISOR ⚡
**Type**: Attack Speed Buffer  
**Cost**: $300 (fixed)  
**Range**: 2 cells (buff area)  
**Effect**: +20% attack speed to towers within range  

**Mechanics**:
- Reduces cooldown by 20% (cooldown × 0.8)
- Stacks up to 2 times (max +40% attack speed)
- Does not buff itself
- Visual: Red tower with gold range indicator

---

### SYSTEM_ANALYST 🎯
**Type**: Range Buffer  
**Cost**: $350 (fixed)  
**Range**: 2 cells (buff area)  
**Effect**: +1 cell range to towers within range  

**Mechanics**:
- Adds 1 full cell to attack range
- Stacks up to 2 times (max +2 cells)
- Does not buff itself
- Visual: Teal tower with gold range indicator

---

## Buff Mechanics

### Stacking Rules
- **Attack Speed**: Max 2 stacks (40% total)
- **Range**: Max 2 stacks (+2 cells total)
- **Income**: Does not stack on individual towers

### Application
- Buffs applied in real-time when buff tower is built
- Automatically removed when buff tower is sold
- Recalculated when towers move or are built/sold

### Display
Buffed stats shown in Tower Info Panel:
- Range: `3.0 +100% (+1.0) = 4.0 cells`
- Attack Speed: `1.00/s +20% = 1.20/s`
- Buff bonuses shown in green (#00ff88)

---

## Visual Indicators

### Range Circles
- **Attack Towers**: Green dashed circle showing attack range
- **Buff Towers**: Gold dashed circle showing buff area
- Displayed when tower is selected
- Shows buffed range for attack towers

### UI Elements
- CODE_FARMER cost updates dynamically in build menu
- Passive income rate displayed at bottom of screen
- Tower colors distinguish buff towers from attack towers

---

## Strategy Notes

### CODE_FARMER
- First farmer costs $250, but each additional one costs +$100
- Balance income generation with tower density
- Early farmers provide economic advantage
- Consider placement near defensive chokepoints

### SUPERVISOR
- Best near high-value, slow-firing towers (e.g., DPI)
- Stacking two supervisors on expensive towers maximizes value
- Position centrally to buff multiple key towers

### SYSTEM_ANALYST
- Extends reach of short-range towers
- Critical for creating defensive depth
- Pair with CACHE towers for slowing coverage
- Stack for extended perimeter defense

---

## Technical Implementation

### BuffSystem Class
Location: `src/game/systems/BuffSystem.ts`

**Methods**:
- `applyBuff()`: Add buff to a tower
- `removeBuffsFromSource()`: Clean up when buff tower sold
- `getTotalBuff()`: Calculate stacked buff value
- `calculatePassiveIncome()`: Total gold/sec from farmers
- `applyAreaBuffs()`: Apply buffs to towers in range

**Buff Types**:
```typescript
BuffType.INCOME        // CODE_FARMER
BuffType.ATTACK_SPEED  // SUPERVISOR  
BuffType.RANGE         // SYSTEM_ANALYST
```

### Integration
- TowerManager owns BuffSystem instance
- Buffs calculated each frame during tower update
- UI components access BuffSystem for display
- InteractionManager uses dynamic pricing from TowerManager
