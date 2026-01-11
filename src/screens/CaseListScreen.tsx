
import React from 'react';
import { useApp, useCases } from '../hooks/useStore';
import { Button, Card } from '../components/UI';
import { Plus, Briefcase, ChevronRight } from 'lucide-react';

export const CaseListScreen = () => {
  const { navigate, user } = useApp();
  const { data: cases, isLoading } = useCases();

  const handleCreate = () => {
    if (!user?.is_pro && cases && cases.length >= 1) {
      navigate('paywall');
    } else {
      navigate('create_case');
    }
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">Mis Negociaciones</h1>
        {user?.is_pro && <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-1 rounded-full font-bold shadow-[0_0_10px_rgba(234,179,8,0.3)]">PRO</span>}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <p className="text-center mt-10 text-gray-500">Cargando...</p>
        ) : cases && cases.length > 0 ? (
          <div className="space-y-3">
            {cases.map((c: any) => (
              <Card key={c.id} onClick={() => navigate('case_detail', { id: c.id })} className="group hover:bg-white/10 transition-colors cursor-pointer active:scale-[0.98]">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                    <Briefcase size={18} />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">{c.current_role}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Objetivo: <span className="text-white font-medium">{c.target_salary}€</span> <span className="text-green-400 font-bold ml-1">(+{Math.round(((c.target_salary - c.current_salary)/c.current_salary)*100)}%)</span>
                </p>
                <div className="flex justify-between items-center mt-3">
                    {c.ai_plan_json ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2 py-1 rounded-md inline-flex items-center gap-1">
                        <span>✓</span> Plan Listo
                    </div>
                    ) : (
                        <div className="text-gray-600 text-xs">Sin plan</div>
                    )}
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors"/>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-white/5 p-4 rounded-full mb-4 border border-white/5">
              <Briefcase size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 mb-6 max-w-[200px]">
              No tienes casos activos. Crea tu primera estrategia para empezar.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-white/10">
        <Button onClick={handleCreate}>
          <div className="flex items-center justify-center gap-2">
            <Plus size={20} />
            Nueva Negociación
          </div>
        </Button>
      </div>
    </div>
  );
};
