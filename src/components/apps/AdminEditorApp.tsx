import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { StoreItem, CreditPack } from '../../types';

const ADMIN_PASSWORD = 'prepucio';
const CATEGORIES = ['Armas', 'Frutas do Diabo', 'Navios', 'Acessórios', 'Especiais'];
const RARITIES: StoreItem['rarity'][] = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'];
const RARITY_COLORS: Record<string, string> = { Comum: '#94a3b8', Incomum: '#22c55e', Raro: '#3b82f6', Épico: '#a855f7', Lendário: '#f0b429' };

export default function AdminEditorApp() {
  const { state, dispatch, addToast } = useApp();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [tab, setTab] = useState<'items' | 'packs'>('items');

  // Item editing
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [itemForm, setItemForm] = useState<Partial<StoreItem>>({});
  const [itemStats, setItemStats] = useState<Array<{ key: string; value: number }>>([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<string | null>(null);

  // Pack editing
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
  const [isNewPack, setIsNewPack] = useState(false);
  const [packForm, setPackForm] = useState<Partial<CreditPack>>({});
  const [confirmDeletePack, setConfirmDeletePack] = useState<string | null>(null);

  const inputStyle = "w-full px-3 py-2 rounded-lg text-xs text-white placeholder:text-[#64748b] outline-none focus:ring-1 focus:ring-[var(--os-accent)]/50";
  const inputBg = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // --- Item functions ---
  const openNewItem = () => {
    setItemForm({ emoji: '', name: '', category: 'Armas', rarity: 'Comum', price: 0, description: '' });
    setItemStats([]);
    setIsNewItem(true);
    setEditingItem(null);
  };

  const openEditItem = (item: StoreItem) => {
    setItemForm(item);
    setItemStats(Object.entries(item.stats).map(([key, value]) => ({ key, value })));
    setIsNewItem(false);
    setEditingItem(item);
  };

  const saveItem = () => {
    const stats: Record<string, number> = {};
    itemStats.forEach(s => { if (s.key) stats[s.key] = s.value; });
    const item: StoreItem = {
      id: isNewItem ? `item-${Date.now()}` : editingItem!.id,
      emoji: itemForm.emoji || '📦',
      name: itemForm.name || 'Sem nome',
      category: itemForm.category || 'Especiais',
      rarity: (itemForm.rarity as StoreItem['rarity']) || 'Comum',
      price: itemForm.price || 0,
      description: itemForm.description || '',
      stats,
    };
    if (isNewItem) {
      dispatch({ type: 'ADD_STORE_ITEM', payload: item });
      addToast('success', `${item.emoji} ${item.name} adicionado!`);
    } else {
      const updated = state.storeItems.map(i => i.id === item.id ? item : i);
      dispatch({ type: 'UPDATE_STORE_ITEMS', payload: updated });
      addToast('success', `${item.emoji} ${item.name} atualizado!`);
    }
    setEditingItem(null);
    setIsNewItem(false);
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE_STORE_ITEM', payload: id });
    addToast('info', 'Item removido da loja');
    setConfirmDeleteItem(null);
  };

  // --- Pack functions ---
  const openNewPack = () => {
    setPackForm({ emoji: '🪙', name: '', berries: 1000, bonus: 0, price: 'R$ 0,00', popular: false, bestValue: false });
    setIsNewPack(true);
    setEditingPack(null);
  };

  const openEditPack = (pack: CreditPack) => {
    setPackForm(pack);
    setIsNewPack(false);
    setEditingPack(pack);
  };

  const savePack = () => {
    const pack: CreditPack = {
      id: isNewPack ? `pack-${Date.now()}` : editingPack!.id,
      emoji: packForm.emoji || '🪙',
      name: packForm.name || 'Sem nome',
      berries: packForm.berries || 0,
      bonus: packForm.bonus || 0,
      price: packForm.price || 'R$ 0,00',
      popular: packForm.popular || false,
      bestValue: packForm.bestValue || false,
    };
    let packs: CreditPack[];
    if (isNewPack) {
      packs = [...state.creditPacks, pack];
      addToast('success', `${pack.emoji} ${pack.name} adicionado!`);
    } else {
      packs = state.creditPacks.map(p => p.id === pack.id ? pack : p);
      addToast('success', `${pack.emoji} ${pack.name} atualizado!`);
    }
    dispatch({ type: 'UPDATE_CREDIT_PACKS', payload: packs });
    setEditingPack(null);
    setIsNewPack(false);
  };

  const deletePack = (id: string) => {
    dispatch({ type: 'UPDATE_CREDIT_PACKS', payload: state.creditPacks.filter(p => p.id !== id) });
    addToast('info', 'Pacote removido');
    setConfirmDeletePack(null);
  };

  // --- Password gate ---
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-72 p-6 rounded-2xl text-center" style={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-4xl block mb-3">🔒</span>
          <h3 className="text-sm font-bold text-white mb-1">Acesso Restrito</h3>
          <p className="text-[10px] text-[#64748b] mb-4">Digite a senha de administrador para continuar</p>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPasswordError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Senha..."
            className={`${inputStyle} mb-3 ${passwordError ? 'ring-1 ring-red-500/50' : ''}`}
            style={inputBg}
          />
          {passwordError && <p className="text-[10px] text-red-400 mb-2">Senha incorreta!</p>}
          <button onClick={handleLogin}
            className="w-full py-2 rounded-xl text-xs font-bold gold-gradient text-[#080b14] hover:brightness-110 transition-all">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const showItemModal = editingItem || isNewItem;
  const showPackModal = editingPack || isNewPack;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🔧</span>
          <div>
            <h2 className="text-sm font-bold text-white">Editor Admin</h2>
            <p className="text-[10px] text-[#64748b]">Editar itens da loja e pacotes de créditos</p>
          </div>
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setTab('items')} className={`px-3 py-1.5 text-xs transition-all ${tab === 'items' ? 'bg-white/10 text-white font-medium' : 'text-[#64748b] hover:text-white'}`}>
            🏪 Itens da Loja
          </button>
          <button onClick={() => setTab('packs')} className={`px-3 py-1.5 text-xs transition-all ${tab === 'packs' ? 'bg-white/10 text-white font-medium' : 'text-[#64748b] hover:text-white'}`}>
            💎 Pacotes de Créditos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* ITEMS TAB */}
        {tab === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#94a3b8]">{state.storeItems.length} itens na loja</span>
              <button onClick={openNewItem} className="px-3 py-1.5 rounded-lg text-xs font-medium gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                + Novo Item
              </button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['Emoji', 'Nome', 'Categoria', 'Raridade', 'Preço', 'Ações'].map(h => (
                      <th key={h} className="text-[10px] text-[#64748b] font-medium px-3 py-2 text-left uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.storeItems.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-3 py-2 text-lg">{item.emoji}</td>
                      <td className="px-3 py-2 text-xs text-white">{item.name}</td>
                      <td className="px-3 py-2 text-[10px] text-[#94a3b8]">{item.category}</td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: RARITY_COLORS[item.rarity], background: `${RARITY_COLORS[item.rarity]}15` }}>{item.rarity}</span>
                      </td>
                      <td className="px-3 py-2 text-xs gold-text">₿{item.price.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => openEditItem(item)} className="px-2 py-1 rounded text-[10px] hover:bg-blue-500/10 text-blue-400">✏️</button>
                          {confirmDeleteItem === item.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => deleteItem(item.id)} className="px-2 py-1 rounded text-[10px] bg-red-500/20 text-red-400">Sim</button>
                              <button onClick={() => setConfirmDeleteItem(null)} className="px-2 py-1 rounded text-[10px] text-[#64748b]">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteItem(item.id)} className="px-2 py-1 rounded text-[10px] hover:bg-red-500/10 text-red-400">🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PACKS TAB */}
        {tab === 'packs' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#94a3b8]">{state.creditPacks.length} pacotes de créditos</span>
              <button onClick={openNewPack} className="px-3 py-1.5 rounded-lg text-xs font-medium gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                + Novo Pacote
              </button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['Emoji', 'Nome', 'Berries', 'Bônus', 'Preço', 'Tags', 'Ações'].map(h => (
                      <th key={h} className="text-[10px] text-[#64748b] font-medium px-3 py-2 text-left uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.creditPacks.map(pack => (
                    <tr key={pack.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-3 py-2 text-lg">{pack.emoji}</td>
                      <td className="px-3 py-2 text-xs text-white">{pack.name}</td>
                      <td className="px-3 py-2 text-xs gold-text">₿{pack.berries.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: '#22c55e' }}>{pack.bonus > 0 ? `+₿${pack.bonus.toLocaleString()}` : '—'}</td>
                      <td className="px-3 py-2 text-xs text-white">{pack.price}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {pack.popular && <span className="text-[9px] px-1.5 py-0.5 rounded gold-gradient text-[#080b14] font-bold">Popular</span>}
                          {pack.bestValue && <span className="text-[9px] px-1.5 py-0.5 rounded text-white font-bold" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>Melhor</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => openEditPack(pack)} className="px-2 py-1 rounded text-[10px] hover:bg-blue-500/10 text-blue-400">✏️</button>
                          {confirmDeletePack === pack.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => deletePack(pack.id)} className="px-2 py-1 rounded text-[10px] bg-red-500/20 text-red-400">Sim</button>
                              <button onClick={() => setConfirmDeletePack(null)} className="px-2 py-1 rounded text-[10px] text-[#64748b]">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeletePack(pack.id)} className="px-2 py-1 rounded text-[10px] hover:bg-red-500/10 text-red-400">🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ITEM EDIT MODAL */}
        {showItemModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-96 max-h-[90%] overflow-y-auto rounded-2xl p-5" style={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-sm font-bold text-white mb-4">{isNewItem ? '➕ Novo Item' : '✏️ Editar Item'}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#64748b] mb-1 block">Emoji</label>
                    <input value={itemForm.emoji || ''} onChange={e => setItemForm({ ...itemForm, emoji: e.target.value })}
                      className={inputStyle} style={inputBg} />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-[#64748b] mb-1 block">Nome</label>
                    <input value={itemForm.name || ''} onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                      className={inputStyle} style={inputBg} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[#64748b] mb-1 block">Categoria</label>
                    <select value={itemForm.category || 'Armas'} onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                      className={inputStyle} style={inputBg}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748b] mb-1 block">Raridade</label>
                    <select value={itemForm.rarity || 'Comum'} onChange={e => setItemForm({ ...itemForm, rarity: e.target.value as StoreItem['rarity'] })}
                      className={inputStyle} style={inputBg}>
                      {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748b] mb-1 block">Preço (₿)</label>
                    <input type="number" value={itemForm.price || 0} onChange={e => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
                      className={inputStyle} style={inputBg} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] mb-1 block">Descrição</label>
                  <textarea value={itemForm.description || ''} onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                    className={`${inputStyle} resize-none`} rows={3} style={inputBg} />
                </div>
                {/* Stats */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-[#64748b]">Atributos</label>
                    <button onClick={() => setItemStats([...itemStats, { key: '', value: 0 }])} className="text-[10px] text-blue-400 hover:underline">+ Adicionar</button>
                  </div>
                  {itemStats.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <input value={s.key} onChange={e => { const n = [...itemStats]; n[i].key = e.target.value; setItemStats(n); }}
                        placeholder="Nome" className={`${inputStyle} flex-1`} style={inputBg} />
                      <input type="number" value={s.value} onChange={e => { const n = [...itemStats]; n[i].value = parseInt(e.target.value) || 0; setItemStats(n); }}
                        className={`${inputStyle} w-20`} style={inputBg} />
                      <button onClick={() => setItemStats(itemStats.filter((_, j) => j !== i))} className="text-red-400 text-xs px-1">✕</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setEditingItem(null); setIsNewItem(false); }}
                  className="flex-1 py-2 rounded-xl text-xs text-[#94a3b8] hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancelar
                </button>
                <button onClick={saveItem} className="flex-1 py-2 rounded-xl text-xs font-bold gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PACK EDIT MODAL */}
        {showPackModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-80 rounded-2xl p-5" style={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-sm font-bold text-white mb-4">{isNewPack ? '➕ Novo Pacote' : '✏️ Editar Pacote'}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#64748b] mb-1 block">Emoji</label>
                    <input value={packForm.emoji || ''} onChange={e => setPackForm({ ...packForm, emoji: e.target.value })}
                      className={inputStyle} style={inputBg} />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-[#64748b] mb-1 block">Nome</label>
                    <input value={packForm.name || ''} onChange={e => setPackForm({ ...packForm, name: e.target.value })}
                      className={inputStyle} style={inputBg} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#64748b] mb-1 block">Berries</label>
                    <input type="number" value={packForm.berries || 0} onChange={e => setPackForm({ ...packForm, berries: parseInt(e.target.value) || 0 })}
                      className={inputStyle} style={inputBg} />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748b] mb-1 block">Bônus</label>
                    <input type="number" value={packForm.bonus || 0} onChange={e => setPackForm({ ...packForm, bonus: parseInt(e.target.value) || 0 })}
                      className={inputStyle} style={inputBg} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] mb-1 block">Preço (ex: R$ 9,90)</label>
                  <input value={packForm.price || ''} onChange={e => setPackForm({ ...packForm, price: e.target.value })}
                    className={inputStyle} style={inputBg} />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
                    <input type="checkbox" checked={packForm.popular || false} onChange={e => setPackForm({ ...packForm, popular: e.target.checked })}
                      className="accent-[var(--os-accent)]" />
                    Popular
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
                    <input type="checkbox" checked={packForm.bestValue || false} onChange={e => setPackForm({ ...packForm, bestValue: e.target.checked })}
                      className="accent-[var(--os-accent)]" />
                    Melhor Valor
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setEditingPack(null); setIsNewPack(false); }}
                  className="flex-1 py-2 rounded-xl text-xs text-[#94a3b8] hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancelar
                </button>
                <button onClick={savePack} className="flex-1 py-2 rounded-xl text-xs font-bold gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
