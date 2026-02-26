export interface User {
  id: string;
  username: string;
  password: string;
  characterName: string;
  avatar: string;
  role: 'player' | 'master';
  berries: number;
  level: number;
  xp: number;
  ownedItems: string[];
  ownedWallpapers: string[];
  ownedThemes: string[];
  activeWallpaper: string;
  activeTheme: string;
  seasonPassLevel: number;
  seasonPassPremium: boolean;
  claimedRewards: string[];
  createdAt: string;
}

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  price: number;
  rarity: 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
  description: string;
  stats: Record<string, number>;
}

export interface AppWindow {
  id: string;
  appId: string;
  title: string;
  emoji: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Settings {
  osName: string;
  subtitle: string;
  welcomeMessage: string;
  maintenanceMode: boolean;
  initialBerries: number;
  seasonName: string;
  seasonDescription: string;
}

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'reward' | 'levelup';
  message: string;
  duration: number;
}

export interface SeasonReward {
  level: number;
  type: 'berries' | 'item' | 'wallpaper' | 'theme' | 'title';
  value: string;
  premium: boolean;
}

export interface CreditPack {
  id: string;
  name: string;
  berries: number;
  bonus: number;
  price: string;
  emoji: string;
  popular?: boolean;
  bestValue?: boolean;
}

export type AppId = 'loja' | 'estoque' | 'passe' | 'wallpaper' | 'temas' | 'mestre' | 'creditos' | 'admin-editor';

export interface WallpaperDef {
  id: string;
  name: string;
  gradient: string;
  locked: boolean;
}

export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  accent: string;
  bg: string;
  surface: string;
  border: string;
  locked: boolean;
}
