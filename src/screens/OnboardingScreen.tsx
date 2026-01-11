
import React from 'react';
import { useApp } from '../hooks/useStore';
import { Button } from '../components/UI';

export const OnboardingScreen = () => {
  const { navigate } = useApp();

  return (
    <div className="h-full flex flex-col p-6 bg-slate-900 relative">
       {/* Background Ambience */}
       <div className="absolute top-[10%] right-[-20%] w-[60%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 mt-6 z-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Consigue lo que mereces</h1>
        <div className="space-y-8 pb-4">
          <Step 
            number="1" 
            title="Define tu caso" 
            desc="Introduce tus logros, salario actual y objetivo." 
          />
          <Step 
            number="2" 
            title="Genera tu estrategia" 
            desc="Recibe un plan paso a paso creado por IA." 
          />
          <Step 
            number="3" 
            title="Entrena con el Simulador" 
            desc="Practica con un jefe virtual difícil antes de la reunión real." 
          />
          <Step 
            number="4" 
            title="Recibe Feedback" 
            desc="Obtén tips y análisis detallado sobre tus errores y aciertos."
            isLast={true}
          />
        </div>
      </div>
      <div className="pt-4">
        <Button onClick={() => navigate('case_list')}>Empezar ahora</Button>
      </div>
    </div>
  );
};

const Step = ({ number, title, desc, isLast }: any) => (
  <div className="flex relative">
    {/* Line connector - hidden if it's the last step */}
    {!isLast && (
      <div className="absolute left-[15px] top-10 bottom-[-40px] w-0.5 bg-white/5"></div>
    )}
    
    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 font-bold flex items-center justify-center mr-4 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 bg-slate-900">
      {number}
    </div>
    <div>
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-gray-400 text-sm mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);
