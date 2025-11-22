# Wave Configuration & Design

## Overview
This document defines the wave progression, enemy compositions, and balance for DDoS Defender.

---

## Wave Progression Formula

### Gold Rewards
- **Base Gold**: `50 + (waveNumber × 10)`
- **Bonus Gold**: `baseGold × 2` (for early completion)
- **Bonus Decay**: `bonusGold × (remainingTime / totalTimeout)`

### Enemy Count
- **Total Enemies**: `10 + (waveNumber × 2)`
- **Boss Waves** (every 10): Boss + minimal support

### Timeout Period
- **Early Waves (1-10)**: 30 seconds
- **Mid Waves (11-20)**: 20 seconds  
- **Late Waves (21+)**: 15 seconds

---

## Wave Templates

### Wave 1-5: Tutorial Waves
**Objective**: Teach basic mechanics

```json
{
  "waveId": 1,
  "enemies": [
    {
      "type": "REQ_STD",
      "count": 10,
      "spawnSchedule": "interval",
      "interval": 1000
    }
  ],
  "waveTimeout": 30000,
  "rewards": {
    "baseGold": 60,
    "bonusGold": 120
  }
}
```

---

### Wave 6-9: Mixed Composition
**Objective**: Introduce variety

```json
{
  "waveId": 6,
  "enemies": [
    {
      "type": "REQ_STD",
      "count": 8,
      "spawnSchedule": [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]
    },
    {
      "type": "REQ_HEAVY",
      "count": 2,
      "spawnSchedule": [2500, 6500]
    },
    {
      "type": "REQ_STREAM",
      "count": 12,
      "spawnSchedule": [8000, 8100, 8200, 8300, 8400, 8500, 8600, 8700, 8800, 8900, 9000, 9100]
    }
  ],
  "waveTimeout": 30000,
  "rewards": {
    "baseGold": 110,
    "bonusGold": 220
  }
}
```

---

### Wave 10: First Boss
**Objective**: Test player's defenses

```json
{
  "waveId": 10,
  "enemies": [
    {
      "type": "REQ_STD",
      "count": 5,
      "spawnSchedule": [0, 1000, 2000, 3000, 4000]
    },
    {
      "type": "ZERO_DAY",
      "count": 1,
      "spawnSchedule": [10000]
    }
  ],
  "waveTimeout": 40000,
  "rewards": {
    "baseGold": 250,
    "bonusGold": 500
  },
  "isBossWave": true
}
```

---

### Wave 11-19: Escalation
**Objective**: Increase difficulty steadily

```json
{
  "waveId": 15,
  "enemies": [
    {
      "type": "REQ_HEAVY",
      "count": 5,
      "spawnSchedule": [0, 2000, 4000, 6000, 8000]
    },
    {
      "type": "REQ_STREAM",
      "count": 20,
      "spawnSchedule": "burst",
      "burstSchedule": [
        {
          "time": 1000,
          "count": 10
        },
        {
          "time": 5000,
          "count": 10
        }
      ]
    },
    {
      "type": "REQ_STD",
      "count": 10,
      "spawnSchedule": "interval",
      "interval": 800
    }
  ],
  "waveTimeout": 25000,
  "rewards": {
    "baseGold": 200,
    "bonusGold": 400
  }
}
```

---

### Wave 20: Second Boss
**Objective**: Major challenge

```json
{
  "waveId": 20,
  "enemies": [
    {
      "type": "REQ_HEAVY",
      "count": 3,
      "spawnSchedule": [0, 3000, 6000]
    },
    {
      "type": "ZERO_DAY",
      "count": 1,
      "spawnSchedule": [15000]
    },
    {
      "type": "REQ_STREAM",
      "count": 15,
      "spawnSchedule": "burst",
      "burstSchedule": [
        {
          "time": 18000,
          "count": 15
        }
      ]
    }
  ],
  "waveTimeout": 50000,
  "rewards": {
    "baseGold": 500,
    "bonusGold": 1000
  },
  "isBossWave": true
}
```

---

## Complete Wave Table (Waves 1-30)

| Wave | REQ_STD | REQ_HEAVY | REQ_STREAM | BOSS | Total HP | Base Gold | Type |
|------|---------|-----------|------------|------|----------|-----------|------|
| 1 | 10 | 0 | 0 | 0 | 1,000 | 60 | Tutorial |
| 2 | 12 | 0 | 0 | 0 | 1,200 | 70 | Tutorial |
| 3 | 10 | 2 | 0 | 0 | 1,600 | 80 | Tutorial |
| 4 | 8 | 0 | 12 | 0 | 1,160 | 90 | Tutorial |
| 5 | 10 | 3 | 10 | 0 | 2,200 | 100 | Tutorial |
| 6 | 8 | 2 | 12 | 0 | 1,760 | 110 | Mixed |
| 7 | 12 | 4 | 15 | 0 | 3,150 | 120 | Mixed |
| 8 | 10 | 5 | 20 | 0 | 3,100 | 130 | Mixed |
| 9 | 15 | 6 | 25 | 0 | 4,550 | 140 | Mixed |
| **10** | 5 | 0 | 0 | **1** | **1,500** | **250** | **Boss** |
| 11 | 15 | 5 | 20 | 0 | 4,100 | 160 | Escalation |
| 12 | 20 | 8 | 25 | 0 | 5,650 | 170 | Escalation |
| ... | ... | ... | ... | ... | ... | ... | ... |
| **20** | 0 | 3 | 15 | **1** | **2,350** | **500** | **Boss** |
| ... | ... | ... | ... | ... | ... | ... | ... |
| **30** | 10 | 10 | 30 | **1** | **5,900** | **800** | **Boss** |

---

## Special Wave Events

### HP Recovery Waves (Every 5 waves)
Wave 5, 10, 15, 20, 25, 30...

**Reward**: Restore 5% of max HP (capped at 100%)

```typescript
if (waveId % 5 === 0) {
  GameActions.healBase(5); // Heal 5 HP (5% of 100)
}
```

---

### Bonus Wave (Every 15 waves)
Wave 15, 30, 45...

**Special Reward**: Extra tower unlock or permanent buff

```json
{
  "waveId": 15,
  "specialReward": {
    "type": "TOWER_UNLOCK",
    "tower": "FIREWALL_ULTIMATE"
  }
}
```

---

## Spawn Schedule Types

### 1. Interval Spawning
Spawn enemies at fixed intervals
```json
{
  "type": "REQ_STD",
  "count": 10,
  "spawnSchedule": "interval",
  "interval": 1000 // 1 enemy per second
}
```

### 2. Burst Spawning
Spawn multiple enemies simultaneously
```json
{
  "type": "REQ_STREAM",
  "count": 20,
  "spawnSchedule": "burst",
  "burstSchedule": [
    { "time": 0, "count": 10 },
    { "time": 5000, "count": 10 }
  ]
}
```

### 3. Custom Schedule
Precise control over each spawn
```json
{
  "type": "REQ_HEAVY",
  "count": 5,
  "spawnSchedule": [0, 2000, 4000, 6000, 8000]
}
```

### 4. Random Schedule
Spawn within a time range (for variety)
```json
{
  "type": "REQ_STD",
  "count": 15,
  "spawnSchedule": "random",
  "minInterval": 500,
  "maxInterval": 2000,
  "duration": 30000
}
```

---

## Difficulty Curves

### Recommended Progression

```
Waves 1-5: Easy (Tutorial)
├─ Low enemy count
├─ Single enemy type per wave
└─ Generous timeouts

Waves 6-10: Normal
├─ Mixed compositions
├─ Moderate timeouts
└─ First boss challenge

Waves 11-20: Hard
├─ High enemy counts
├─ Complex spawn patterns
├─ Multiple high-HP enemies
└─ Second boss (harder)

Waves 21-30: Very Hard
├─ Maximum enemy density
├─ Minimal timeouts
├─ Boss + support
└─ Requires optimal strategy

Waves 31+: Endless
├─ Procedurally generated
├─ Scales infinitely
└─ Leaderboard competition
```

---

## Balance Considerations

### Gold Economy
- Player should afford 1-2 towers per wave (early)
- Mid-game: Focus on upgrades > new towers
- Late-game: Both upgrades and special towers

### Tower Placement
- Wave 1: 1 RATE_LIMIT tower
- Wave 3: 2-3 basic towers
- Wave 5: 1 CODE_FARMER for economy
- Wave 10: 5-6 towers + 1 upgraded
- Wave 20: 10+ towers, multiple upgraded
- Wave 30: Full map, strategic placement

### Time Pressure
- Early waves: Relaxed (learn mechanics)
- Mid waves: Moderate (plan strategy)
- Late waves: Intense (constant pressure)

---

## Testing Checklist

### Wave Balance Testing
- [ ] Can complete wave 1-5 with minimal towers
- [ ] Wave 10 boss is challenging but fair
- [ ] Gold income matches tower costs
- [ ] Early completion bonus is meaningful
- [ ] HP recovery every 5 waves feels impactful
- [ ] Wave 20-30 requires strategic placement
- [ ] No impossible waves (always winnable)

### Player Experience
- [ ] Clear difficulty progression
- [ ] Varied gameplay (not repetitive)
- [ ] Satisfying tower upgrades
- [ ] Strategic depth in tower placement
- [ ] Risk/reward in early wave completion
