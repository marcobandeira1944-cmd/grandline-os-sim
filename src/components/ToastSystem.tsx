import { useApp } from '../contexts/AppContext';

export default function ToastSystem() {
  const { state, dispatch } = useApp();

  const typeStyles: Record<string, { accent: string; icon: string }> = {
    success: { accent: '#22c55e', icon: '✅' },
    error: { accent: '#ef4444', icon: '❌' },
    info: { accent: '#3b82f6', icon: 'ℹ️' },
    reward: { accent: '#f0b429', icon: '🏆' },
    levelup: { accent: '#f0b429', icon: '🎉' },
  };

  return (
    <div className="fixed bottom-14 right-4 z-[9999] flex flex-col-reverse gap-2 max-w-sm">
      {state.toasts.slice(-3).map(toast => {
        const s = typeStyles[toast.type] || typeStyles.info;
        return (
          <div key={toast.id} className="animate-toast-in rounded-xl shadow-2xl overflow-hidden glass-strong"
            style={{ borderLeft: `3px solid ${s.accent}` }}>
            <div className="flex items-start gap-2 p-3 pr-8">
              <span className="text-sm mt-0.5 shrink-0">{s.icon}</span>
              <p className="text-xs text-white leading-relaxed">{toast.message}</p>
              <button onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
                className="absolute top-2 right-2 text-[#64748b] hover:text-white text-xs">✕</button>
            </div>
            <div className="h-0.5 animate-progress-shrink" style={{ background: s.accent, animationDuration: `${toast.duration}ms` }} />
          </div>
        );
      })}
    </div>
  );
}
