import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { User, StoreItem, AppWindow, Settings, AppNotification, Toast, SeasonReward, AppId, CreditPack } from '../types';
import { DEFAULT_STORE_ITEMS, MASTER_ACCOUNT, DEFAULT_SETTINGS, generateDefaultSeasonRewards, THEMES, DEFAULT_CREDIT_PACKS } from '../data/defaults';

interface AppState {
  currentUser: User | null;
  users: User[];
  storeItems: StoreItem[];
  creditPacks: CreditPack[];
  settings: Settings;
  windows: AppWindow[];
  notifications: AppNotification[];
  toasts: Toast[];
  seasonRewards: SeasonReward[];
  isBooted: boolean;
}

type Action =
  | { type: 'SET_BOOTED' }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'OPEN_APP'; payload: { appId: AppId; title: string; emoji: string } }
  | { type: 'CLOSE_WINDOW'; payload: string }
  | { type: 'MINIMIZE_WINDOW'; payload: string }
  | { type: 'MAXIMIZE_WINDOW'; payload: string }
  | { type: 'FOCUS_WINDOW'; payload: string }
  | { type: 'UPDATE_WINDOW_POS'; payload: { id: string; x: number; y: number } }
  | { type: 'UPDATE_WINDOW_SIZE'; payload: { id: string; width: number; height: number } }
  | { type: 'PURCHASE_ITEM'; payload: string }
  | { type: 'DISCARD_ITEM'; payload: string }
  | { type: 'SET_WALLPAPER'; payload: string }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'CLAIM_REWARD'; payload: { level: number; premium: boolean } }
  | { type: 'UPGRADE_PREMIUM' }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_STORE_ITEMS'; payload: StoreItem[] }
  | { type: 'ADD_STORE_ITEM'; payload: StoreItem }
  | { type: 'DELETE_STORE_ITEM'; payload: string }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'GIVE_BERRIES'; payload: { userId: string; amount: number } }
  | { type: 'GIVE_ITEM'; payload: { userId: string; itemId: string } }
  | { type: 'SET_USER_LEVEL'; payload: { userId: string; level: number } }
  | { type: 'TOGGLE_USER_ROLE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'UPDATE_SEASON_REWARDS'; payload: SeasonReward[] }
  | { type: 'UPDATE_CREDIT_PACKS'; payload: CreditPack[] }
  | { type: 'SYNC_CURRENT_USER' };

function loadFromLS<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveToLS(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getInitialState(): AppState {
  let users = loadFromLS<User[]>('oldEra_users', []);
  if (users.length === 0) {
    users = [MASTER_ACCOUNT];
    saveToLS('oldEra_users', users);
  }
  // Ensure master exists
  if (!users.find(u => u.username === 'mestre')) {
    users.push(MASTER_ACCOUNT);
    saveToLS('oldEra_users', users);
  }

  const storeItems = loadFromLS<StoreItem[]>('oldEra_storeItems', DEFAULT_STORE_ITEMS);
  if (!localStorage.getItem('oldEra_storeItems')) saveToLS('oldEra_storeItems', storeItems);

  const settings = loadFromLS<Settings>('oldEra_settings', DEFAULT_SETTINGS);
  if (!localStorage.getItem('oldEra_settings')) saveToLS('oldEra_settings', settings);

  const seasonRewards = loadFromLS<SeasonReward[]>('oldEra_seasonRewards', generateDefaultSeasonRewards());
  if (!localStorage.getItem('oldEra_seasonRewards')) saveToLS('oldEra_seasonRewards', seasonRewards);

  const creditPacks = loadFromLS<CreditPack[]>('oldEra_creditPacks', DEFAULT_CREDIT_PACKS);
  if (!localStorage.getItem('oldEra_creditPacks')) saveToLS('oldEra_creditPacks', creditPacks);

  const currentUserId = localStorage.getItem('oldEra_currentUser');
  const currentUser = currentUserId ? users.find(u => u.id === JSON.parse(currentUserId)) || null : null;

  return {
    currentUser,
    users,
    storeItems,
    creditPacks,
    settings,
    windows: [],
    notifications: [],
    toasts: [],
    seasonRewards,
    isBooted: false,
  };
}

let windowCounter = 0;
const APP_DEFAULTS: Record<string, { width: number; height: number }> = {
  loja: { width: 900, height: 600 },
  estoque: { width: 800, height: 550 },
  passe: { width: 850, height: 500 },
  wallpaper: { width: 750, height: 500 },
  temas: { width: 700, height: 500 },
  mestre: { width: 950, height: 650 },
  creditos: { width: 700, height: 520 },
  'admin-editor': { width: 900, height: 600 },
};

function updateUserInList(users: User[], updated: User): User[] {
  return users.map(u => u.id === updated.id ? updated : u);
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_BOOTED':
      return { ...state, isBooted: true };

    case 'LOGIN': {
      saveToLS('oldEra_currentUser', action.payload.id);
      return { ...state, currentUser: action.payload, windows: [] };
    }

    case 'LOGOUT': {
      localStorage.removeItem('oldEra_currentUser');
      return { ...state, currentUser: null, windows: [], notifications: [] };
    }

    case 'REGISTER': {
      const newUsers = [...state.users, action.payload];
      saveToLS('oldEra_users', newUsers);
      return { ...state, users: newUsers };
    }

    case 'OPEN_APP': {
      const existing = state.windows.find(w => w.appId === action.payload.appId && !w.isMinimized);
      if (existing) {
        const maxZ = Math.max(...state.windows.map(w => w.zIndex), 0);
        return { ...state, windows: state.windows.map(w => w.id === existing.id ? { ...w, zIndex: maxZ + 1 } : w) };
      }
      const minimized = state.windows.find(w => w.appId === action.payload.appId && w.isMinimized);
      if (minimized) {
        const maxZ = Math.max(...state.windows.map(w => w.zIndex), 0);
        return { ...state, windows: state.windows.map(w => w.id === minimized.id ? { ...w, isMinimized: false, zIndex: maxZ + 1 } : w) };
      }
      windowCounter++;
      const defaults = APP_DEFAULTS[action.payload.appId] || { width: 800, height: 500 };
      const offset = (windowCounter % 5) * 30;
      const newWindow: AppWindow = {
        id: `win-${Date.now()}-${windowCounter}`,
        appId: action.payload.appId,
        title: action.payload.title,
        emoji: action.payload.emoji,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: Math.max(...state.windows.map(w => w.zIndex), 0) + 1,
        x: 80 + offset,
        y: 40 + offset,
        width: defaults.width,
        height: defaults.height,
      };
      return { ...state, windows: [...state.windows, newWindow] };
    }

    case 'CLOSE_WINDOW':
      return { ...state, windows: state.windows.filter(w => w.id !== action.payload) };

    case 'MINIMIZE_WINDOW':
      return { ...state, windows: state.windows.map(w => w.id === action.payload ? { ...w, isMinimized: true } : w) };

    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w => w.id === action.payload ? { ...w, isMaximized: !w.isMaximized } : w),
      };

    case 'FOCUS_WINDOW': {
      const maxZ = Math.max(...state.windows.map(w => w.zIndex), 0);
      return { ...state, windows: state.windows.map(w => w.id === action.payload ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w) };
    }

    case 'UPDATE_WINDOW_POS':
      return { ...state, windows: state.windows.map(w => w.id === action.payload.id ? { ...w, x: action.payload.x, y: action.payload.y } : w) };

    case 'UPDATE_WINDOW_SIZE':
      return { ...state, windows: state.windows.map(w => w.id === action.payload.id ? { ...w, width: action.payload.width, height: action.payload.height } : w) };

    case 'PURCHASE_ITEM': {
      if (!state.currentUser) return state;
      const item = state.storeItems.find(i => i.id === action.payload);
      if (!item || state.currentUser.berries < item.price) return state;
      if (state.currentUser.ownedItems.includes(item.id)) return state;
      const updated = {
        ...state.currentUser,
        berries: state.currentUser.berries - item.price,
        ownedItems: [...state.currentUser.ownedItems, item.id],
      };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      saveToLS('oldEra_currentUser', updated.id);
      return { ...state, currentUser: updated, users: newUsers };
    }

    case 'DISCARD_ITEM': {
      if (!state.currentUser) return state;
      const updated = {
        ...state.currentUser,
        ownedItems: state.currentUser.ownedItems.filter(id => id !== action.payload),
      };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      return { ...state, currentUser: updated, users: newUsers };
    }

    case 'SET_WALLPAPER': {
      if (!state.currentUser) return state;
      const updated = { ...state.currentUser, activeWallpaper: action.payload };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      return { ...state, currentUser: updated, users: newUsers };
    }

    case 'SET_THEME': {
      if (!state.currentUser) return state;
      const updated = { ...state.currentUser, activeTheme: action.payload };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      // Apply theme CSS vars
      const theme = THEMES.find(t => t.id === action.payload);
      if (theme) {
        document.documentElement.style.setProperty('--os-accent', theme.accent);
        document.documentElement.style.setProperty('--os-bg', theme.bg);
        document.documentElement.style.setProperty('--os-surface', theme.surface);
        document.documentElement.style.setProperty('--os-border', theme.border);
      }
      return { ...state, currentUser: updated, users: newUsers };
    }

    case 'CLAIM_REWARD': {
      if (!state.currentUser) return state;
      const rewardKey = `${action.payload.level}-${action.payload.premium ? 'p' : 'f'}`;
      if (state.currentUser.claimedRewards.includes(rewardKey)) return state;
      const reward = state.seasonRewards.find(r => r.level === action.payload.level && r.premium === action.payload.premium);
      if (!reward) return state;
      let updated = { ...state.currentUser, claimedRewards: [...state.currentUser.claimedRewards, rewardKey] };
      if (reward.type === 'berries') {
        updated.berries += parseInt(reward.value);
      } else if (reward.type === 'item') {
        if (!updated.ownedItems.includes(reward.value)) updated.ownedItems = [...updated.ownedItems, reward.value];
      } else if (reward.type === 'wallpaper') {
        if (!updated.ownedWallpapers.includes(reward.value)) updated.ownedWallpapers = [...updated.ownedWallpapers, reward.value];
      } else if (reward.type === 'theme') {
        if (!updated.ownedThemes.includes(reward.value)) updated.ownedThemes = [...updated.ownedThemes, reward.value];
      }
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      return { ...state, currentUser: updated, users: newUsers };
    }

    case 'UPGRADE_PREMIUM': {
      if (!state.currentUser || state.currentUser.berries < 3000) return state;
      const updated = { ...state.currentUser, berries: state.currentUser.berries - 3000, seasonPassPremium: true };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      return { ...state, currentUser: updated, users: newUsers };
    }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts.slice(-2), action.payload] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 50) };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'UPDATE_STORE_ITEMS': {
      saveToLS('oldEra_storeItems', action.payload);
      return { ...state, storeItems: action.payload };
    }

    case 'ADD_STORE_ITEM': {
      const items = [...state.storeItems, action.payload];
      saveToLS('oldEra_storeItems', items);
      return { ...state, storeItems: items };
    }

    case 'DELETE_STORE_ITEM': {
      const items = state.storeItems.filter(i => i.id !== action.payload);
      saveToLS('oldEra_storeItems', items);
      return { ...state, storeItems: items };
    }

    case 'UPDATE_USER': {
      const newUsers = updateUserInList(state.users, action.payload);
      saveToLS('oldEra_users', newUsers);
      const cu = state.currentUser?.id === action.payload.id ? action.payload : state.currentUser;
      return { ...state, users: newUsers, currentUser: cu };
    }

    case 'DELETE_USER': {
      const newUsers = state.users.filter(u => u.id !== action.payload);
      saveToLS('oldEra_users', newUsers);
      return { ...state, users: newUsers };
    }

    case 'GIVE_BERRIES': {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (!user) return state;
      const updated = { ...user, berries: user.berries + action.payload.amount };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      const cu = state.currentUser?.id === updated.id ? updated : state.currentUser;
      return { ...state, users: newUsers, currentUser: cu };
    }

    case 'GIVE_ITEM': {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (!user || user.ownedItems.includes(action.payload.itemId)) return state;
      const updated = { ...user, ownedItems: [...user.ownedItems, action.payload.itemId] };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      const cu = state.currentUser?.id === updated.id ? updated : state.currentUser;
      return { ...state, users: newUsers, currentUser: cu };
    }

    case 'SET_USER_LEVEL': {
      const user = state.users.find(u => u.id === action.payload.userId);
      if (!user) return state;
      const updated = { ...user, level: action.payload.level };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      const cu = state.currentUser?.id === updated.id ? updated : state.currentUser;
      return { ...state, users: newUsers, currentUser: cu };
    }

    case 'TOGGLE_USER_ROLE': {
      const user = state.users.find(u => u.id === action.payload);
      if (!user) return state;
      const updated = { ...user, role: user.role === 'master' ? 'player' as const : 'master' as const };
      const newUsers = updateUserInList(state.users, updated);
      saveToLS('oldEra_users', newUsers);
      return { ...state, users: newUsers };
    }

    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload };
      saveToLS('oldEra_settings', newSettings);
      return { ...state, settings: newSettings };
    }

    case 'UPDATE_SEASON_REWARDS': {
      saveToLS('oldEra_seasonRewards', action.payload);
      return { ...state, seasonRewards: action.payload };
    }

    case 'UPDATE_CREDIT_PACKS': {
      saveToLS('oldEra_creditPacks', action.payload);
      return { ...state, creditPacks: action.payload };
    }

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addToast: (type: Toast['type'], message: string) => void;
  addNotification: (icon: string, title: string, description: string) => void;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  // Apply theme on mount
  useEffect(() => {
    if (state.currentUser) {
      const theme = THEMES.find(t => t.id === state.currentUser!.activeTheme);
      if (theme) {
        document.documentElement.style.setProperty('--os-accent', theme.accent);
        document.documentElement.style.setProperty('--os-bg', theme.bg);
        document.documentElement.style.setProperty('--os-surface', theme.surface);
        document.documentElement.style.setProperty('--os-border', theme.border);
      }
    }
  }, [state.currentUser?.activeTheme]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const toast: Toast = { id: `toast-${Date.now()}`, type, message, duration: 4000 };
    dispatch({ type: 'ADD_TOAST', payload: toast });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id }), toast.duration);
  }, []);

  const addNotification = useCallback((icon: string, title: string, description: string) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { id: `notif-${Date.now()}`, icon, title, description, timestamp: new Date().toISOString(), read: false },
    });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, addToast, addNotification }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
