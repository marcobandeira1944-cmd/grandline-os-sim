import { useEffect, useState } from 'react';

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'fade'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fade'), 1200);
    const t2 = setTimeout(onDone, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #050810 0%, #0a1420 40%, #060b18 100%)' }}>
      <div className="text-center animate-fade-in-up">
        <div className="text-6xl mb-4 animate-boot-pulse" style={{ filter: 'drop-shadow(0 0 20px rgba(240,180,41,0.5))' }}>☠️</div>
        <h1 className="text-3xl font-bold tracking-[0.3em] gold-text mb-2">OLD ERA OS</h1>
        <p className="text-sm text-[#94a3b8] tracking-widest">Iniciando...</p>
        <div className="mt-6 w-48 h-1 mx-auto rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full gold-gradient" style={{ animation: 'progress-shrink 1.5s linear reverse forwards' }} />
        </div>
      </div>
    </div>
  );
}
