import { useRef, useCallback, useEffect, type ReactNode } from 'react';
import { useApp } from '../contexts/AppContext';

export default function Window({ id, children }: { id: string; children: ReactNode }) {
  const { state, dispatch } = useApp();
  const win = state.windows.find(w => w.id === id);
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const el = elRef.current;
      if (el) {
        el.style.left = `${dragRef.current.winX + dx}px`;
        el.style.top = `${dragRef.current.winY + dy}px`;
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (!dragRef.current || !win) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      dispatch({ type: 'UPDATE_WINDOW_POS', payload: { id, x: dragRef.current.winX + dx, y: dragRef.current.winY + dy } });
      dragRef.current = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [id, win, dispatch]);

  const onTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if (!win || win.isMaximized) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
    dispatch({ type: 'FOCUS_WINDOW', payload: id });
  }, [win, id, dispatch]);

  if (!win || win.isMinimized) return null;

  const style = win.isMaximized
    ? { left: 0, top: 0, width: '100vw', height: 'calc(100vh - 48px)', zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div ref={elRef}
      className={`fixed animate-window-open overflow-hidden flex flex-col ${win.isMaximized ? '' : 'rounded-xl'}`}
      style={{
        ...style,
        background: 'rgba(12, 15, 28, 0.92)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}
      onMouseDown={() => dispatch({ type: 'FOCUS_WINDOW', payload: id })}>
      {/* Title Bar */}
      <div className="flex items-center h-9 shrink-0 select-none cursor-default"
        style={{ background: 'rgba(15,22,41,0.98)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        onMouseDown={onTitleBarMouseDown}
        onDoubleClick={() => dispatch({ type: 'MAXIMIZE_WINDOW', payload: id })}>
        <div className="flex items-center gap-2 px-3 flex-1 min-w-0">
          <span className="text-sm flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' }}>
            {win.emoji}
          </span>
          <span className="text-xs font-semibold text-white truncate">{win.title}</span>
        </div>
        <div className="flex h-full">
          <button onClick={() => dispatch({ type: 'MINIMIZE_WINDOW', payload: id })}
            className="w-11 h-full flex items-center justify-center text-[#94a3b8] hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
            title="Minimizar">
            <svg width="10" height="1" viewBox="0 0 10 1"><rect fill="currentColor" width="10" height="1" /></svg>
          </button>
          <button onClick={() => dispatch({ type: 'MAXIMIZE_WINDOW', payload: id })}
            className="w-11 h-full flex items-center justify-center text-[#94a3b8] hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
            title={win.isMaximized ? 'Restaurar' : 'Maximizar'}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              {win.isMaximized ? <><rect x="2" y="0" width="8" height="8" rx="1" /><rect x="0" y="2" width="8" height="8" rx="1" /></> : <rect x="0.5" y="0.5" width="9" height="9" rx="1" />}
            </svg>
          </button>
          <button onClick={() => dispatch({ type: 'CLOSE_WINDOW', payload: id })}
            className="w-11 h-full flex items-center justify-center text-[#94a3b8] hover:bg-red-500 hover:text-white transition-colors"
            title="Fechar">
            <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto min-h-0">{children}</div>
    </div>
  );
}
