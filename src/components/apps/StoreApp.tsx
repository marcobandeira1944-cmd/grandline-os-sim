import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { StoreItem } from '../../types';

const CATEGORIES = ['Todos', 'Armas', 'Frutas do Diabo', 'Navios', 'Acessórios', 'Especiais'];
const CAT_ICONS: Record<string, string> = { Todos: '📦', Armas: '🗡️', 'Frutas do Diabo': '🍎', Navios: '⛵', Acessórios: '💍', Especiais: '✨' };
const RARITY_COLORS: Record<string, string> = { Comum: '#94a3b8', Incomum: '#22c55e', Raro: '#3b82f6', Épico: '#a855f7', Lendário: '#f0b429' };
const CAT_GRADIENTS: Record<string, string> = {
  Armas: 'linear-gradient(135deg, #1a1a2e, #2d2d5a)',
  'Frutas do Diabo': 'linear-gradient(135deg, #2e1a1a, #5a2d2d)',
  Navios: 'linear-gradient(135deg, #1a2e2e, #2d5a5a)',
  Acessórios: 'linear-gradient(135deg, #2e2e1a, #5a5a2d)',
  Especiais: 'linear-gradient(135deg, #2e1a2e, #5a2d5a)',
};

export default function StoreApp() {
  const { state, dispatch, addToast, addNotification } = useApp();
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const user = state.currentUser!;

  const filtered = useMemo(() => {
    return state.storeItems.filter(i => {
      if (category !== 'Todos' && i.category !== category) return false;
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [state.storeItems, category, search]);

  const handlePurchase = (item: StoreItem) => {
    if (user.ownedItems.includes(item.id)) return;
    if (user.berries < item.price) {
      addToast('error', `Saldo insuficiente, Nakama! Você precisa de ₿${(item.price - user.berries).toLocaleString()} a mais`);
      return;
    }
    dispatch({ type: 'PURCHASE_ITEM', payload: item.id });
    addToast('success', `${item.emoji} ${item.name} adquirida! — ₿${item.price.toLocaleString()} debitados do seu saldo`);
    addNotification(item.emoji, 'Compra realizada', `${item.name} adicionada ao seu estoque`);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-44 shrink-0 p-2 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all mb-0.5
              ${category === cat ? 'text-white font-medium' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'}`}
            style={category === cat ? { background: 'rgba(255,255,255,0.06)', borderLeft: '2px solid var(--os-accent)' } : {}}>
            <span>{CAT_ICONS[cat]}</span>{cat}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[10px] text-[#64748b]">Old Era OS &gt; Loja &gt; {category}</span>
          <div className="flex-1" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." 
            className="px-3 py-1.5 rounded-lg text-xs text-white placeholder:text-[#64748b] outline-none w-40"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => setViewMode('grid')} className={`px-2 py-1 text-xs ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-[#64748b]'}`}>▦</button>
            <button onClick={() => setViewMode('list')} className={`px-2 py-1 text-xs ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-[#64748b]'}`}>☰</button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Items */}
          <div className={`flex-1 overflow-y-auto p-3 ${viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-min content-start' : 'space-y-1'}`}>
            {filtered.map(item => {
              const owned = user.ownedItems.includes(item.id);
              const canAfford = user.berries >= item.price;
              const rarityColor = RARITY_COLORS[item.rarity] || '#94a3b8';

              if (viewMode === 'list') {
                return (
                  <button key={item.id} onClick={() => setSelectedItem(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-all"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span className="text-xl">{item.emoji}</span>
                    <span className="flex-1 text-xs text-white truncate">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: rarityColor, background: `${rarityColor}20` }}>{item.rarity}</span>
                    <span className="text-xs gold-text">₿{item.price.toLocaleString()}</span>
                    {owned && <span className="text-xs text-green-400">✓</span>}
                  </button>
                );
              }

              return (
                <div key={item.id} onClick={() => setSelectedItem(item)}
                  className="rounded-2xl overflow-hidden cursor-pointer hover:border-yellow-500/30 transition-all duration-200 group"
                  style={{ background: '#161d35', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="h-24 flex items-center justify-center relative"
                    style={{ background: CAT_GRADIENTS[item.category] || 'linear-gradient(135deg, #1a1a2e, #2d2d5a)' }}>
                    <span className="text-4xl group-hover:scale-110 transition-transform" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>{item.emoji}</span>
                    <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ color: rarityColor, background: `${rarityColor}20`, border: `1px solid ${rarityColor}40` }}>{item.rarity}</span>
                    {owned && <span className="absolute top-2 left-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[9px]">✓ Adquirido</span>}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-white truncate">{item.name}</h3>
                    <p className="text-[10px] text-[#64748b] mt-0.5 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium gold-text">₿{item.price.toLocaleString()}</span>
                      {!owned && (
                        <button onClick={e => { e.stopPropagation(); handlePurchase(item); }}
                          className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all
                            ${canAfford ? 'gold-gradient text-[#080b14] hover:brightness-110' : 'bg-red-500/10 text-red-400 cursor-not-allowed'}`}
                          disabled={!canAfford}>
                          {canAfford ? 'Comprar' : 'Sem saldo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          {selectedItem && (
            <div className="w-64 shrink-0 p-4 overflow-y-auto animate-slide-in-right"
              style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: CAT_GRADIENTS[selectedItem.category] || 'linear-gradient(135deg, #1a1a2e, #2d2d5a)' }}>
                  <span className="text-4xl">{selectedItem.emoji}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{selectedItem.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block"
                  style={{ color: RARITY_COLORS[selectedItem.rarity], background: `${RARITY_COLORS[selectedItem.rarity]}15` }}>{selectedItem.rarity}</span>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">{selectedItem.description}</p>
              {Object.keys(selectedItem.stats).length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider">Atributos</p>
                  {Object.entries(selectedItem.stats).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-[#94a3b8]">{key}</span>
                        <span className="text-white">{val}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${val}%`, background: `linear-gradient(90deg, var(--os-accent), ${RARITY_COLORS[selectedItem.rarity]})` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-lg font-bold gold-text text-center">₿{selectedItem.price.toLocaleString()}</p>
                {user.ownedItems.includes(selectedItem.id) ? (
                  <div className="w-full py-2 text-center text-xs text-green-400 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)' }}>✓ Já adquirido</div>
                ) : (
                  <button onClick={() => handlePurchase(selectedItem)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all
                      ${user.berries >= selectedItem.price ? 'gold-gradient text-[#080b14] hover:brightness-110' : 'bg-red-500/10 text-red-400 cursor-not-allowed'}`}
                    disabled={user.berries < selectedItem.price}>
                    {user.berries >= selectedItem.price ? 'COMPRAR' : 'SALDO INSUFICIENTE'}
                  </button>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-full mt-2 py-1.5 text-[10px] text-[#64748b] hover:text-white transition-colors">Fechar detalhes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
