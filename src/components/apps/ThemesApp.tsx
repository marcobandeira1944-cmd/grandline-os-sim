import { useApp } from '../../contexts/AppContext';
import { THEMES } from '../../data/defaults';

export default function ThemesApp() {
  const { state, dispatch, addToast } = useApp();
  const user = state.currentUser!;

  const handleApply = (themeId: string) => {
    if (!user.ownedThemes.includes(themeId)) {
      addToast('error', '🔒 Tema bloqueado. Desbloqueie pelo Passe de Temporada!');
      return;
    }
    dispatch({ type: 'SET_THEME', payload: themeId });
    addToast('success', '🎨 Tema aplicado com sucesso!');
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">Personalização</h2>
        <p className="text-xs text-[#64748b]">Escolha o tema visual do seu Old Era OS</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {THEMES.map(theme => {
          const owned = user.ownedThemes.includes(theme.id);
          const isActive = user.activeTheme === theme.id;
          return (
            <button key={theme.id} onClick={() => handleApply(theme.id)}
              className={`rounded-2xl overflow-hidden text-left transition-all duration-200 group relative
                ${isActive ? 'ring-2 ring-[var(--os-accent)]' : 'hover:scale-[1.02]'}`}
              style={{ background: '#161d35', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Mini preview */}
              <div className="h-24 relative p-2" style={{ background: theme.bg }}>
                {/* Mini window */}
                <div className="absolute top-3 left-4 w-16 h-10 rounded-md overflow-hidden"
                  style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                  <div className="h-2.5" style={{ background: 'rgba(0,0,0,0.3)' }} />
                </div>
                {/* Mini taskbar */}
                <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="h-1.5 w-3 rounded-sm mx-auto mt-0.5" style={{ background: theme.accent }} />
                </div>
                {!owned && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <span className="text-lg">🔒</span>
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded gold-gradient text-[#080b14]">Ativo</div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
                  <h3 className="text-xs font-semibold text-white">{theme.name}</h3>
                </div>
                <p className="text-[10px] text-[#64748b]">{theme.description}</p>
                {!owned && <p className="text-[9px] text-[#f0b429] mt-1">🔒 Passe de Temporada</p>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
