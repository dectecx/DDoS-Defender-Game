# DDoS Defender (MVP)

**《DDoS Defender 技術架構規格書 v1.0》**

-----

## 1. 設計理念與核心決策

  * **架構模式：** 預留擴充性的模組化設計 (Modular Design)。
  * **地圖機制：** 基於 2D 陣列的網格系統。MVP 階段讀取預設路徑，未來可切換為動態尋路。
  * **波數系統：** 設定檔驅動 (Config-Driven)。關卡資料與程式邏輯分離，支援從 JSON/DB 熱載入。
  * **擴充性預留：**
      * **多人連線：** 狀態管理層 (State Layer) 需與渲染層 (View Layer) 嚴格分離，以便未來狀態可由 WebSocket 同步。
      * **技能系統：** 引入「狀態效果 (Status Effect)」介面，支援塔被暈眩（斷電）或敵人被緩速。

-----

## 2. 實體對照表 (Tech Theme Mapping)

我們將抽象的 TD 元素具體化為「Web 伺服器攻防」的情境：

| 類別 | 代號 | 遊戲內名稱 | 對應 TD 概念 | 特性描述 |
| :--- | :--- | :--- | :--- | :--- |
| **核心** | `Origin` | **Origin Server** | 基地 (Base) | HP = Server Availability (100%)。歸零即 503 Service Unavailable。 |
| **敵人** | `Req_Std` | **HTTP Request** | 普通小兵 | 標準血量與速度。 |
| **敵人** | `Req_Heavy` | **Large Payload** | 坦克 (Tank) | `POST /upload`，血厚移動慢，象徵大檔案上傳塞爆頻寬。 |
| **敵人** | `Req_Stream` | **Socket Flood** | 刺客 (Fast) | `WebSocket` 連線，血極少但速度極快，且密集生成。 |
| **BOSS** | `ZeroDay` | **Zero-Day Exploit** | Boss | 擁有技能 `Blackout` (斷電)：使範圍內防禦塔「離線」5 秒。 |
| **塔** | `RateLimit` | **Rate Limiter** | 箭塔 (Basic) | 單體攻擊，高射速，低成本。 |
| **塔** | `WAF` | **WAF Node** | 砲塔 (Splash) | 範圍攻擊 (AOE)，用來清理密集的 WebSocket。 |
| **塔** | `DPI` | **DPI Scanner** | 狙擊 (Sniper) | 深度封包檢測。攻速極慢，但單發傷害極高，專打 Large Payload。 |
| **塔** | `Cache` | **Redis Cache** | 冰塔 (Slow) | 讓經過的 Request 進入「快取處理」，移動速度降低 50%。 |

-----

## 3. 系統架構設計 (Architecture Design)

我們採用 **ECS (Entity-Component-System)** 的變體，適合前端開發。

### 3.1 資料流向圖

```mermaid
graph TD
    DB["(Level Config / DB)"] -->|Load JSON| LevelMgr[Level Manager]
    LevelMgr -->|Init| GameStore["Global State (Pinia/Redux)"]
    
    User[玩家操作] -->|Click/Build| InteractionSys[Interaction System]
    InteractionSys -->|Dispatch Action| GameStore
    
    subgraph "Game Loop (60 FPS)"
        WaveSys[Wave System] -->|Spawn| EnemyMgr
        TowerSys[Tower System] -->|Detect & Fire| BulletMgr
        BulletMgr[Projectile System] -->|Hit Check| EnemyMgr[Enemy Manager]
        EnemyMgr -->|Move/Reach Base| GameStore
    end
    
    GameStore -->|Reactive Update| Renderer[Canvas / DOM Renderer]
```

### 3.2 核心模組職責

1.  **`GridManager` (地圖管理者):**

      * 維護一個二維陣列 `grid[y][x]`。
      * 每個格子儲存狀態：`{ type: 'EMPTY' | 'WALL' | 'PATH' | 'TOWER', towerId: string | null }`。
      * **MVP 實作：** 寫死路徑座標陣列 `pathCoordinates = [{x:0, y:2}, {x:1, y:2}...]` 供敵人移動使用。
      * **未來擴充：** 若切換模式，將 `pathCoordinates` 改為由 A\* 演算法動態計算。

2.  **`WaveManager` (波數控制器):**

      * 負責解析關卡設定檔。
      * 計時器邏輯：`Next wave in 10s...`。
      * 生成邏輯：根據設定檔的 `spawnInterval` 觸發敵人生成事件。

3.  **`TowerSystem` (防禦塔系統):**

      * **索敵 (Targeting)：** 計算 `distance(tower, enemy)`。
      * **策略：** 支援 `First` (打最前面的), `Strongest` (打血最多的), `Close` (打最近的)。
      * **狀態機：** 塔也有狀態 `IDLE` | `ATTACKING` | `OFFLINE` (被 Boss 斷電時)。

-----

## 4. 資料結構定義 (Data Structures)

定義好 JSON 結構，這也是你資料庫將來要存的格式。

### 4.1 關卡設定檔 (`LevelConfig.json`)

這設計允許你隨時調整平衡，甚至做成後台讓非技術人員調整。

```json
{
  "levelId": 1,
  "mapWidth": 20,
  "mapHeight": 12,
  "initialResources": 500,
  "mapLayout": [
    [0, 0, 0, 1, 1, 1, 0, ...], 
    // 0: 可建築空地, 1: 固定路徑(封包光纖)
  ],
  "waves": [
    {
      "waveId": 1,
      "enemyType": "REQ_STD",
      "count": 10,
      "spawnInterval": 1000, // 毫秒
      "delayBeforeWave": 0
    },
    {
      "waveId": 2,
      "enemyType": "REQ_STREAM", // WebSocket flood
      "count": 20,
      "spawnInterval": 300, // 密集生成
      "delayBeforeWave": 5000
    },
    {
      "waveId": 5, // Boss Wave
      "enemyType": "ZERO_DAY_BOSS",
      "count": 1,
      "bossSkill": "BLACKOUT"
    }
  ]
}
```

### 4.2 敵人實體 (`EnemyEntity`)

```typescript
interface Enemy {
  id: string;
  type: 'REQ_STD' | 'REQ_HEAVY' | 'REQ_STREAM' | 'ZERO_DAY';
  hp: number;
  maxHp: number;
  speed: number; // 格子/秒
  
  // 路徑控制
  pathIndex: number; // 目前走到路徑陣列的第幾個索引
  position: { x: number, y: number }; // 精確像素座標
  
  // 狀態效果 (未來擴充)
  status: {
    isSlowed: boolean;
    slowFactor: number; // 0.5 代表緩速 50%
  };
}
```

-----

## 5. 執行流程與階段規劃 (Implementation Roadmap)

我們依據 MVP 原則，切分為三個 Sprint。

### **Phase 1: 基礎建設 (The Skeleton)**

  * **目標：** 畫出地圖，讓一個紅點（敵人）沿著線走到底，扣除基地血量。
  * **任務：**
    1.  搭建 Vue 3 + Canvas 專案環境。
    2.  實作 `GridManager` 渲染靜態的網格地圖。
    3.  實作 `EnemyManager`，讀取寫死的路徑陣列，讓方塊移動。
    4.  實作基本的 Game Loop (`requestAnimationFrame`)。

### **Phase 2: 武裝與防禦 (The Gameplay)**

  * **目標：** 可以點擊地圖放置塔，塔會發射子彈消滅敵人。
  * **任務：**
    1.  實作 `InteractionManager`：點擊網格 -\> 扣錢 -\> 放置塔。
    2.  實作 `TowerSystem`：簡單的距離偵測 (`Math.hypot`) 與射擊冷卻 (`Cooldown`)。
    3.  實作子彈飛行與碰撞檢測 (AABB 碰撞或距離判定)。
    4.  UI 介面：顯示金錢、波數、HP。

### **Phase 3: 內容與變數 (The Content)**

  * **目標：** 引入不同類型的敵人與塔，以及波數邏輯。
  * **任務：**
    1.  實作 `WaveManager` 解析 JSON 設定檔。
    2.  加入 **Req\_Heavy (坦克)** 與 **Req\_Stream (快攻)** 敵人參數。
    3.  加入 **AOE (WAF)** 與 **緩速 (Redis)** 效果邏輯。
    4.  製作簡單的結算畫面 (Game Over / Victory)。

-----

## 6. 架構師的特別叮嚀 (Architect's Notes)

1.  **關於座標系統：**
      * 請嚴格區分 **Grid 座標** (例如 x: 5, y: 3) 與 **Canvas 畫布座標** (例如 x: 320px, y: 192px)。
      * 邏輯運算盡量用 Grid 座標，只有在渲染 (`draw()`) 時才乘上 `CELL_SIZE` 轉為畫布座標。這樣未來做 RWD 或縮放地圖時會很輕鬆。
2.  **關於效能 (WebSocket Flood)：**
      * 當畫面上有 200+ 個「WebSocket 敵人」時，Vue 的 Reactivity 可能會造成效能瓶頸。
      * **建議：** 敵人列表 (`enemies array`) **不要** 用 Vue 的 `ref/reactive` 深層監聽，或者使用 `shallowRef`。這部分資料變化太快，直接在 Game Loop 中操作普通 JS Array，只在 UI 顯示數量時才通知 Vue 更新。
3.  **關於連線預備：**
      * 雖然現在是單機，但請保持 `GameState` 純淨。不要把 UI 元件 (DOM Elements) 存進 State 裡。只要 State 是純 JSON 物件，未來就可以透過 Socket 傳送給另一個玩家實現同步。
