import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import type { CreditPack } from '../../types';

export default function CreditsStoreApp() {
  const { state, addToast } = useApp();
  const [selectedPack, setSelectedPack] = useState<CreditPack | null>(null);

  const user = state.currentUser!;

  const handlePurchase = (pack: CreditPack) => {
    setSelectedPack(pack);
  };

  const confirmPurchase = () => {
    if (!selectedPack) return;
    addToast('info', `🔗 Link de pagamento para ${selectedPack.name} será implementado em breve!`);
    setSelectedPack(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              💎 Loja de Créditos
            </h2>
            <p className="text-[10px] text-[#64748b] mt-0.5">Adquira Berries para comprar itens na loja</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)' }}>
            <span className="text-xs text-[#64748b]">Saldo atual:</span>
            <span className="text-sm font-bold gold-text">₿ {user.berries.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Packs Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {state.creditPacks.map(pack => (
            <div key={pack.id}
              className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: '#161d35',
                border: pack.popular ? '1px solid rgba(240,180,41,0.4)' : pack.bestValue ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: pack.popular ? '0 0 20px rgba(240,180,41,0.1)' : pack.bestValue ? '0 0 20px rgba(168,85,247,0.1)' : 'none',
              }}
              onClick={() => handlePurchase(pack)}>
              
              {pack.popular && (
                <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-bl-lg gold-gradient text-[#080b14]">
                  Popular
                </div>
              )}
              {pack.bestValue && (
                <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold uppercase rounded-bl-lg text-white"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                  Melhor Valor
                </div>
              )}

              <div className="h-20 flex items-center justify-center"
                style={{
                  background: pack.popular
                    ? 'linear-gradient(135deg, #2e2800, #3d3600)'
                    : pack.bestValue
                    ? 'linear-gradient(135deg, #1e0a30, #2d1650)'
                    : 'linear-gradient(135deg, #1a1a2e, #2d2d4a)',
                }}>
                <span className="text-4xl group-hover:scale-110 transition-transform"
                  style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
                  {pack.emoji}
                </span>
              </div>

              <div className="p-3">
                <h3 className="text-xs font-semibold text-white">{pack.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-lg font-bold gold-text">₿{pack.berries.toLocaleString()}</span>
                  {pack.bonus > 0 && (
                    <span className="text-[10px] font-medium px-1 py-0.5 rounded"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                      +{pack.bonus.toLocaleString()} bônus
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-bold text-white">{pack.price}</span>
                  <button
                    className="text-[10px] px-3 py-1 rounded-lg font-medium gold-gradient text-[#080b14] hover:brightness-110 transition-all"
                    onClick={e => { e.stopPropagation(); handlePurchase(pack); }}>
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] text-[#64748b] flex items-center gap-1.5">
            ℹ️ Os pagamentos serão processados por um link externo. Após a confirmação, os Berries serão creditados automaticamente na sua conta.
          </p>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {selectedPack && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-80 rounded-2xl p-5 animate-scale-in"
            style={{ background: '#0f1629', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-center mb-4">
              <span className="text-5xl block mb-3">{selectedPack.emoji}</span>
              <h3 className="text-sm font-bold text-white">{selectedPack.name}</h3>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-lg font-bold gold-text">₿{selectedPack.berries.toLocaleString()}</span>
                {selectedPack.bonus > 0 && (
                  <span className="text-[10px] px-1 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                    +{selectedPack.bonus.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#94a3b8]">Berries base</span>
                <span className="text-white">₿{selectedPack.berries.toLocaleString()}</span>
              </div>
              {selectedPack.bonus > 0 && (
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#94a3b8]">Bônus</span>
                  <span style={{ color: '#22c55e' }}>+₿{selectedPack.bonus.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-[#94a3b8]">Total</span>
                <span className="font-bold gold-text">₿{(selectedPack.berries + selectedPack.bonus).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSelectedPack(null)}
                className="flex-1 py-2 rounded-xl text-xs font-medium text-[#94a3b8] hover:bg-white/5 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancelar
              </button>
              <button onClick={confirmPurchase}
                className="flex-1 py-2 rounded-xl text-xs font-bold gold-gradient text-[#080b14] hover:brightness-110 transition-all">
                Pagar {selectedPack.price}
              </button>
            </div>

            <p className="text-[9px] text-[#64748b] text-center mt-3">
              🔒 Pagamento seguro via link externo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
