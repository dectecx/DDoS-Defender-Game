# Game Flow & Mechanics

## Overview
This document describes the complete game flow, core mechanics, and systems in DDoS Defender.

---

## Game Flow Diagram

```mermaid
graph TD
    Start[Game Start] --> MainMenu[Main Menu]
    MainMenu --> |Start Game| LoadLevel[Load Level]
    MainMenu --> |Game Guide| Guide[Show Guide]
    MainMenu --> |Credits| Credits[Show Credits]
    MainMenu --> |Settings| Settings[Audio/Speed Settings]
    
    LoadLevel --> InitGame[Initialize Game]
    InitGame --> WaveStart[Wave Start]
    
    WaveStart --> SpawnEnemies{Spawn<br/>Schedule}
    SpawnEnemies --> |Interval| Enemy1[Spawn Enemy]
    SpawnEnemies --> |Burst| Enemy2[Spawn Multiple]
    SpawnEnemies --> |Custom| Enemy3[Spawn at Time]
    
    Enemy1 --> EnemyMove[Enemy Moves]
    Enemy2 --> EnemyMove
    Enemy3 --> EnemyMove
    
    EnemyMove --> TowerTarget{Tower<br/>in Range?}
    TowerTarget --> |Yes| TowerFire[Tower Fires]
    TowerTarget --> |No| EnemyMove
    
    TowerFire --> ProjectileHit{Hit Enemy?}
    ProjectileHit --> |Yes| DamageEnemy[Damage Enemy]
    ProjectileHit --> |No| ProjectileMove[Projectile Moves]
    ProjectileMove --> ProjectileHit
    
    DamageEnemy --> EnemyDead{Enemy Dead?}
    EnemyDead --> |Yes| Reward[Award Gold/Exp]
    EnemyDead --> |No| EnemyMove
    
    Reward --> TowerExp[Tower Gains Exp]
    TowerExp --> LevelUp{Level Up?}
    LevelUp --> |Yes| Upgrade[Upgrade Stats]
    LevelUp --> |No| CheckWave
    Upgrade --> CheckWave[Check Wave Status]
    
    EnemyMove --> Reach{Reached<br/>Base?}
    Reach --> |Yes| DamageBase[Damage Base]
    Reach --> |No| CheckWave
    
    DamageBase --> GameOver{HP = 0?}
    GameOver --> |Yes| EndGame[Game Over Screen]
    GameOver --> |No| CheckWave
    
    CheckWave --> AllSpawned{All Enemies<br/>Spawned?}
    AllSpawned --> |No| SpawnEnemies
    AllSpawned --> |Yes| AllDead{All Enemies<br/>Dead?}
    
    AllDead --> |No| EnemyMove
    AllDead --> |Yes| WaveComplete[Wave Complete]
    
    WaveComplete --> WaveReward[Award Base Gold]
    WaveReward --> Timeout[Start Timeout]
    
    Timeout --> WaitTimer{Timer > 0?}
    WaitTimer --> |Yes| ShowNext[Show Next Wave Button]
    ShowNext --> UserChoice{User Click?}
    UserChoice --> |Yes| BonusGold[Award Bonus Gold]
    UserChoice --> |No| TimerTick[Timer--]
    TimerTick --> WaitTimer
    
    WaitTimer --> |No| NextWave{More Waves?}
    BonusGold --> NextWave
    
    NextWave --> |Yes| HPRecovery{Wave % 5<br/>= 0?}
    NextWave --> |No| Victory[Victory Screen]
    
    HPRecovery --> |Yes| HealBase[Heal 5 HP]
    HPRecovery --> |No| WaveStart
    HealBase --> WaveStart
    
    Victory --> EndGame
    EndGame --> MainMenu
```

---

## Core Mechanics

### 1. Tower Placement

```mermaid
graph LR
    Click[Player Clicks Grid] --> Valid{Valid Cell?}
    Valid --> |No| Error[Show Error]
    Valid --> |Yes| Money{Enough Gold?}
    Money --> |No| ErrorMoney[Not Enough Money]
    Money --> |Yes| Build[Build Tower]
    Build --> DeductGold[Deduct Gold]
    DeductGold --> UpdateGrid[Update Grid State]
```

**Rules**:
- Can only build on `EMPTY` cells
- Cannot build on `PATH` or `BLOCKED` cells
- Must have sufficient gold
- Grid cell becomes `TOWER` type

---

### 2. Tower Targeting

```mermaid
graph TD
    TowerUpdate[Tower Update] --> Cooldown{Cooldown<br/>Ready?}
    Cooldown --> |No| Skip[Skip This Frame]
    Cooldown --> |Yes| FindEnemies[Find Enemies in Range]
    
    FindEnemies --> Filter[Filter Active Enemies]
    Filter --> Sort{Targeting<br/>Strategy?}
    
    Sort --> |First| SortPath[Sort by Path Progress]
    Sort --> |Strongest| SortHP[Sort by HP]
    Sort --> |Closest| SortDist[Sort by Distance]
    
    SortPath --> Target[Select Target]
    SortHP --> Target
    SortDist --> Target
    
    Target --> Fire[Fire Projectile]
    Fire --> ResetCooldown[Reset Cooldown Timer]
```

**Targeting Strategies**:
- **First**: Enemy furthest along path (default)
- **Strongest**: Enemy with highest current HP (DPI)
- **Closest**: Enemy nearest to tower

---

### 3. Experience & Leveling

```mermaid
graph LR
    Kill[Enemy Killed] --> Award[Award Exp to Attacker]
    Award --> Add[Add Exp to Tower]
    Add --> Check{Exp >= MaxExp?}
    Check --> |No| Wait[Wait for More Exp]
    Check --> |Yes| LevelUp[Level Up]
    LevelUp --> UpgradeStats[Increase Stats]
    UpgradeStats --> ResetExp[Exp = Overflow]
    ResetExp --> IncMaxExp[Increase MaxExp]
```

**Level Up Benefits**:
- Damage: +5%
- Range: +2%
- Cooldown: -3%
- Visual indicator (glow effect)

**MaxExp Formula**: `50 × level^1.5`

---

### 4. Wave Transition

```mermaid
graph TD
    Complete[Last Enemy Killed] --> Reward[Award Base Gold]
    Reward --> Timer[Start Timeout Timer]
    Timer --> Display[Display UI]
    
    Display --> Show1[Show Countdown]
    Display --> Show2[Show Next Wave Button]
    Display --> Show3[Show Bonus Gold Amount]
    
    Show3 --> Update[Update Every Frame]
    Update --> Calc[Bonus = Max × Remaining%]
    
    Calc --> Input{User Input?}
    Input --> |Click Button| EarlyStart[Start Next Wave]
    Input --> |Wait| TimerExpire{Timer = 0?}
    
    TimerExpire --> |No| Update
    TimerExpire --> |Yes| ForceStart[Force Start Next Wave]
    
    EarlyStart --> ClaimBonus[Claim Bonus Gold]
    ForceStart --> NoBonus[No Bonus]
    
    ClaimBonus --> NextWave[Load Next Wave]
    NoBonus --> NextWave
```

**Bonus Formula**: 
```typescript
const bonusRatio = remainingTime / totalTimeout;
const actualBonus = Math.floor(maxBonus * bonusRatio);
```

---

### 5. Buff Tower System

```mermaid
graph TD
    PlaceBuff[Place Buff Tower] --> ScanRange[Scan Buff Range]
    ScanRange --> FindTowers[Find Affected Towers]
    FindTowers --> ApplyBuff[Apply Buff to Each]
    
    ApplyBuff --> Store[Store Buff Reference]
    Store --> UpdateStats[Recalculate Tower Stats]
    
    Remove[Buff Tower Removed] --> ClearBuff[Remove Buff from Towers]
    ClearBuff --> Recalc[Recalculate Stats]
```

**Buff Stacking**:
- Same buff from multiple sources: Additive up to 2 stacks
- Different buffs: Fully stackable
- Example: 2 Supervisors = +40% attack speed

---

## Game States

### State Machine

```mermaid
stateDiagram-v2
    [*] --> MainMenu
    MainMenu --> Playing: Start Game
    MainMenu --> Guide: View Guide
    MainMenu --> Credits: View Credits
    MainMenu --> Settings: Open Settings
    
    Guide --> MainMenu: Back
    Credits --> MainMenu: Back
    Settings --> MainMenu: Back
    
    Playing --> Paused: Pause Button
    Paused --> Playing: Resume
    Paused --> MainMenu: Quit
    
    Playing --> WaveTransition: Wave Complete
    WaveTransition --> Playing: Next Wave
    
    Playing --> GameOver: HP = 0
    Playing --> Victory: All Waves Complete
    
    GameOver --> MainMenu: Restart
    Victory --> MainMenu: Restart
```

---

## User Interface Layout

### In-Game HUD

```
┌─────────────────────────────────────────────┐
│ Gold: 500  HP: 80/100  Wave: 5/30           │ <- Top Bar
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│           [Game Canvas]                     │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ [Rate Limit] [WAF] [DPI] [Cache]           │ <- Tower Selection
│    100g      200g   300g   150g             │
└─────────────────────────────────────────────┘

Buttons (floating):
├─ [⏸ Pause] (top-right)
├─ [⏩ Speed: x2] (top-right)
└─ [🔊 Audio] (top-right)
```

### Tower Info Panel (on tower click)

```
┌─────────────────────────┐
│   RATE_LIMIT Tower      │
│                         │
│   Level: 3              │
│   Exp: 120/300          │
│   ━━━━━━━━░░░░ 40%      │
│                         │
│   Damage: 22            │
│   Range: 3.1 cells      │
│   Cooldown: 470ms       │
│                         │
│   Sell Value: 157g      │
│                         │
│   [Sell Tower]          │
└─────────────────────────┘
```

### Wave Transition Overlay

```
┌─────────────────────────┐
│   Wave 5 Complete!      │
│                         │
│   Base Reward: +100g    │
│                         │
│   Next wave in: 23s     │
│   Bonus: +82g           │
│                         │
│   [Start Next Wave]     │
└─────────────────────────┘
```

---

## Audio Design

### Sound Effects
| Event | Sound | Volume | Priority |
|-------|-------|--------|----------|
| Tower Build | Click + Confirmation | 70% | Medium |
| Tower Fire | Pew/Shot | 40% | Low |
| Enemy Death | Pop/Explode | 60% | Low |
| Wave Complete | Victory Chime | 80% | High |
| Boss Spawn | Dramatic Stinger | 90% | High |
| Game Over | Sad Trombone | 80% | High |
| Level Up | Power Up | 70% | Medium |

### Background Music
- **Main Menu**: Calm techno loop
- **Gameplay**: Upbeat electronic battle music
- **Boss Wave**: Intense orchestral track
- **Victory**: Triumphant fanfare

---

## Performance Considerations

### Optimization Strategies
1. **Object Pooling**: Reuse enemy/projectile objects
2. **Spatial Partitioning**: Grid-based collision detection
3. **Dirty Flags**: Only recalculate buffs when towers change
4. **Request Animation Frame**: Smooth 60 FPS
5. **Canvas Layering**: Separate static/dynamic elements

### Target Performance
- **60 FPS**: With 100+ enemies and 20+ towers
- **Memory**: < 100MB total
- **Load Time**: < 2 seconds

---

## Testing Strategy

### Unit Tests
- Grid coordinate conversion
- Tower targeting logic
- Experience calculations
- Wave progression
- Buff stacking

### Integration Tests
- Tower placement flow
- Enemy spawn timing
- Wave transition
- Audio playback

### E2E Tests
- Complete wave 1-10
- Boss defeat
- Tower upgrade
- Game over scenario
- Victory condition

---

## Accessibility Features

### Planned Accessibility
- [ ] Colorblind mode (alternative visual indicators)
- [ ] Keyboard shortcuts (space = pause, 1-4 = tower select)
- [ ] Scalable UI (text size options)
- [ ] Screen reader support (for menus)
- [ ] Reduced motion mode (disable particles)

---

## Future Enhancements

### Post-Launch Features
1. **Save/Load System**: Persist progress
2. **Daily Challenges**: Special wave compositions
3. **Achievements**: Unlock new towers/skins
4. **Leaderboards**: Compete for high scores
5. **Multiple Maps**: Different paths/difficulties
6. **Custom Waves**: Player-created content
