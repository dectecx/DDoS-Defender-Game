# Enemy Specifications

## Overview
This document defines all enemy types, their stats, rewards, and behaviors in DDoS Defender.

---

## Basic Enemy Types

### REQ_STD (Standard HTTP Request)
**Visual**: Red square, medium size
**Description**: Standard HTTP requests hitting your server

| Attribute | Value |
|-----------|-------|
| HP | 100 |
| Speed | 100 px/s |
| Gold Reward | 10 |
| Experience Reward | 5 |
| Description | Basic enemy, average stats |

---

### REQ_HEAVY (Large Payload)
**Visual**: Dark red square, large size
**Description**: Heavy POST requests with large payloads

| Attribute | Value |
|-----------|-------|
| HP | 300 |
| Speed | 50 px/s |
| Gold Reward | 30 |
| Experience Reward | 15 |
| Description | Slow but tanky, high rewards |

---

### REQ_STREAM (WebSocket Flood)
**Visual**: Light red square, small size
**Description**: Fast WebSocket connections flooding your server

| Attribute | Value |
|-----------|-------|
| HP | 30 |
| Speed | 200 px/s |
| Gold Reward | 5 |
| Experience Reward | 3 |
| Description | Fast and fragile, appears in swarms |

---

## Boss Enemies

### ZERO_DAY (Zero-Day Exploit)
**Visual**: Purple square, very large
**Description**: Advanced persistent threat with special abilities

| Attribute | Value |
|-----------|-------|
| HP | 1000 |
| Speed | 40 px/s |
| Gold Reward | 200 |
| Experience Reward | 100 |
| Special Skill | **Blackout** - Disables nearby towers for 5 seconds |
| Skill Range | 5 cells |
| Skill Trigger | 1% chance per frame |
| Description | Appears every 10 waves |

---

## Planned Enemy Types

### SQL_INJECTION
**Visual**: Orange square
**Status**: Planned for Phase 7

| Attribute | Value |
|-----------|-------|
| HP | 150 |
| Speed | 120 px/s |
| Gold Reward | 15 |
| Experience Reward | 8 |
| Special | Bypasses first tower (requires 2 hits to start taking damage) |

---

### XSS_ATTACK
**Visual**: Yellow square
**Status**: Planned for Phase 7

| Attribute | Value |
|-----------|-------|
| HP | 80 |
| Speed | 150 px/s |
| Gold Reward | 12 |
| Experience Reward | 6 |
| Special | Spawns 2 smaller enemies on death |

---

### RANSOMWARE_BOSS
**Visual**: Black with red pulse
**Status**: Planned for Phase 7

| Attribute | Value |
|-----------|-------|
| HP | 2000 |
| Speed | 30 px/s |
| Gold Reward | 500 |
| Experience Reward | 250 |
| Special Skill | **Encryption** - Locks down towers, requiring gold to unlock |
| Description | Appears on wave 20, 40, 60... |

---

## Enemy Spawn Patterns

### Swarm Pattern
Used for: REQ_STREAM
```
Spawn 10-20 enemies simultaneously
Short interval between groups (0.5s)
```

### Tank Pattern
Used for: REQ_HEAVY
```
Spawn 1-3 enemies
Long interval between spawns (3-5s)
Often mixed with other types
```

### Boss Wave
Used for: All Boss types
```
Boss spawns alone or with minimal support
Wave 10, 20, 30, etc.
Dramatic music and visual effects
```

---

## Status Effects Vulnerability

| Enemy Type | Slow | Stun | Burn | Freeze |
|------------|------|------|------|--------|
| REQ_STD | ✅ (100%) | ✅ | ✅ | ✅ |
| REQ_HEAVY | ✅ (50%) | ❌ | ✅ | ✅ (50%) |
| REQ_STREAM | ✅ (150%) | ✅ | ✅ | ❌ |
| ZERO_DAY | ❌ | ❌ | ✅ (50%) | ❌ |

**Legend**:
- ✅ = Affected normally
- ✅ (X%) = Affected with X% effectiveness
- ❌ = Immune

---

## Balance Notes

### Difficulty Scaling
- Early waves (1-5): Mostly REQ_STD
- Mid waves (6-15): Mix of all types
- Late waves (16+): Heavy focus on REQ_HEAVY and bosses

### Gold Economy
- Average gold/wave increases by ~10% per wave
- Boss waves provide 3x normal gold
- Ensures players can afford tower upgrades

### Experience Balance
- Tower levels should increase every 5-10 waves
- Boss kills should provide 1-2 levels
- Max level is 10 (for balance)

---

## Enemy Pathfinding

### Current Implementation
- Hardcoded path
- All enemies follow same route

### Future Enhancement (Post-MVP)
- Multiple path options
- Dynamic pathfinding (A*)
- Enemy can choose shortest path
- Flying enemies ignore terrain
