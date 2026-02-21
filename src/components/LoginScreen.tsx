import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

const AVATARS = ['🏴‍☠️', '⚓', '🗡️', '🌊', '🔥', '❄️', '⚡', '🌪️', '💀'];

export default function LoginScreen() {
  const { state, dispatch, addToast } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regChar, setRegChar] = useState('');
  const [regAvatar, setRegAvatar] = useState('🏴‍☠️');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleLogin = useCallback(() => {
    const user = state.users.find(u => u.username === username && u.password === btoa(password));
    if (!user) {
      setError('Credenciais inválidas, Nakama!');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    if (state.settings.maintenanceMode && user.role !== 'master') {
      setError('Sistema em manutenção. Apenas mestres podem acessar.');
      return;
    }
    dispatch({ type: 'LOGIN', payload: user });
    addToast('success', `Bem-vindo de volta, ${user.characterName}!`);
  }, [username, password, state.users, state.settings, dispatch, addToast]);

  const handleRegister = useCallback(() => {
    if (!regUser || !regPass || !regChar) { setError('Preencha todos os campos!'); return; }
    if (regPass !== regConfirm) { setError('As senhas não coincidem!'); return; }
    if (regPass.length < 4) { setError('Senha deve ter pelo menos 4 caracteres!'); return; }
    if (state.users.find(u => u.username === regUser)) { setError('Este nome de usuário já existe!'); return; }
    const newUser = {
      id: `user-${Date.now()}`,
      username: regUser,
      password: btoa(regPass),
      characterName: regChar,
      avatar: regAvatar,
      role: 'player' as const,
      berries: state.settings.initialBerries,
      level: 1,
      xp: 0,
      ownedItems: [],
      ownedWallpapers: ['abyssal'],
      ownedThemes: ['piratas'],
      activeWallpaper: 'abyssal',
      activeTheme: 'piratas',
      seasonPassLevel: 1,
      seasonPassPremium: false,
      claimedRewards: [],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'REGISTER', payload: newUser });
    addToast('success', 'Conta criada com sucesso! Faça login, Nakama!');
    setTab('login');
    setUsername(regUser);
    setRegUser(''); setRegPass(''); setRegConfirm(''); setRegChar('');
    setError('');
  }, [regUser, regPass, regConfirm, regChar, regAvatar, state.users, state.settings, dispatch, addToast]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050810 0%, #0a1420 40%, #060b18 100%)' }}>
      {/* Light rays */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute opacity-[0.03]" style={{
          width: '200px', height: '100vh',
          background: 'linear-gradient(180deg, transparent, rgba(240,180,41,0.1), transparent)',
          left: `${15 + i * 18}%`, top: 0, transform: `rotate(${-15 + i * 8}deg)`,
          animation: `light-ray ${6 + i * 2}s ease-in-out infinite`, animationDelay: `${i * 0.8}s`,
        }} />
      ))}
      {/* Particles */}
      {[...Array(12)].map((_, i) => (
        <div key={`p-${i}`} className="absolute rounded-full animate-float-up"
          style={{
            width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`,
            background: 'rgba(240,180,41,0.3)', left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 12}s`, animationDelay: `${Math.random() * 8}s`,
          }} />
      ))}

      <div className={`relative w-[420px] max-h-[90vh] overflow-y-auto rounded-3xl glass-strong shadow-2xl animate-fade-in-up ${shaking ? 'animate-shake' : ''}`}
        style={{ boxShadow: '0 0 60px rgba(240,180,41,0.08)' }}>
        <div className="p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(240,180,41,0.4))' }}>☠️</div>
            <h1 className="text-2xl font-bold tracking-[0.25em] gold-text">{state.settings.osName}</h1>
            <p className="text-xs text-[#64748b] mt-1 tracking-wider">{state.settings.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${tab === t ? 'gold-gradient text-[#080b14] shadow-lg' : 'text-[#94a3b8] hover:text-white'}`}>
                {t === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

          {tab === 'login' ? (
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">👤</span>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuário"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-[#64748b] outline-none transition-all
                    focus:ring-2 focus:ring-[var(--os-accent)]/50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔑</span>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha"
                  type={showPass ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-white placeholder:text-[#64748b] outline-none transition-all
                    focus:ring-2 focus:ring-[var(--os-accent)]/50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b] hover:text-white">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <button onClick={handleLogin}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider gold-gradient text-[#080b14]
                  hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-lg">
                ENTRAR
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input value={regUser} onChange={e => setRegUser(e.target.value)} placeholder="Nome de usuário"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-[#64748b] outline-none transition-all focus:ring-2 focus:ring-[var(--os-accent)]/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <input value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Senha" type="password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-[#64748b] outline-none transition-all focus:ring-2 focus:ring-[var(--os-accent)]/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <input value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Confirmar senha" type="password"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-[#64748b] outline-none transition-all focus:ring-2 focus:ring-[var(--os-accent)]/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <input value={regChar} onChange={e => setRegChar(e.target.value)} placeholder="Nome do personagem"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-[#64748b] outline-none transition-all focus:ring-2 focus:ring-[var(--os-accent)]/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
              <div>
                <p className="text-xs text-[#94a3b8] mb-2">Escolha seu avatar:</p>
                <div className="grid grid-cols-5 gap-2">
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setRegAvatar(a)}
                      className={`text-2xl p-2 rounded-xl transition-all duration-150
                        ${regAvatar === a ? 'ring-2 ring-[var(--os-accent)] shadow-lg scale-110' : 'hover:scale-105'}`}
                      style={{ background: regAvatar === a ? 'rgba(240,180,41,0.15)' : 'rgba(255,255,255,0.05)' }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleRegister}
                className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider gold-gradient text-[#080b14]
                  hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shadow-lg">
                CRIAR CONTA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
