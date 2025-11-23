/**
 * Audio system configuration
 */
export const AudioConfig = {
  /** Default volume levels (0.0 - 1.0) */
  volumes: {
    /** Master volume */
    master: 1.0,
    
    /** Sound effects volume */
    sfx: 1.0,
    
    /** Background music volume */
    bgm: 0.6
  },
  
  /** Audio pooling configuration */
  poolSize: 3,
  
  /** Audio file paths */
  paths: {
    /** Sound effects directory */
    sfx: '/audio/sfx/',
    
    /** Background music directory */
    bgm: '/audio/bgm/'
  },
  
  /** Use placeholder console.log instead of real audio (for testing) */
  usePlaceholders: false
} as const;
