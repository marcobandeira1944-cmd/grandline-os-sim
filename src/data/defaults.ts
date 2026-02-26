import type { StoreItem, User, Settings, SeasonReward, WallpaperDef, ThemeDef } from '../types';

export const DEFAULT_STORE_ITEMS: StoreItem[] = [
  {"id":"1","name":"Espada Wado Ichimonji","category":"Armas","emoji":"⚔️","price":2500,"rarity":"Épico","description":"A espada branca de Kuina, herdada por Zoro. Forjada com aço especial que nunca perde o fio, carrega o peso de dois sonhos em sua lâmina.","stats":{"Ataque":85,"Velocidade":70,"Durabilidade":90}},
  {"id":"2","name":"Fruta Gomu Gomu no Mi","category":"Frutas do Diabo","emoji":"🍇","price":8000,"rarity":"Lendário","description":"Fruta Paramecia que transforma o corpo em borracha pura. Imunidade a trovões e balas, mas o usuário não consegue nadar.","stats":{"Poder":95,"Resistência":80,"Flexibilidade":100}},
  {"id":"3","name":"Thousand Sunny","category":"Navios","emoji":"⛵","price":15000,"rarity":"Lendário","description":"O orgulho dos Chapéus de Palha, construído com Madeira Adam por Franky. Equipado com Coup de Burst e Soldier Dock System.","stats":{"Velocidade":88,"Resistência":95,"Capacidade":100}},
  {"id":"4","name":"Chapéu de Palha de Shanks","category":"Acessórios","emoji":"👒","price":500,"rarity":"Lendário","description":"O símbolo do sonho de Luffy. Um simples chapéu de palha que carrega o peso de uma promessa entre piratas.","stats":{}},
  {"id":"5","name":"Fruta Mera Mera no Mi","category":"Frutas do Diabo","emoji":"🔥","price":6000,"rarity":"Épico","description":"Fruta Logia do fogo. O usuário se torna fogo vivo, capaz de criar, controlar e se transformar em chamas.","stats":{"Poder":90,"Calor":100,"Mobilidade":75}},
  {"id":"6","name":"Clima Tact Perfeito","category":"Armas","emoji":"🌩️","price":1800,"rarity":"Raro","description":"Versão aprimorada da arma de Nami. Capaz de criar mini-climas, relâmpagos e até tornados localizados.","stats":{"Poder":70,"Utilidade":95,"Alcance":85}},
  {"id":"7","name":"Armadura Franky Shogun","category":"Especiais","emoji":"🤖","price":12000,"rarity":"Épico","description":"Exoesqueleto robótico gigante construído em Wano. Funciona com cola e possui arsenal de armas embutidas.","stats":{"Força":100,"Armadura":95,"Estilo":100}},
  {"id":"8","name":"Rumble Ball","category":"Especiais","emoji":"💊","price":300,"rarity":"Incomum","description":"Droga médica criada por Chopper. Altera temporariamente a frequência de ressonância da Fruta do Diabo por 3 minutos.","stats":{"Boost":80}},
  {"id":"9","name":"Sabre de Hawkins","category":"Armas","emoji":"🔮","price":3200,"rarity":"Raro","description":"Espada mágica do Basil Hawkins com poderes de carta de tarô. Transfere dano para palhas de vodu.","stats":{"Ataque":78,"Magia":92,"Sorte":65}},
  {"id":"10","name":"Fruta Hito Hito no Mi","category":"Frutas do Diabo","emoji":"🦌","price":4500,"rarity":"Épico","description":"Fruta Zoan humana consumida por Tony Tony Chopper. Permite transformação entre humano, híbrido e animal.","stats":{"Transformações":7,"Inteligência":100,"Medicina":95}}
];

export const MASTER_ACCOUNT: User = {
  id: 'master-001',
  username: 'mestre',
  password: btoa('onepiece2024'),
  characterName: 'Game Master',
  avatar: '👑',
  role: 'master',
  berries: 999999,
  level: 100,
  xp: 0,
  ownedItems: [],
  ownedWallpapers: ['abyssal','skypiea','marineford','sunny','fishman','wano','elbaf','new-world','laugh-tale'],
  ownedThemes: ['piratas','marinha','shichibukai','yonkou','revolucionario','classico'],
  activeWallpaper: 'abyssal',
  activeTheme: 'piratas',
  seasonPassLevel: 100,
  seasonPassPremium: true,
  claimedRewards: [],
  createdAt: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: Settings = {
  osName: 'OLD AGE OS',
  subtitle: 'v1.0 — Grand Line Edition',
  welcomeMessage: 'Bem-vindo ao Grand Line, Nakama!',
  maintenanceMode: false,
  initialBerries: 10000,
  seasonName: 'Temporada: Wano Arc',
  seasonDescription: 'A batalha pela libertação de Wano começa agora!',
};

export const WALLPAPERS: WallpaperDef[] = [
  { id: 'abyssal', name: 'Abyssal', gradient: 'linear-gradient(135deg, #050810 0%, #0a1420 40%, #060b18 100%)', locked: false },
  { id: 'skypiea', name: 'Skypiea', gradient: 'linear-gradient(135deg, #0f0800 0%, #6b4f0e 40%, #c49a1a 80%, #f0c040 100%)', locked: true },
  { id: 'marineford', name: 'Marineford', gradient: 'linear-gradient(160deg, #0d0000 0%, #5c0a0a 50%, #8b1a1a 80%, #0d0000 100%)', locked: true },
  { id: 'sunny', name: 'Thousand Sunny', gradient: 'linear-gradient(135deg, #071a0d 0%, #0f3d1f 45%, #1a6b35 70%, #d4831a 100%)', locked: true },
  { id: 'fishman', name: 'Fishman Island', gradient: 'linear-gradient(135deg, #000d1a 0%, #003355 40%, #005f7a 70%, #00a0b0 100%)', locked: true },
  { id: 'wano', name: 'Wano', gradient: 'linear-gradient(160deg, #120800 0%, #6b2800 30%, #b85a00 60%, #8b0000 100%)', locked: true },
  { id: 'elbaf', name: 'Elbaf', gradient: 'linear-gradient(135deg, #08001a 0%, #350070 40%, #6000c0 65%, #00c8a0 100%)', locked: true },
  { id: 'new-world', name: 'Novo Mundo', gradient: 'linear-gradient(160deg, #000208 0%, #01050f 30%, #050018 65%, #000208 100%)', locked: true },
  { id: 'laugh-tale', name: 'Laugh Tale', gradient: 'radial-gradient(ellipse at center, #1a0f00 0%, #4a2800 40%, #0a0a0a 100%)', locked: true },
];

export const THEMES: ThemeDef[] = [
  { id: 'piratas', name: 'Piratas', description: 'O ouro dos Chapéus de Palha', accent: '#f0b429', bg: '#080b14', surface: '#0f1629', border: 'rgba(240,180,41,0.15)', locked: false },
  { id: 'marinha', name: 'Marinha', description: 'Justiça Absoluta', accent: '#3b82f6', bg: '#050e1c', surface: '#0a1628', border: 'rgba(59,130,246,0.15)', locked: true },
  { id: 'shichibukai', name: 'Shichibukai', description: 'Os Sete Senhores', accent: '#a855f7', bg: '#09060f', surface: '#130d1e', border: 'rgba(168,85,247,0.15)', locked: true },
  { id: 'yonkou', name: 'Yonkou', description: 'Imperadores do Mar', accent: '#ef4444', bg: '#0e0404', surface: '#1a0808', border: 'rgba(239,68,68,0.15)', locked: true },
  { id: 'revolucionario', name: 'Revolucionário', description: 'Exército da Liberdade', accent: '#22c55e', bg: '#05100a', surface: '#0a1a0f', border: 'rgba(34,197,94,0.15)', locked: true },
  { id: 'classico', name: 'Clássico', description: 'Preto e branco atemporal', accent: '#e5e7eb', bg: '#080808', surface: '#141414', border: 'rgba(229,231,235,0.15)', locked: true },
];

export function generateDefaultSeasonRewards(): SeasonReward[] {
  const rewards: SeasonReward[] = [];
  for (let i = 1; i <= 100; i++) {
    // Free track
    if (i % 10 === 0) {
      rewards.push({ level: i, type: 'item', value: DEFAULT_STORE_ITEMS[Math.floor(Math.random() * DEFAULT_STORE_ITEMS.length)].id, premium: false });
    } else if (i % 5 === 0) {
      rewards.push({ level: i, type: 'berries', value: '1000', premium: false });
    } else {
      rewards.push({ level: i, type: 'berries', value: String(100 + i * 10), premium: false });
    }
    // Premium track
    if (i % 10 === 0) {
      if (i === 20) rewards.push({ level: i, type: 'wallpaper', value: 'skypiea', premium: true });
      else if (i === 40) rewards.push({ level: i, type: 'theme', value: 'marinha', premium: true });
      else if (i === 60) rewards.push({ level: i, type: 'wallpaper', value: 'wano', premium: true });
      else if (i === 80) rewards.push({ level: i, type: 'theme', value: 'shichibukai', premium: true });
      else if (i === 100) rewards.push({ level: i, type: 'wallpaper', value: 'laugh-tale', premium: true });
      else rewards.push({ level: i, type: 'berries', value: '2000', premium: true });
    } else if (i % 5 === 0) {
      rewards.push({ level: i, type: 'berries', value: '500', premium: true });
    } else {
      rewards.push({ level: i, type: 'berries', value: String(200 + i * 5), premium: true });
    }
  }
  return rewards;
}

export const APP_DEFINITIONS = [
  { id: 'loja' as const, title: 'Loja', emoji: '🏪', gradient: 'linear-gradient(135deg, #1a3a1a, #2d6a2d)', masterOnly: false },
  { id: 'estoque' as const, title: 'Estoque', emoji: '🎒', gradient: 'linear-gradient(135deg, #1a1a3a, #2d2d8a)', masterOnly: false },
  { id: 'passe' as const, title: 'Passe de Temporada', emoji: '🎫', gradient: 'linear-gradient(135deg, #3a1a1a, #8a2d2d)', masterOnly: false },
  { id: 'wallpaper' as const, title: 'Papel de Parede', emoji: '🖼️', gradient: 'linear-gradient(135deg, #1a2a3a, #2d4a6a)', masterOnly: false },
  { id: 'temas' as const, title: 'Temas', emoji: '🎨', gradient: 'linear-gradient(135deg, #2a1a3a, #5a2d8a)', masterOnly: false },
  { id: 'mestre' as const, title: 'Painel Mestre', emoji: '👑', gradient: 'linear-gradient(135deg, #3a2a00, #8a6400)', masterOnly: true },
  { id: 'creditos' as const, title: 'Loja de Créditos', emoji: '💎', gradient: 'linear-gradient(135deg, #1a2a00, #4a6a00)', masterOnly: false },
];
