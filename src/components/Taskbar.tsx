import { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { APP_DEFINITIONS } from '../data/defaults';
import type { AppId } from '../types';

export default function Taskbar() {
  const { state, dispatch, addToast } = useApp();
  const [showStart, setShowStart] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [time, setTime] = useState(new Date());
  const startRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) setShowStart(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setShowAccount(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const user = state.currentUser;
  if (!user) return null;

  const apps = APP_DEFINITIONS.filter(a => !a.masterOnly || user.role === 'master');
  const openWindows = state.windows.filter(w => !w.isMinimized);

  const openApp = (appId: AppId, title: string, emoji: string) => {
    dispatch({ type: 'OPEN_APP', payload: { appId, title, emoji } });
    setShowStart(false);
  };

  const formatTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-12 z-[900] flex items-center px-2 gap-1"
        style={{ background: 'rgba(10,10,20,0.85)', backdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Start Button */}
        <div ref={startRef} className="relative">
          <button onClick={() => setShowStart(!showStart)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg gold-gradient hover:brightness-110 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md">
            ☠️
          </button>
          {showStart && (
            <div className="absolute bottom-14 left-0 w-[420px] rounded-2xl glass-strong shadow-2xl animate-fade-in-up overflow-hidden"
              style={{ boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
              <div className="p-4 pb-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-[#64748b] text-sm">🔍</span>
                  <span className="text-sm text-[#64748b]">Pesquisar no Old Era OS...</span>
                </div>
                <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 px-1">Fixados</p>
                <div className="grid grid-cols-3 gap-2">
                  {apps.map(app => (
                    <button key={app.id} onClick={() => openApp(app.id, app.title, app.emoji)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all duration-150 group">
                      <span className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg"
                        style={{ background: app.gradient }}>{app.emoji}</span>
                      <span className="text-xs text-[#94a3b8] group-hover:text-white transition-colors">{app.title}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{user.avatar}</span>
                  <div>
                    <p className="text-xs font-medium text-white">{user.characterName}</p>
                    <p className="text-[10px] text-[#64748b]">{user.role === 'master' ? '👑 Mestre' : 'Jogador'}</p>
                  </div>
                </div>
                <button onClick={() => { dispatch({ type: 'LOGOUT' }); setShowStart(false); addToast('info', 'Até logo, Nakama!'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#94a3b8] hover:bg-red-500/10 hover:text-red-400 transition-all">
                  ⏻ Desligar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Apps */}
        <div className="flex items-center gap-1 ml-1" style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '8px' }}>
          {apps.map(app => {
            const isOpen = state.windows.some(w => w.appId === app.id);
            return (
              <div key={app.id} className="relative group">
                <button onClick={() => openApp(app.id, app.title, app.emoji)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all duration-150"
                  style={{ background: isOpen ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: app.gradient }}>{app.emoji}</span>
                </button>
                {isOpen && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full" style={{ background: 'var(--os-accent)' }} />}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none glass">
                  {app.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Open Windows */}
        <div className="flex items-center gap-1 flex-1 min-w-0 ml-1">
          {state.windows.map(w => (
            <button key={w.id} onClick={() => {
              if (w.isMinimized) dispatch({ type: 'FOCUS_WINDOW', payload: w.id });
              else dispatch({ type: 'MINIMIZE_WINDOW', payload: w.id });
            }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs truncate max-w-[140px] transition-all duration-150
                ${!w.isMinimized ? 'text-white' : 'text-[#64748b]'}`}
              style={{ background: !w.isMinimized ? 'rgba(240,180,41,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span>{w.emoji}</span>
              <span className="truncate">{w.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-3 pr-2">
          <span className="text-xs font-medium gold-text">₿ {user.berries.toLocaleString()}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>Lv.{user.level}</span>
          <div className="text-right leading-tight">
            <div className="text-[11px] font-semibold text-white">{formatTime(time)}</div>
            <div className="text-[9px] text-[#64748b]">{formatDate(time)}</div>
          </div>
          <div ref={accountRef} className="relative">
            <button onClick={() => setShowAccount(!showAccount)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:ring-2 hover:ring-[var(--os-accent)]/30 transition-all"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              {user.avatar}
              {user.role === 'master' && <span className="absolute -top-1 -right-1 text-[8px]">👑</span>}
            </button>
            {showAccount && (
              <div className="absolute bottom-12 right-0 w-48 rounded-xl glass-strong shadow-2xl animate-fade-in-up overflow-hidden">
                <div className="p-3 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-2xl mb-1">{user.avatar}</div>
                  <p className="text-xs font-medium text-white">{user.characterName}</p>
                  <p className="text-[10px] text-[#64748b]">@{user.username}</p>
                </div>
                <button onClick={() => { dispatch({ type: 'LOGOUT' }); setShowAccount(false); }}
                  className="w-full px-3 py-2 text-xs text-left text-[#94a3b8] hover:bg-red-500/10 hover:text-red-400 transition-colors">
                  ⏻ Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
