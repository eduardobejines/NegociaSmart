
import React, { useState, useEffect } from 'react';
import { useApp, useGeneratePlan } from '../hooks/useStore';
import { api } from '../api/mockBackend';
import { Header, Button, Card } from '../components/UI';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, MessageSquare, Award, FileText, Lock, ArrowRight, Lightbulb } from 'lucide-react';
import { Score } from '../utils/types';

export const CaseDetailScreen = () => {
  const { currentParams, navigate, user } = useApp();
  const caseId = currentParams?.id;
  const [activeTab, setActiveTab] = useState<'plan' | 'sim' | 'score' | 'templates'>('plan');

  // Fetch Case Data
  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => api.cases.getById(caseId)
  });

  const generatePlan = useGeneratePlan();

  if (isLoading || !caseData) return <div className="p-10 text-center text-gray-400">Cargando caso...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <Header 
        title={caseData.current_role} 
        subtitle={`Objetivo: ${caseData.target_salary}€ (+${Math.round(((caseData.target_salary - caseData.current_salary)/caseData.current_salary)*100)}%)`}
        onBack={() => navigate('case_list')} 
      />
      
      {/* TABS HEADER */}
      <div className="flex bg-slate-900 border-b border-white/10">
        <TabButton active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} icon={<FileText size={18} />} label="Plan" />
        <TabButton active={activeTab === 'sim'} onClick={() => setActiveTab('sim')} icon={<MessageSquare size={18} />} label="Simular" />
        <TabButton active={activeTab === 'score'} onClick={() => setActiveTab('score')} icon={<Award size={18} />} label="Score" />
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {activeTab === 'plan' && (
          <PlanTab 
            caseData={caseData} 
            onGenerate={() => generatePlan.mutate({ caseId })} 
            isGenerating={generatePlan.isPending} 
          />
        )}
        {activeTab === 'sim' && (
          <SimulatorTab 
            caseId={caseId} 
            onSimulationComplete={() => setActiveTab('score')} 
            isPro={user?.is_pro}
          />
        )}
        {activeTab === 'score' && <ScoreTab caseId={caseId} isPro={user?.is_pro} />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3 flex flex-col items-center justify-center text-xs font-medium transition-colors ${active ? 'text-blue-400 border-b-2 border-blue-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <div className="mb-1">{icon}</div>
    {label}
  </button>
);

// --- TAB COMPONENTS ---

const PlanTab = ({ caseData, onGenerate, isGenerating }: any) => {
  if (!caseData.ai_plan_json) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="bg-blue-500/10 p-6 rounded-full mb-4 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <FileText size={32} className="text-blue-400" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-white">Generar Estrategia IA</h3>
        <p className="text-gray-400 mb-6 text-sm">
          Analizaremos tus logros para crear un plan de negociación estructurado, incluyendo argumentos y manejo de objeciones.
        </p>
        <Button onClick={onGenerate} isLoading={isGenerating}>Generar Plan Ahora</Button>
      </div>
    );
  }

  const plan = caseData.ai_plan_json;

  return (
    <div className="space-y-4 pb-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-900/20 border-blue-500/20">
          <p className="text-xs text-blue-400 font-bold uppercase mb-1">Ancla (Petición)</p>
          <p className="text-2xl font-bold text-white">{plan.anchor_amount}€</p>
        </Card>
        <Card className="bg-emerald-900/20 border-emerald-500/20">
          <p className="text-xs text-emerald-400 font-bold uppercase mb-1">Rango Meta</p>
          <p className="text-xl font-bold text-white">{plan.target_range}€</p>
        </Card>
      </div>

      <Section title="Argumento de Apertura">
        <p className="text-gray-300 text-sm leading-relaxed">{plan.opening_argument}</p>
      </Section>

      <Section title="Evidencias (Logros)">
        <ul className="list-disc pl-4 space-y-2">
          {plan.evidence_bullets.map((b: string, i: number) => (
            <li key={i} className="text-sm text-gray-300">{b}</li>
          ))}
        </ul>
      </Section>

      <Section title="Manejo de Objeciones">
        {plan.anticipated_objections.map((obj: any, i: number) => (
          <div key={i} className="mb-3 last:mb-0 bg-red-900/10 p-3 rounded-lg border border-red-500/20">
            <p className="text-xs font-bold text-red-400 mb-1">🗣 "{obj.objection}"</p>
            <p className="text-sm text-gray-300">💡 {obj.response}</p>
          </div>
        ))}
      </Section>

      <Section title="Cierre Propuesto">
        <p className="text-sm italic text-gray-400 border-l-4 border-blue-500/50 pl-3">"{plan.closing_statement}"</p>
      </Section>
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10">
    <h3 className="font-bold text-white mb-3 flex items-center">
      {title}
    </h3>
    {children}
  </div>
);

// Array of random expert tips
const EXPERT_TIPS = [
  "El silencio es una herramienta de presión. Después de decir tu cifra, calla. El primero en hablar pierde poder.",
  "Nunca aceptes la primera oferta. Incluso si es buena, muestra dudas para mejorar los términos.",
  "Separa a la persona del problema. Sé duro con los argumentos pero suave con la gente.",
  "Usa el 'nosotros' para enmarcar la negociación como un problema a resolver juntos.",
  "Ten siempre preparado tu BATNA (tu mejor alternativa) por si no llegáis a un acuerdo.",
  "No negocies contra ti mismo. Espera siempre una contraoferta antes de bajar tu petición.",
  "Justifica cada número. Un salario basado en datos de mercado es más difícil de refutar.",
  "Si no hay dinero, negocia variables: días libres, formación, teletrabajo o bonus.",
];

const SimulatorTab = ({ caseId, onSimulationComplete, isPro }: any) => {
  const { navigate } = useApp();
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [currentTip, setCurrentTip] = useState(""); // State for the random tip
  
  const queryClient = useQueryClient();
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);

  // Check previous sessions to block free users after first try
  const { data: existingSessions } = useQuery({
    queryKey: ['sessions', caseId],
    queryFn: () => api.sessions.getByCaseId(caseId)
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const startSession = async (persona: string) => {
    // RESTRICTION LOGIC:
    // If not pro AND has at least one session completed (or started), force paywall.
    if (!isPro && existingSessions && existingSessions.length > 0) {
        navigate('paywall');
        return;
    }

    setLoading(true);
    const res = await api.edge.startSession(caseId, persona);
    setSession(res.session);
    setMessages([res.initial_message]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    
    // Optimistic UI
    const tempMsg = { id: 'temp', role: 'user', content: userMsg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);

    setLoading(true);
    try {
      const res = await api.edge.simulateTurn(session.id, userMsg);
      setMessages(prev => [...prev.filter(m => m.id !== 'temp'), { ...tempMsg, id: 'real' }, res.ai_message]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const endSession = async () => {
    if (!session) return;
    
    // Pick a random tip before showing the overlay
    setCurrentTip(EXPERT_TIPS[Math.floor(Math.random() * EXPERT_TIPS.length)]);
    setIsFinishing(true);
    setLoading(true);

    try {
      // 1. Generate final farewell from AI
      const res = await api.edge.simulateTurn(session.id, "[SISTEMA: El usuario ha terminado la reunión. Despídete brevemente manteniendo tu personaje. No hagas más preguntas.]");
      
      setMessages(prev => [...prev, res.ai_message]);
      
      // 2. Generate Score
      await api.edge.scoreSession(session.id); 
      
      // 3. Invalidate data
      queryClient.invalidateQueries({ queryKey: ['sessions', caseId] });
      queryClient.invalidateQueries({ queryKey: ['score', session.id] });

      // 4. Delay to show the "Analyzing" overlay
      setTimeout(() => {
        onSimulationComplete();
      }, 4000); // 4 seconds to read the tip

    } catch (error) {
      console.error("Error ending session", error);
      setIsFinishing(false);
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-white">Elige a tu oponente</h3>
        <PersonaCard 
          title="Jefe Pragmático" 
          desc="Centrado en costes, rápido, directo." 
          onClick={() => startSession('boss_pragmatic')} 
        />
        <PersonaCard 
          title="RRHH Frío" 
          desc="Políticas, bandas salariales, burocracia." 
          onClick={() => startSession('hr_cold')} 
        />
        <PersonaCard 
          title="Jefe Empático" 
          desc="Quiere ayudarte pero tiene manos atadas." 
          onClick={() => startSession('boss_empathic')} 
        />
        <PersonaCard 
          title="Controller Financiero" 
          desc="Protege presupuesto. Exige ROI y números." 
          onClick={() => startSession('finance_controller')} 
        />
        <PersonaCard 
          title="Jefe de Planta (Ops)" 
          desc="Valora operativa pero teme romper equidad." 
          onClick={() => startSession('plant_manager_ops_senior')} 
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 px-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed backdrop-blur-sm ${
               m.role === 'user' 
                 ? 'bg-blue-600/90 text-white rounded-br-none shadow-lg shadow-blue-900/50' 
                 : 'bg-white/10 border border-white/10 text-gray-200 rounded-bl-none'
             }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && !isFinishing && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-gray-400 text-xs px-3 py-2 rounded-full animate-pulse border border-white/5">
              Escribiendo...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="mt-2 bg-slate-900 border-t border-white/10 pt-2">
        <div className="flex gap-2 mb-2">
            <input 
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 text-sm text-white outline-none py-3 placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/50 transition-all"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe tu respuesta..."
            disabled={isFinishing || loading}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button 
                onClick={sendMessage} 
                disabled={isFinishing || loading}
                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:bg-gray-800 disabled:text-gray-500 transition-colors shadow-lg shadow-blue-900/50"
            >
            <ArrowRight size={18} />
            </button>
        </div>
        
        <button 
            onClick={endSession} 
            disabled={isFinishing || loading}
            className="w-full text-xs text-center text-red-400 font-medium py-2 hover:bg-red-500/10 rounded-lg transition-colors"
        >
            {isFinishing ? "Finalizando..." : "Terminar y Evaluar"}
        </button>
      </div>

      {/* Analysis Overlay */}
      {isFinishing && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 animate-bounce border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Award size={32} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Analizando Negociación</h2>
          <p className="text-gray-400 mb-8">La IA está evaluando tu inteligencia emocional, anclaje y manejo de objeciones.</p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl max-w-xs mx-auto transform rotate-1 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2 text-yellow-400 font-bold text-sm uppercase tracking-wide">
              <Lightbulb size={16} />
              <span>Tip de Experto</span>
            </div>
            <p className="text-sm text-gray-300 italic">
              "{currentTip}"
            </p>
          </div>
          
          <div className="mt-8 flex gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping delay-75" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping delay-150" />
          </div>
        </div>
      )}
    </div>
  );
};

const PersonaCard = ({ title, desc, onClick }: any) => (
  <div onClick={onClick} className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-lg active:scale-95 transition-all flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-blue-500/30">
    <div>
      <p className="font-bold text-gray-200">{title}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
    <div className="text-2xl bg-white/5 p-2 rounded-full">👤</div>
  </div>
);

const ScoreTab = ({ caseId, isPro }: any) => {
  const { navigate } = useApp();
  const queryClient = useQueryClient();

  // 1. Get all sessions for this case to find the latest one
  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', caseId],
    queryFn: () => api.sessions.getByCaseId(caseId)
  });

  const lastSession = sessions && sessions.length > 0 ? sessions[sessions.length - 1] : null;

  // 2. If we have a session, check if it already has a score
  const { data: score, isLoading: loadingScore } = useQuery({
    queryKey: ['score', lastSession?.id],
    queryFn: () => api.scores.get(lastSession!.id),
    enabled: !!lastSession
  });

  // 3. Mutation to generate score if it doesn't exist
  const generateScore = useMutation({
    mutationFn: (sessionId: string) => api.edge.scoreSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['score', lastSession?.id] });
    }
  });

  const handleReveal = () => {
    if (!isPro) {
      navigate('paywall');
      return;
    }
    if (lastSession) {
        generateScore.mutate(lastSession.id);
    }
  };

  if (loadingSessions || loadingScore || generateScore.isPending) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div className="animate-spin text-blue-500 mb-4">⏳</div>
            <p className="text-gray-500">Recuperando análisis...</p>
        </div>
      );
  }

  if (!lastSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-white/5 p-6 rounded-full mb-4 border border-white/5">
            <MessageSquare size={32} className="text-gray-500" />
        </div>
        <h3 className="font-bold text-white mb-2">Sin simulaciones previas</h3>
        <p className="text-sm text-gray-400 mb-6">Realiza una simulación en la pestaña "Simular" para obtener tu puntuación.</p>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-yellow-500/10 p-6 rounded-full mb-4 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Lock size={32} className="text-yellow-500" />
        </div>
        <h3 className="font-bold text-white mb-2">Informe de Rendimiento</h3>
        <p className="text-sm text-gray-400 mb-6">Analiza tu última sesión para obtener puntuación, errores y feedback.</p>
        <Button onClick={handleReveal} variant={isPro ? 'primary' : 'secondary'}>
          {isPro ? "Generar Informe" : "Desbloquear con Pack PRO"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-center py-6">
        <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-[6px] border-blue-500 bg-slate-900 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
          <div className="text-center">
            <span className="block text-4xl font-bold text-white">{score.total_score}</span>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Puntos</span>
          </div>
        </div>
      </div>
      
      <Section title="Top Errores">
        {score.top_3_mistakes.map((m, i) => (
          <div key={i} className="flex gap-3 text-sm text-gray-300 mb-3 bg-red-900/10 p-2 rounded-lg border border-red-500/10">
            <span className="text-red-400 font-bold mt-0.5">✕</span> 
            <span>{m}</span>
          </div>
        ))}
      </Section>

      <Section title="Mejoras Accionables">
        {score.top_3_improvements.map((imp, i) => (
          <div key={i} className="mb-3 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide">{imp.concept}</p>
            </div>
            <p className="text-sm text-gray-300 italic leading-relaxed">"{imp.example_phrase}"</p>
          </div>
        ))}
      </Section>
    </div>
  );
};
