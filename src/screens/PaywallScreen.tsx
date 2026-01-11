
import React, { useState } from 'react';
import { useApp } from '../hooks/useStore';
import { api } from '../api/mockBackend';
import { Button } from '../components/UI';
import { CheckCircle, Lock } from 'lucide-react';

export const PaywallScreen = () => {
  const { navigate, login } = useApp(); // login refreshes user context in this mock
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    await api.stripe.purchasePack();
    await login(); // Refresh user state
    setLoading(false);
    navigate('case_list');
    alert("¡Pack activado con éxito!");
  };

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-yellow-500/20 p-6 rounded-full mb-6">
          <Lock size={48} className="text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Desbloquea NegociaSmart PRO</h1>
        <p className="text-gray-400 text-center mb-8">
          Invierte en tu futuro por menos de lo que cuesta una cena.
        </p>

        <div className="space-y-4 w-full max-w-sm">
          <Feature text="Casos de negociación ilimitados" />
          <Feature text="Simulaciones sin restricciones" />
          <Feature text="Análisis de rendimiento detallado" />
          <Feature text="5 Plantillas de email profesionales" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-800 p-4 rounded-xl text-center border border-gray-700">
          <span className="text-gray-400 line-through text-sm mr-2">29.99€</span>
          <span className="text-2xl font-bold text-white">14.99€</span>
          <span className="block text-xs text-gray-400 mt-1">Pago único. Acceso de por vida.</span>
        </div>
        
        <Button onClick={handlePurchase} isLoading={loading} className="bg-yellow-500 text-black hover:bg-yellow-400 border-none shadow-yellow-500/50">
          Comprar Pack PRO
        </Button>
        <button onClick={() => navigate('case_list')} className="w-full py-3 text-sm text-gray-500">
          Volver (Versión Limitada)
        </button>
      </div>
    </div>
  );
};

const Feature = ({ text }: any) => (
  <div className="flex items-center gap-3">
    <CheckCircle size={20} className="text-yellow-400 shrink-0" />
    <span className="text-gray-200 text-sm">{text}</span>
  </div>
);
