# DDoS Defender - Development Roadmap

## Phase 1: 基礎建設 (The Skeleton)
- [ ] **Project Setup**
    - [x] Create README.md with technical spec
    - [ ] Create .gitignore
    - [x] Create ROADMAP.md
    - [ ] Initialize Vue 3 + Vite project
    - [ ] Setup Canvas context and basic resizing
- [ ] **GridManager (Map System)**
    - [ ] Define Grid data structure
    - [ ] Implement static map rendering (Canvas)
    - [ ] Implement coordinate conversion (Grid <-> Canvas)
- [ ] **EnemyManager (Basic Movement)**
    - [ ] Define Enemy interface and state
    - [ ] Implement basic path movement (hardcoded path)
    - [ ] Render enemy (Red Dot)
- [ ] **Game Loop**
    - [ ] Implement requestAnimationFrame loop
    - [ ] Integrate update() and draw() methods

## Phase 2: 武裝與防禦 (The Gameplay)
- [ ] **InteractionManager**
    - [ ] Handle mouse clicks on grid
    - [ ] Implement tower placement logic (deduct resources)
- [ ] **TowerSystem**
    - [ ] Define Tower interface
    - [ ] Implement targeting logic (First/Close/Strongest)
    - [ ] Implement cooldown and firing mechanism
- [ ] **Projectile System**
    - [ ] Implement bullet movement
    - [ ] Implement collision detection (AABB/Distance)
- [ ] **Basic UI**
    - [ ] Display Money, Wave, HP

## Phase 3: 內容與變數 (The Content)
- [ ] **WaveManager**
    - [ ] Define LevelConfig JSON structure
    - [ ] Implement wave parsing and spawning logic
- [ ] **Advanced Enemies**
    - [ ] Implement Req_Heavy (Tank)
    - [ ] Implement Req_Stream (Fast/Socket Flood)
- [ ] **Advanced Towers**
    - [ ] Implement AOE Tower (WAF)
    - [ ] Implement Slow Tower (Redis Cache)
- [ ] **Game Flow**
    - [ ] Implement Victory/Game Over conditions
