import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { StoreItem } from '../../types';

const SECTIONS = [
  { id: 'items', label: '🏪 Itens da Loja' },
  { id: 'users', label: '👥 Usuários' },
  { id: 'season', label: '🎫 Passe de Temporada' },
  { id: 'settings', label: '⚙️ Configurações Gerais' },
];
const CATEGORIES = ['Armas', 'Frutas do Diabo', 'Navios', 'Acessórios', 'Especiais'];
const RARITIES: StoreItem['rarity'][] = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'];
const RARITY_COLORS: Record<string, string> = { Comum: '#94a3b8', Incomum: '#22c55e', Raro: '#3b82f6', Épico: '#a855f7', Lendário: '#f0b429' };

export default function MasterPanel() {
  const { state, dispatch, addToast } = useApp();
  const [section, setSection] = useState('items');
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // User actions modal state
  const [userAction, setUserAction] = useState<{ type: string; userId: string } | null>(null);
  const [actionValue, setActionValue] = useState('');

  // Settings
  const [settingsForm, setSettingsForm] = useState(state.settings);

  const inputStyle = "w-full px-3 py-2 rounded-lg text-xs text-white placeholder:text-[#64748b] outline-none focus:ring-1 focus:ring-[var(--os-accent)]/50";
  const inputBg = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' };

  // Item form state
  const [itemForm, setItemForm] = useState<Partial<StoreItem>>({});
  const [itemStats, setItemStats] = useState<Array<{ key: string; value: number }>>([]);

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
      addToast('success', `${item.emoji} ${item.name} adicionado à loja!`);
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
    setConfirmDelete(null);
  };

  const handleUserAction = () => {
    if (!userAction) return;
    const { type, userId } = userAction;
    const val = actionValue;

    switch (type) {
      case 'berries':
        dispatch({ type: 'GIVE_BERRIES', payload: { userId, amount: parseInt(val) || 0 } });
        addToast('success', `💰 ₿${val} concedidos!`);
        break;
      case 'item':
        dispatch({ type: 'GIVE_ITEM', payload: { userId, itemId: val } });
        const item = state.storeItems.find(i => i.id === val);
        addToast('success', `📦 ${item?.name || 'Item'} concedido!`);
        break;
      case 'level':
        dispatch({ type: 'SET_USER_LEVEL', payload: { userId, level: parseInt(val) || 1 } });
        addToast('success', `⬆️ Nível definido para ${val}!`);
        break;
      case 'role':
        dispatch({ type: 'TOGGLE_USER_ROLE', payload: userId });
        addToast('success', 'Cargo alterado!');
        break;
      case 'delete':
        dispatch({ type: 'DELETE_USER', payload: userId });
        addToast('info', 'Conta removida');
        break;
    }
    setUserAction(null);
    setActionValue('');
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-52 shrink-0 p-2 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <span className="text-lg">👑</span>
          <span className="text-xs font-bold text-white">Painel Mestre</span>
        </div>
        <div className="h-px mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all mb-0.5
              ${section === s.id ? 'text-white font-medium' : 'text-[#94a3b8] hover:text-white hover:bg-white/5'}`}
            style={section === s.id ? { background: 'rgba(255,255,255,0.06)', borderLeft: '2px solid var(--os-accent)' } : {}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* ITEMS SECTION */}
        {section === 'items' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Gerenciar Itens da Loja</h3>
              <button onClick={openNewItem} className="px-3 py-1.5 rounded-lg text-xs font-medium gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                + Novo Item
              </button>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['#', 'Emoji', 'Nome', 'Categoria', 'Raridade', 'Preço', 'Ações'].map(h => (
                      <th key={h} className="text-[10px] text-[#64748b] font-medium px-3 py-2 text-left uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.storeItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-3 py-2 text-[10px] text-[#64748b]">{idx + 1}</td>
                      <td className="px-3 py-2 text-lg">{item.emoji}</td>
                      <td className="px-3 py-2 text-xs text-white">{item.name}</td>
                      <td className="px-3 py-2 text-[10px] text-[#94a3b8]">{item.category}</td>
                      <td className="px-3 py-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: RARITY_COLORS[item.rarity], background: `${RARITY_COLORS[item.rarity]}15` }}>{item.rarity}</span>
                      </td>
                      <td className="px-3 py-2 text-xs gold-text">₿{item.price.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => openEditItem(item)} className="px-2 py-1 rounded text-[10px] hover:bg-blue-500/10 text-blue-400 transition-colors">✏️</button>
                          {confirmDelete === item.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => deleteItem(item.id)} className="px-2 py-1 rounded text-[10px] bg-red-500/20 text-red-400">Sim</button>
                              <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded text-[10px] text-[#64748b]">Não</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(item.id)} className="px-2 py-1 rounded text-[10px] hover:bg-red-500/10 text-red-400 transition-colors">🗑️</button>
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

        {/* USERS SECTION */}
        {section === 'users' && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Gerenciar Usuários</h3>
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['Avatar', 'Username', 'Personagem', 'Nível', 'Berries', 'Cargo', 'Ações'].map(h => (
                      <th key={h} className="text-[10px] text-[#64748b] font-medium px-3 py-2 text-left uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.users.map(u => {
                    const isSelf = u.id === state.currentUser?.id;
                    return (
                      <tr key={u.id} className={`transition-colors ${isSelf ? 'opacity-50' : 'hover:bg-white/[0.03]'}`}
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-3 py-2 text-lg relative">
                          {u.avatar}
                          {u.role === 'master' && <span className="absolute -top-0.5 -right-0.5 text-[8px]">👑</span>}
                        </td>
                        <td className="px-3 py-2 text-xs text-white">{u.username}</td>
                        <td className="px-3 py-2 text-xs text-[#94a3b8]">{u.characterName}</td>
                        <td className="px-3 py-2 text-xs text-white">{u.level}</td>
                        <td className="px-3 py-2 text-xs gold-text">₿{u.berries.toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${u.role === 'master' ? 'text-[#f0b429] bg-[#f0b429]/10' : 'text-blue-400 bg-blue-400/10'}`}>
                            {u.role === 'master' ? '👑 Mestre' : 'Jogador'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {isSelf ? (
                            <span className="text-[9px] text-[#64748b]">Sua conta</span>
                          ) : (
                            <div className="flex gap-1">
                              <button onClick={() => { setUserAction({ type: 'berries', userId: u.id }); setActionValue('1000'); }}
                                className="px-1.5 py-1 rounded text-[10px] hover:bg-white/5 transition-colors" title="Dar Berries">💰</button>
                              <button onClick={() => { setUserAction({ type: 'item', userId: u.id }); setActionValue(state.storeItems[0]?.id || ''); }}
                                className="px-1.5 py-1 rounded text-[10px] hover:bg-white/5 transition-colors" title="Dar Item">📦</button>
                              <button onClick={() => { setUserAction({ type: 'level', userId: u.id }); setActionValue(String(u.level)); }}
                                className="px-1.5 py-1 rounded text-[10px] hover:bg-white/5 transition-colors" title="Definir Nível">📊</button>
                              <button onClick={() => { setUserAction({ type: 'role', userId: u.id }); handleUserAction(); dispatch({ type: 'TOGGLE_USER_ROLE', payload: u.id }); addToast('success', 'Cargo alterado!'); }}
                                className="px-1.5 py-1 rounded text-[10px] hover:bg-white/5 transition-colors" title="Alterar Cargo">👑</button>
                              <button onClick={() => setUserAction({ type: 'delete', userId: u.id })}
                                className="px-1.5 py-1 rounded text-[10px] hover:bg-red-500/10 text-red-400 transition-colors" title="Deletar">🗑️</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEASON SECTION */}
        {section === 'season' && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Gerenciar Passe de Temporada</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] text-[#64748b] mb-1 block">Nome da Temporada</label>
                <input value={state.settings.seasonName}
                  onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { seasonName: e.target.value } })}
                  className={inputStyle} style={inputBg} />
              </div>
              <div>
                <label className="text-[10px] text-[#64748b] mb-1 block">Descrição</label>
                <input value={state.settings.seasonDescription}
                  onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { seasonDescription: e.target.value } })}
                  className={inputStyle} style={inputBg} />
              </div>
            </div>
            <p className="text-xs text-[#64748b] mb-2">Tabela de recompensas (100 níveis)</p>
            <div className="rounded-xl overflow-hidden max-h-[400px] overflow-y-auto" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <table className="w-full">
                <thead className="sticky top-0" style={{ background: 'rgba(15,22,41,0.98)' }}>
                  <tr>
                    {['Nv', 'Track', 'Tipo', 'Valor'].map(h => (
                      <th key={h} className="text-[10px] text-[#64748b] font-medium px-2 py-1.5 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.seasonRewards.map((r, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="px-2 py-1 text-[10px] text-[#94a3b8]">{r.level}</td>
                      <td className="px-2 py-1 text-[10px]">
                        <span className={r.premium ? 'text-[#f0b429]' : 'text-[#64748b]'}>{r.premium ? '⭐ Premium' : 'Gratuito'}</span>
                      </td>
                      <td className="px-2 py-1 text-[10px] text-white capitalize">{r.type}</td>
                      <td className="px-2 py-1 text-[10px] text-white">{r.type === 'berries' ? `₿${r.value}` : r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS SECTION */}
        {section === 'settings' && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Configurações Gerais</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-[10px] text-[#64748b] mb-1 block">Nome do OS</label>
                <input value={settingsForm.osName} onChange={e => setSettingsForm({ ...settingsForm, osName: e.target.value })}
                  className={inputStyle} style={inputBg} />
              </div>
              <div>
                <label className="text-[10px] text-[#64748b] mb-1 block">Subtítulo</label>
                <input value={settingsForm.subtitle} onChange={e => setSettingsForm({ ...settingsForm, subtitle: e.target.value })}
                  className={inputStyle} style={inputBg} />
              </div>
              <div>
                <label className="text-[10px] text-[#64748b] mb-1 block">Mensagem de boas-vindas</label>
                <textarea value={settingsForm.welcomeMessage} onChange={e => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
                  className={`${inputStyle} resize-none`} rows={3} style={inputBg} />
              </div>
              <div>
                <label className="text-[10px] text-[#64748b] mb-1 block">Berries iniciais para novas contas</label>
                <input type="number" value={settingsForm.initialBerries} onChange={e => setSettingsForm({ ...settingsForm, initialBerries: parseInt(e.target.value) || 0 })}
                  className={inputStyle} style={inputBg} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-xs text-white">Modo Manutenção</p>
                  <p className="text-[10px] text-[#64748b]">Bloqueia acesso de jogadores</p>
                </div>
                <button onClick={() => setSettingsForm({ ...settingsForm, maintenanceMode: !settingsForm.maintenanceMode })}
                  className={`w-10 h-5 rounded-full transition-all duration-200 relative ${settingsForm.maintenanceMode ? 'gold-gradient' : ''}`}
                  style={!settingsForm.maintenanceMode ? { background: 'rgba(255,255,255,0.15)' } : {}}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${settingsForm.maintenanceMode ? 'left-5.5' : 'left-0.5'}`}
                    style={{ left: settingsForm.maintenanceMode ? '22px' : '2px' }} />
                </button>
              </div>
              <button onClick={() => { dispatch({ type: 'UPDATE_SETTINGS', payload: settingsForm }); addToast('success', 'Configurações salvas!'); }}
                className="px-4 py-2 rounded-xl text-xs font-medium gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        {/* Item Edit Panel */}
        {(editingItem || isNewItem) && (
          <div className="fixed top-0 right-0 w-96 h-full animate-slide-in-right glass-strong shadow-2xl z-50 overflow-y-auto"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">{isNewItem ? 'Novo Item' : 'Editar Item'}</h3>
                <button onClick={() => { setEditingItem(null); setIsNewItem(false); }} className="text-[#64748b] hover:text-white text-sm">✕</button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' }}>
                    {itemForm.emoji || '📦'}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-[#64748b] mb-1 block">Emoji</label>
                    <input value={itemForm.emoji || ''} onChange={e => setItemForm({ ...itemForm, emoji: e.target.value })}
                      className={inputStyle} style={inputBg} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] mb-1 block">Nome</label>
                  <input value={itemForm.name || ''} onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    className={inputStyle} style={inputBg} />
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] mb-1 block">Preço (₿)</label>
                  <input type="number" value={itemForm.price || 0} onChange={e => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
                    className={inputStyle} style={inputBg} />
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] mb-1 block">Descrição</label>
                  <textarea value={itemForm.description || ''} onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                    className={`${inputStyle} resize-none`} rows={3} style={inputBg} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-[#64748b]">Stats</label>
                    <button onClick={() => setItemStats([...itemStats, { key: '', value: 0 }])}
                      className="text-[10px] text-[var(--os-accent)] hover:brightness-110">+ Adicionar</button>
                  </div>
                  {itemStats.map((s, i) => (
                    <div key={i} className="flex gap-1 mb-1">
                      <input value={s.key} onChange={e => { const ns = [...itemStats]; ns[i].key = e.target.value; setItemStats(ns); }}
                        placeholder="Nome" className={`flex-1 ${inputStyle}`} style={inputBg} />
                      <input type="number" value={s.value} onChange={e => { const ns = [...itemStats]; ns[i].value = parseInt(e.target.value) || 0; setItemStats(ns); }}
                        className={`w-16 ${inputStyle}`} style={inputBg} />
                      <button onClick={() => setItemStats(itemStats.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 px-1.5 hover:bg-red-500/10 rounded">✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={saveItem}
                  className="w-full py-2 rounded-xl text-xs font-bold gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                  {isNewItem ? 'Criar Item' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Action Modal */}
        {userAction && userAction.type !== 'role' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setUserAction(null)}>
            <div className="w-80 rounded-2xl glass-strong p-4 animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-semibold text-white mb-3">
                {userAction.type === 'berries' && '💰 Dar Berries'}
                {userAction.type === 'item' && '📦 Dar Item'}
                {userAction.type === 'level' && '📊 Definir Nível'}
                {userAction.type === 'delete' && '🗑️ Deletar Conta'}
              </h3>
              {userAction.type === 'delete' ? (
                <div>
                  <p className="text-xs text-red-400 mb-3">Tem certeza que deseja deletar esta conta? Esta ação não pode ser desfeita.</p>
                  <div className="flex gap-2">
                    <button onClick={handleUserAction} className="flex-1 py-2 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Confirmar</button>
                    <button onClick={() => setUserAction(null)} className="flex-1 py-2 rounded-lg text-xs text-[#64748b] hover:text-white transition-colors" style={{ background: 'rgba(255,255,255,0.05)' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAction.type === 'item' ? (
                    <select value={actionValue} onChange={e => setActionValue(e.target.value)}
                      className={inputStyle} style={inputBg}>
                      {state.storeItems.map(i => <option key={i.id} value={i.id}>{i.emoji} {i.name}</option>)}
                    </select>
                  ) : (
                    <input type="number" value={actionValue} onChange={e => setActionValue(e.target.value)}
                      className={inputStyle} style={inputBg}
                      placeholder={userAction.type === 'berries' ? 'Quantidade de berries' : 'Nível (1-100)'} />
                  )}
                  <div className="flex gap-2">
                    <button onClick={handleUserAction} className="flex-1 py-2 rounded-lg text-xs gold-gradient text-[#080b14] font-medium hover:brightness-110 transition-all">Confirmar</button>
                    <button onClick={() => setUserAction(null)} className="flex-1 py-2 rounded-lg text-xs text-[#64748b]" style={{ background: 'rgba(255,255,255,0.05)' }}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
