import { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';

const CATEGORIES = ['Todos', 'Armas', 'Frutas do Diabo', 'Navios', 'Acessórios', 'Especiais'];
const CAT_ICONS: Record<string, string> = { Todos: '📦', Armas: '🗡️', 'Frutas do Diabo': '🍎', Navios: '⛵', Acessórios: '💍', Especiais: '✨' };

export default function InventoryApp() {
  const { state, dispatch, addToast } = useApp();
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState<string | null>(null);

  const user = state.currentUser!;

  const ownedItems = useMemo(() => {
    return state.storeItems.filter(i => {
      if (!user.ownedItems.includes(i.id)) return false;
      if (category !== 'Todos' && i.category !== category) return false;
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [state.storeItems, user.ownedItems, category, search]);

  const selectedItem = ownedItems.find(i => i.id === selectedId);

  const handleDiscard = (itemId: string) => {
    const item = state.storeItems.find(i => i.id === itemId);
    dispatch({ type: 'DISCARD_ITEM', payload: itemId });
    addToast('info', `${item?.emoji || ''} ${item?.name || 'Item'} descartado do estoque`);
    setConfirmDiscard(null);
    setSelectedId(null);
  };

  if (ownedItems.length === 0 && category === 'Todos' && !search) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
        <span className="text-5xl">🏴‍☠️</span>
        <h3 className="text-sm font-semibold text-white">Estoque vazio, Nakama!</h3>
        <p className="text-xs text-[#64748b] text-center">Visite a Loja para adquirir itens para sua aventura.</p>
        <button onClick={() => dispatch({ type: 'OPEN_APP', payload: { appId: 'loja', title: 'Loja', emoji: '🏪' } })}
          className="px-4 py-2 rounded-xl text-xs font-medium gold-gradient text-[#080b14] hover:brightness-110 transition-all">
          🏪 Abrir Loja
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
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

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[10px] text-[#64748b]">Estoque &gt; {category}</span>
          <div className="flex-1" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            className="px-3 py-1.5 rounded-lg text-xs text-white placeholder:text-[#64748b] outline-none w-40"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-min content-start">
            {ownedItems.map(item => (
              <div key={item.id} onClick={() => setSelectedId(item.id)}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group
                  ${selectedId === item.id ? 'ring-1 ring-[var(--os-accent)]' : 'hover:border-white/10'}`}
                style={{ background: '#161d35', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="h-20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d5a)' }}>
                  <span className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                </div>
                <div className="p-2.5">
                  <h3 className="text-xs font-semibold text-white truncate">{item.name}</h3>
                  <p className="text-[10px] text-[#64748b] mt-0.5">{item.category}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedItem && (
            <div className="w-56 shrink-0 p-4 overflow-y-auto animate-slide-in-right" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-center mb-3">
                <span className="text-4xl">{selectedItem.emoji}</span>
                <h3 className="text-sm font-bold text-white mt-2">{selectedItem.name}</h3>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">{selectedItem.description}</p>
              {Object.keys(selectedItem.stats).length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {Object.entries(selectedItem.stats).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-[10px] mb-0.5"><span className="text-[#94a3b8]">{k}</span><span className="text-white">{v}</span></div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${v}%`, background: 'var(--os-accent)', transition: 'width 0.7s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {confirmDiscard === selectedItem.id ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-red-400 text-center">Tem certeza? Não pode ser desfeito.</p>
                  <div className="flex gap-1">
                    <button onClick={() => handleDiscard(selectedItem.id)} className="flex-1 py-1.5 rounded-lg text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Descartar</button>
                    <button onClick={() => setConfirmDiscard(null)} className="flex-1 py-1.5 rounded-lg text-[10px] text-[#64748b] hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmDiscard(selectedItem.id)}
                  className="w-full py-1.5 rounded-lg text-[10px] text-red-400 hover:bg-red-500/10 transition-colors" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                  🗑️ Descartar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
