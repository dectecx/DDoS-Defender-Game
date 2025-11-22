# Wave Types and Spawn Schedules

## New Wave Schema

This document defines the enhanced wave configuration schema for Phase 7+.

### Wave Structure

```typescript
interface WaveConfig {
  waveId: number;
  enemies: EnemySpawnConfig[];
  waveTimeout: number; // milliseconds
  rewards: {
    baseGold: number;
    bonusGold: number; // for early completion
  };
  isBossWave?: boolean;
}

interface EnemySpawnConfig {
  type: EnemyType;
  count: number;
  spawnSchedule: SpawnSchedule;
}

type SpawnSchedule = 
  | { type: 'interval', interval: number }
  | { type: 'burst', bursts: Array<{ time: number, count: number }> }
  | { type: 'custom', times: number[] }
  | { type: 'random', minInterval: number, maxInterval: number, duration: number };
```

### Example Waves

#### Wave 1: Simple Interval
```json
{
  "waveId": 1,
  "enemies": [
    {
      "type": "REQ_STD",
      "count": 10,
      "spawnSchedule": {
        "type": "interval",
        "interval": 1000
      }
    }
  ],
  "waveTimeout": 30000,
  "rewards": {
    "baseGold": 60,
    "bonusGold": 120
  }
}
```

#### Wave 6: Mixed Composition
```json
{
  "waveId": 6,
  "enemies": [
    {
      "type": "REQ_STD",
      "count": 8,
      "spawnSchedule": {
        "type": "custom",
        "times": [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000]
      }
    },
    {
      "type": "REQ_HEAVY",
      "count": 2,
      "spawnSchedule": {
        "type": "custom",
        "times": [2500, 6500]
      }
    },
    {
      "type": "REQ_STREAM",
      "count": 12,
      "spawnSchedule": {
        "type": "burst",
        "bursts": [
          { "time": 8000, "count": 6 },
          { "time": 9000, "count": 6 }
        ]
      }
    }
  ],
  "waveTimeout": 30000,
  "rewards": {
    "baseGold": 110,
    "bonusGold": 220
  }
}
```

#### Wave 10: Boss Wave
```json
{
  "waveId": 10,
  "enemies": [
    {
      "type": "REQ_STD",
      "count": 5,
      "spawnSchedule": {
        "type": "interval",
        "interval": 1000
      }
    },
    {
      "type": "ZERO_DAY",
      "count": 1,
      "spawnSchedule": {
        "type": "custom",
        "times": [10000]
      }
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
