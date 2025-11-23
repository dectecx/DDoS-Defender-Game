/**
 * UI constants and styling configuration
 */
export const UIConfig = {
  /** Tower Info Panel dimensions */
  towerInfoPanel: {
    width: 400,
    maxWidth: '90vw',
    height: '100vh'
  },
  
  /** Wave Transition UI */
  waveTransition: {
    minWidth: 400,
    animationDuration: 300  // milliseconds
  },
  
  /** Color palette */
  colors: {
    /** Primary color (green) */
    primary: '#00ff00',
    
    /** Secondary color (cyan) */
    secondary: '#00d4ff',
    
    /** Danger color (red) */
    danger: '#ff0000',
    
    /** Buff/gold color */
    buffGold: '#ffd700',
    
    /** Background dark colors */
    backgroundDark: '#1a1a1a',
    backgroundMid: '#1a1a2e',
    backgroundLight: '#16213e'
  }
} as const;
