import { useApp } from '../contexts/AppContext';
import { WALLPAPERS } from '../data/defaults';
import Window from './Window';
import Taskbar from './Taskbar';
import ToastSystem from './ToastSystem';
import StoreApp from './apps/StoreApp';
import InventoryApp from './apps/InventoryApp';
import SeasonPassApp from './apps/SeasonPassApp';
import WallpaperApp from './apps/WallpaperApp';
import ThemesApp from './apps/ThemesApp';
import MasterPanel from './apps/MasterPanel';
import CreditsStoreApp from './apps/CreditsStoreApp';

const APP_COMPONENTS: Record<string, React.FC> = {
  loja: StoreApp,
  estoque: InventoryApp,
  passe: SeasonPassApp,
  wallpaper: WallpaperApp,
  temas: ThemesApp,
  mestre: MasterPanel,
  creditos: CreditsStoreApp,
};

export default function Desktop() {
  const { state } = useApp();
  const user = state.currentUser;
  if (!user) return null;

  const wp = WALLPAPERS.find(w => w.id === user.activeWallpaper);
  const bgStyle = wp ? wp.gradient : WALLPAPERS[0].gradient;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: bgStyle }}>
      {/* Windows */}
      {state.windows.filter(w => !w.isMinimized).map(w => {
        const AppComp = APP_COMPONENTS[w.appId];
        return AppComp ? (
          <Window key={w.id} id={w.id}>
            <AppComp />
          </Window>
        ) : null;
      })}

      {/* Taskbar */}
      <Taskbar />

      {/* Toasts */}
      <ToastSystem />
    </div>
  );
}
