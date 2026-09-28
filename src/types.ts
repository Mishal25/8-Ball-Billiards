export type GameMode = 'ai' | 'pvp' | 'practice';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type TurnState = 'aiming' | 'shooting' | 'moving' | 'in_hand' | 'gameover';
export type BallGroup = 'solids' | 'stripes';

export interface Ball {
  id: number;
  num: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isCue: boolean;
  isStriped: boolean;
  isEight: boolean;
  color: string;
  inPocket: boolean;
}

export interface PlayerStats {
  name: string;
  group: BallGroup | null;
  remaining: number;
  fouls: number;
  shots: number;
  pocketed: number;
}

export interface UserProfileData {
  name: string;
  level: number;
  coins: number;
  wins: number;
  matches: number;
  bestStreak: number;
}

export interface SettingsData {
  sound: boolean;
  aimGuide: boolean;
  feltColor: 'classic' | 'tournament' | 'midnight';
  vibration: boolean;
  aiDifficulty: AIDifficulty;
}

export interface Pocket {
  x: number;
  y: number;
  r: number;
  name: string;
}

export interface MatchRecord {
  id: string;
  opponent: string;
  mode: GameMode;
  difficulty?: AIDifficulty;
  isWin: boolean;
  coinsEarned: number;
  shots: number;
  date: string;
}
