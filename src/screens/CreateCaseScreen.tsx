
import React, { useState } from 'react';
import { useApp, useCreateCase } from '../hooks/useStore';
import { Button, Input, TextArea, Header } from '../components/UI';

export const CreateCaseScreen = () => {
  const { navigate } = useApp();
  const createCase = useCreateCase();
  
  const [form, setForm] = useState({
    title: 'Negociación Anual',
    current_role: '',
    current_salary: '',
    target_salary: '',
    achievements: ''
  });

  const handleSubmit = () => {
    if (!form.current_role || !form.target_salary) return;
    
    createCase.mutate({
      title: form.title,
      current_role: form.current_role,
      current_salary: Number(form.current_salary),
      target_salary: Number(form.target_salary),
      currency_code: 'EUR',
      achievements: form.achievements,
      negotiation_date: new Date().toISOString()
    }, {
      onSuccess: () => navigate('case_list'),
      onError: (err: any) => {
        if (err.message === 'LIMIT_REACHED') {
          navigate('paywall', { reason: 'limit' });
        }
      }
    });
  };

  return (
    <div className="bg-slate-900 min-h-full pb-8 flex flex-col">
      <Header title="Nuevo Caso" onBack={() => navigate('case_list')} />
      <div className="p-4 space-y-4 flex-1">
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
          <Input 
            label="Rol Actual" 
            placeholder="Ej: Operador de Planta"
            value={form.current_role}
            onChange={(e: any) => setForm({...form, current_role: e.target.value})}
          />
          <div className="flex space-x-4">
            <Input 
              label="Salario Actual (€)" 
              type="number" 
              placeholder="1650"
              value={form.current_salary}
              onChange={(e: any) => setForm({...form, current_salary: e.target.value})}
            />
            <Input 
              label="Objetivo (€)" 
              type="number" 
              placeholder="1900"
              value={form.target_salary}
              onChange={(e: any) => setForm({...form, target_salary: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
          <TextArea 
            label="Logros Clave (Argumentario)"
            placeholder="Describe tus hitos: 0 incidentes, reducción de tiempos, formación..."
            value={form.achievements}
            onChange={(e: any) => setForm({...form, achievements: e.target.value})}
          />
          <p className="text-xs text-gray-500 mb-2">
            La IA usará esto para construir tus argumentos y el guion de la simulación.
          </p>
        </div>

        <div className="pt-4">
            <Button 
            onClick={handleSubmit} 
            isLoading={createCase.isPending}
            >
            Crear Estrategia
            </Button>
        </div>
      </div>
    </div>
  );
};
