import { useApp } from '../../contexts/AppContext';
import { WALLPAPERS } from '../../data/defaults';

export default function WallpaperApp() {
  const { state, dispatch, addToast } = useApp();
  const user = state.currentUser!;

  const activeWp = WALLPAPERS.find(w => w.id === user.activeWallpaper) || WALLPAPERS[0];

  const handleApply = (wpId: string) => {
    if (!user.ownedWallpapers.includes(wpId)) {
      addToast('error', '🔒 Este papel de parede está bloqueado. Desbloqueie pelo Passe de Temporada!');
      return;
    }
    dispatch({ type: 'SET_WALLPAPER', payload: wpId });
    addToast('success', '🖼️ Papel de parede aplicado!');
  };

  return (
    <div className="flex h-full">
      {/* Preview */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-3">Wallpaper Atual</p>
        <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl relative"
          style={{ background: activeWp.gradient, border: '2px solid rgba(240,180,41,0.3)' }}>
          {/* Mini mockup */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 h-3 w-24 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
        </div>
        <p className="text-sm font-medium text-white mt-3">{activeWp.name}</p>
        <p className="text-[10px] text-[#64748b]">✓ Ativo</p>
      </div>

      {/* Grid */}
      <div className="w-80 overflow-y-auto p-3">
        <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-3 px-1">Escolher Wallpaper</p>
        <div className="grid grid-cols-2 gap-2">
          {WALLPAPERS.map(wp => {
            const owned = user.ownedWallpapers.includes(wp.id);
            const isActive = user.activeWallpaper === wp.id;
            return (
              <button key={wp.id} onClick={() => handleApply(wp.id)}
                className={`rounded-xl overflow-hidden transition-all duration-200 group relative
                  ${isActive ? 'ring-2 ring-[var(--os-accent)] shadow-lg' : 'hover:scale-[1.03]'}`}
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="aspect-video relative" style={{ background: wp.gradient }}>
                  {!owned && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
                      <span className="text-lg">🔒</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded gold-gradient text-[#080b14]">✓ Ativo</div>
                  )}
                  {owned && !isActive && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <span className="text-[10px] font-medium text-white px-3 py-1 rounded-lg gold-gradient text-[#080b14]">Aplicar</span>
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5" style={{ background: 'rgba(15,22,41,0.8)' }}>
                  <p className="text-[10px] font-medium text-white truncate">{wp.name}</p>
                  {!owned && <p className="text-[8px] text-[#f0b429]">🔒 Passe Premium</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
