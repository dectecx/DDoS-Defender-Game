# Tower Specifications

## Overview
This document defines all tower types, their stats, upgrade paths, and special abilities in DDoS Defender.

---

## Basic Attack Towers

### RATE_LIMIT (Rate Limiter)
**Visual**: Blue tower
**Description**: Basic tower that limits request rate

#### Base Stats (Level 1)
| Attribute | Value |
|-----------|-------|
| Cost | 100 gold |
| Damage | 20 |
| Range | 3 cells |
| Cooldown | 500ms |
| Targeting | First (path progress) |

#### Upgrade Progression
| Level | Damage | Range | Cooldown | Total Cost | Exp Required |
|-------|--------|-------|----------|------------|--------------|
| 1 | 20 | 3 | 500ms | 100 | 0 |
| 2 | 21 | 3.1 | 485ms | 100 + 50 | 50 |
| 3 | 22 | 3.1 | 470ms | 150 + 75 | 150 |
| 4 | 23 | 3.2 | 455ms | 225 + 100 | 300 |
| 5 | 24 | 3.2 | 440ms | 325 + 125 | 500 |

**Sell Value**: `Total Investment × 0.7`

---

### WAF (Web Application Firewall)
**Visual**: Orange tower
**Description**: AOE tower that filters malicious requests

#### Base Stats (Level 1)
| Attribute | Value |
|-----------|-------|
| Cost | 200 gold |
| Damage | 10 (AOE) |
| Range | 2 cells |
| Cooldown | 1000ms |
| AOE Radius | 1 cell |
| Targeting | First |

#### Upgrade Progression
| Level | Damage | AOE Radius | Cooldown | Total Cost | Exp Required |
|-------|--------|------------|----------|------------|--------------|
| 1 | 10 | 1 | 1000ms | 200 | 0 |
| 2 | 10.5 | 1 | 970ms | 300 | 75 |
| 3 | 11 | 1.1 | 940ms | 400 | 200 |
| 4 | 11.5 | 1.1 | 910ms | 520 | 400 |
| 5 | 12 | 1.2 | 880ms | 660 | 650 |

---

### DPI (Deep Packet Inspection)
**Visual**: Magenta tower
**Description**: Sniper tower with high single-target damage

#### Base Stats (Level 1)
| Attribute | Value |
|-----------|-------|
| Cost | 300 gold |
| Damage | 100 |
| Range | 6 cells |
| Cooldown | 2000ms |
| Targeting | Strongest (highest HP) |

#### Upgrade Progression
| Level | Damage | Range | Cooldown | Total Cost | Exp Required |
|-------|--------|-------|----------|------------|--------------|
| 1 | 100 | 6 | 2000ms | 300 | 0 |
| 2 | 105 | 6.1 | 1940ms | 450 | 100 |
| 3 | 110 | 6.2 | 1880ms | 625 | 250 |
| 4 | 116 | 6.3 | 1820ms | 825 | 500 |
| 5 | 122 | 6.5 | 1760ms | 1050 | 800 |

---

### CACHE (Redis Cache)
**Visual**: Cyan tower
**Description**: Support tower that slows enemies

#### Base Stats (Level 1)
| Attribute | Value |
|-----------|-------|
| Cost | 150 gold |
| Damage | 5 |
| Range | 3 cells |
| Cooldown | 200ms |
| Slow | 50% for 3s |
| Targeting | First |

#### Upgrade Progression
| Level | Slow Amount | Slow Duration | Range | Total Cost | Exp Required |
|-------|-------------|---------------|-------|------------|--------------|
| 1 | 50% | 3s | 3 | 150 | 0 |
| 2 | 55% | 3.2s | 3.1 | 225 | 60 |
| 3 | 60% | 3.4s | 3.1 | 310 | 170 |
| 4 | 65% | 3.6s | 3.2 | 410 | 350 |
| 5 | 70% | 4s | 3.3 | 530 | 600 |

---

## Special Buff Towers

### CODE_FARMER (碼農)
**Visual**: Green tower with $ symbol
**Description**: Passive income generator

#### Stats
| Attribute | Value |
|-----------|-------|
| Cost | 300 gold |
| Income | +2 gold/second |
| Range | N/A (passive) |
| Max Stacks | 5 (diminishing returns) |

#### Upgrade Progression
| Level | Income/sec | Total Cost | Exp Required |
|-------|------------|------------|--------------|
| 1 | +2 | 300 | 0 |
| 2 | +2.5 | 450 | 80 |
| 3 | +3 | 625 | 220 |
| 4 | +3.5 | 825 | 450 |
| 5 | +4 | 1050 | 750 |

**Note**: Each additional CODE_FARMER provides 80% of its value (to prevent spam)

---

### SUPERVISOR (主管)
**Visual**: Purple tower with speed icon
**Description**: Increases attack speed of nearby towers

#### Stats
| Attribute | Value |
|-----------|-------|
| Cost | 400 gold |
| Buff | +20% attack speed |
| Range | 2 cells (buff radius) |
| Stack | Yes (up to 2) |

#### Upgrade Progression
| Level | Attack Speed Buff | Buff Range | Total Cost | Exp Required |
|-------|-------------------|------------|------------|--------------|
| 1 | +20% | 2 | 400 | 0 |
| 2 | +22% | 2.1 | 600 | 100 |
| 3 | +24% | 2.1 | 825 | 280 |
| 4 | +26% | 2.2 | 1075 | 550 |
| 5 | +30% | 2.5 | 1375 | 900 |

---

### SYSTEM_ANALYST (SA / 系統分析師)
**Visual**: Blue tower with radar icon
**Description**: Increases range of nearby towers

#### Stats
| Attribute | Value |
|-----------|-------|
| Cost | 350 gold |
| Buff | +1 cell range |
| Range | 2 cells (buff radius) |
| Stack | Yes (up to 2) |

#### Upgrade Progression
| Level | Range Buff | Buff Range | Total Cost | Exp Required |
|-------|------------|------------|------------|--------------|
| 1 | +1 | 2 | 350 | 0 |
| 2 | +1.1 | 2.1 | 525 | 90 |
| 3 | +1.2 | 2.1 | 725 | 240 |
| 4 | +1.3 | 2.2 | 950 | 480 |
| 5 | +1.5 | 2.5 | 1200 | 800 |

---

## Tower Synergies

### Strong Combos
1. **SA + DPI**: Extended range makes sniper extremely powerful
2. **SUPERVISOR + CACHE**: Fast slowing keeps enemies locked down
3. **CODE_FARMER × 3**: Early economic advantage
4. **SUPERVISOR + WAF**: Rapid AOE damage clears swarms

### Anti-Synergies
- **Multiple CODE_FARMER**: Diminishing returns after 3-4
- **CACHE + Slow Towers**: Redundant slow effects

---

## Balance Notes

### Tower Tier List (Early Game)
**S-Tier**: RATE_LIMIT, CACHE
**A-Tier**: CODE_FARMER, WAF
**B-Tier**: DPI, SUPERVISOR
**C-Tier**: SA

### Tower Tier List (Late Game)
**S-Tier**: DPI + SA, SUPERVISOR
**A-Tier**: WAF, RATE_LIMIT
**B-Tier**: CACHE
**C-Tier**: CODE_FARMER (income less relevant)

### Upgrade Priority
1. Economic towers (CODE_FARMER) - Early game
2. Main DPS towers (RATE_LIMIT, DPI) - Mid game
3. Buff towers (SUPERVISOR, SA) - Late game
4. Support towers (CACHE) - Fill gaps

---

## Future Tower Ideas

### LOAD_BALANCER
- Splits incoming enemies into multiple paths
- Tactical repositioning tower

### CDN (Content Delivery Network)
- Teleports enemies backwards
- High cost, long cooldown

### HONEYPOT
- Attracts enemies to a specific point
- Creates choke points

### FIREWALL_ULTIMATE
- Massive damage, extreme cost
- Limited to 1 per map
