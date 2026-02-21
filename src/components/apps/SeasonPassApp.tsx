import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function SeasonPassApp() {
  const { state, dispatch, addToast, addNotification } = useApp();
  const user = state.currentUser!;
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(100 / PAGE_SIZE);

  const handleClaim = (level: number, premium: boolean) => {
    const key = `${level}-${premium ? 'p' : 'f'}`;
    if (user.claimedRewards.includes(key)) return;
    if (level > user.seasonPassLevel) return;
    if (premium && !user.seasonPassPremium) return;
    const reward = state.seasonRewards.find(r => r.level === level && r.premium === premium);
    if (!reward) return;
    dispatch({ type: 'CLAIM_REWARD', payload: { level, premium } });
    let msg = '';
    if (reward.type === 'berries') msg = `+₿${reward.value} adicionados ao saldo!`;
    else if (reward.type === 'item') { const item = state.storeItems.find(i => i.id === reward.value); msg = `${item?.emoji || '📦'} ${item?.name || 'Item'} adicionado ao estoque!`; }
    else if (reward.type === 'wallpaper') msg = `🖼️ Novo papel de parede desbloqueado!`;
    else if (reward.type === 'theme') msg = `🎨 Novo tema desbloqueado!`;
    addToast('reward', `✨ Recompensa resgatada! ${msg}`);
    addNotification('🎫', 'Recompensa', msg);
  };

  const handleUpgradePremium = () => {
    if (user.berries < 3000) { addToast('error', 'Saldo insuficiente! Você precisa de ₿3.000'); return; }
    dispatch({ type: 'UPGRADE_PREMIUM' });
    addToast('reward', '🌟 Passe Premium ativado!');
  };

  const getRewardDisplay = (reward: any) => {
    if (!reward) return { emoji: '❓', label: '???' };
    if (reward.type === 'berries') return { emoji: '💰', label: `₿${reward.value}` };
    if (reward.type === 'item') { const item = state.storeItems.find((i: any) => i.id === reward.value); return { emoji: item?.emoji || '📦', label: item?.name || 'Item' }; }
    if (reward.type === 'wallpaper') return { emoji: '🖼️', label: 'Wallpaper' };
    if (reward.type === 'theme') return { emoji: '🎨', label: 'Tema' };
    return { emoji: '🏷️', label: 'Título' };
  };

  const startLevel = page * PAGE_SIZE + 1;
  const endLevel = Math.min(startLevel + PAGE_SIZE - 1, 100);

  const renderTrack = (premium: boolean) => (
    <div className="flex gap-2">
      {Array.from({ length: endLevel - startLevel + 1 }, (_, i) => {
        const level = startLevel + i;
        const reward = state.seasonRewards.find(r => r.level === level && r.premium === premium);
        const display = getRewardDisplay(reward);
        const claimed = user.claimedRewards.includes(`${level}-${premium ? 'p' : 'f'}`);
        const unlocked = level <= user.seasonPassLevel && (!premium || user.seasonPassPremium);
        const canClaim = unlocked && !claimed;
        return (
          <button key={`${premium ? 'p' : 'f'}-${level}`} disabled={!canClaim} onClick={() => handleClaim(level, premium)}
            className={`w-16 h-20 rounded-xl flex flex-col items-center justify-center gap-1 shrink-0 transition-all duration-200 relative
              ${canClaim ? 'animate-pulse-gold cursor-pointer hover:scale-105' : ''} ${claimed ? 'opacity-40' : ''}`}
            style={{ background: unlocked ? (premium ? 'rgba(240,180,41,0.1)' : 'rgba(255,255,255,0.05)') : 'rgba(255,255,255,0.02)',
              border: canClaim ? '1px solid rgba(240,180,41,0.4)' : '1px solid rgba(255,255,255,0.04)' }}>
            <span className="text-[10px] text-[#64748b] absolute top-1">{level}</span>
            {!unlocked ? <span className="text-sm">🔒</span> : <span className="text-lg mt-2">{display.emoji}</span>}
            {claimed && <span className="absolute inset-0 flex items-center justify-center text-lg text-green-400">✓</span>}
            <span className="text-[8px] text-[#94a3b8] truncate w-full text-center px-1">{display.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3a1010 0%, #5a1a1a 50%, #8a2d0d 100%)' }}>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">{state.settings.seasonName}</h2>
            <p className="text-xs text-white/60 mt-0.5">Season 1</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">Nv. {user.seasonPassLevel} / 100</p>
            <div className="w-32 h-2 rounded-full overflow-hidden mt-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="h-full rounded-full gold-gradient transition-all duration-500" style={{ width: `${user.seasonPassLevel}%` }} />
            </div>
          </div>
        </div>
        {!user.seasonPassPremium && (
          <button onClick={handleUpgradePremium} className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold gold-gradient text-[#080b14] hover:brightness-110 transition-all animate-pulse-gold">
            ⭐ ATIVAR PASSE PREMIUM — ₿3.000
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-2 py-1 rounded text-xs text-[#94a3b8] hover:text-white disabled:opacity-30">◀</button>
        <span className="text-xs text-[#64748b]">Níveis {startLevel}-{endLevel}</span>
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-2 py-1 rounded text-xs text-[#94a3b8] hover:text-white disabled:opacity-30">▶</button>
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        <p className="text-[10px] font-semibold text-[#f0b429] uppercase tracking-wider mb-2">⭐ Premium</p>
        {renderTrack(true)}
        <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2 mt-4">Gratuito</p>
        {renderTrack(false)}
      </div>
    </div>
  );
}
