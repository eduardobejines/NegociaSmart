
import { GoogleGenAI, Type } from "@google/genai";
import { Case, NegotiationPlan, Session, Message, Score, UserProfile, TemplateResponse } from '../utils/types';

// --- CONFIG ---
const API_KEY = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- MOCK DB ---
const DB = {
  // Initial demo user
  user: { id: 'user_123', email: 'demo@negociasmart.com', is_pro: false, cases_count: 0 } as UserProfile,
  cases: [] as Case[],
  sessions: [] as Session[],
  messages: [] as Message[],
  scores: {} as Record<string, Score>,
};

// --- FALLBACK DATA (Graceful Degradation) ---
const FALLBACK_PLAN: NegotiationPlan = {
  anchor_amount: 1950,
  target_range: "1850 - 1950",
  opening_argument: "En los últimos 6 meses, he garantizado 0 incidentes y optimizado los arranques un 15%.",
  evidence_bullets: ["Reducción de tiempos 15%", "Protocolo LOTO", "Formación nuevos operadores"],
  anticipated_objections: [
    { objection: "Fuera de ciclo", response: "Entiendo, pero el ahorro generado justifica la excepción." },
    { objection: "Sin presupuesto", response: "El ajuste se cubre con la reducción de costes lograda." }
  ],
  concessions_strategy: "Aceptar bonus por productividad si no hay subida fija.",
  batna: "Buscar oportunidades con certificación actual.",
  closing_statement: "¿Podemos formalizar esto para el próximo mes?"
};

// --- SCHEMAS ---
const planSchema = {
  type: Type.OBJECT,
  properties: {
    anchor_amount: { type: Type.NUMBER },
    target_range: { type: Type.STRING },
    opening_argument: { type: Type.STRING },
    evidence_bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
    anticipated_objections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { objection: { type: Type.STRING }, response: { type: Type.STRING } }
      }
    },
    concessions_strategy: { type: Type.STRING },
    batna: { type: Type.STRING },
    closing_statement: { type: Type.STRING }
  }
};

const scoreSchema = {
  type: Type.OBJECT,
  properties: {
    total_score: { type: Type.NUMBER },
    criteria_breakdown: {
      type: Type.OBJECT,
      properties: {
        anchoring: { type: Type.NUMBER },
        clarity: { type: Type.NUMBER },
        value_evidence: { type: Type.NUMBER },
        questions: { type: Type.NUMBER },
        objections: { type: Type.NUMBER },
        concessions: { type: Type.NUMBER },
        emotional_control: { type: Type.NUMBER },
        silence: { type: Type.NUMBER },
        closing: { type: Type.NUMBER }
      }
    },
    top_3_mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
    top_3_improvements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { concept: { type: Type.STRING }, example_phrase: { type: Type.STRING } }
      }
    },
    recommended_phrases_future: { type: Type.ARRAY, items: { type: Type.STRING } }
  }
};

const templateSchema = {
  type: Type.OBJECT,
  properties: {
    subject: { type: Type.STRING },
    body: { type: Type.STRING }
  }
};

// --- HELPER FUNCTIONS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getHistoryContext = (sessionId: string) => {
  return DB.messages
    .filter(m => m.session_id === sessionId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');
};

// --- API FUNCTIONS ---

export const api = {
  auth: {
    login: async (email: string, password: string) => { 
        await delay(500); 
        // Mock simple login - accept anything non-empty
        if(!email || !password) throw new Error("Credenciales inválidas");
        DB.user.email = email;
        return DB.user; 
    },
    register: async (email: string, password: string) => {
        await delay(800);
        if(!email || !password) throw new Error("Datos incompletos");
        // Reset DB for new user simulation
        DB.user = { 
            id: 'user_' + Math.random().toString(36).substr(2,9), 
            email: email, 
            is_pro: false, 
            cases_count: 0 
        };
        DB.cases = [];
        DB.sessions = [];
        return DB.user;
    },
    getUser: async () => DB.user,
  },

  cases: {
    list: async () => { await delay(300); return DB.cases; },
    create: async (data: Omit<Case, 'id' | 'user_id' | 'created_at'>) => {
      await delay(800);
      if (!DB.user.is_pro && DB.cases.length >= 1) throw new Error("LIMIT_REACHED");
      const newCase: Case = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: DB.user.id,
        created_at: new Date().toISOString(),
        ...data,
      };
      DB.cases.push(newCase);
      DB.user.cases_count++;
      return newCase;
    },
    getById: async (id: string) => { await delay(200); return DB.cases.find(c => c.id === id); },
  },

  sessions: {
    getByCaseId: async (caseId: string) => {
        await delay(200);
        return DB.sessions.filter(s => s.case_id === caseId);
    }
  },

  scores: {
      get: async (sessionId: string) => {
          await delay(200);
          return DB.scores[sessionId] || null;
      }
  },

  edge: {
    generatePlan: async (caseId: string) => {
      const c = DB.cases.find(c => c.id === caseId);
      if (!c) throw new Error("Case not found");

      try {
        if (!API_KEY) throw new Error("No Key");
        const prompt = `
          Genera un plan de negociación salarial en JSON.
          Rol: ${c.current_role}. Salario actual: ${c.current_salary}. Objetivo: ${c.target_salary}.
          Logros: ${c.achievements}.
          Moneda: ${c.currency_code}.
          El tono debe ser profesional y estratégico para el sector industrial.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: planSchema,
          }
        });
        
        const plan = JSON.parse(response.text!) as NegotiationPlan;
        c.ai_plan_json = plan;
        return plan;
      } catch (e) {
        console.warn("AI Fallback (Plan)", e);
        await delay(1500);
        c.ai_plan_json = FALLBACK_PLAN;
        return FALLBACK_PLAN;
      }
    },

    startSession: async (caseId: string, persona: string) => {
      await delay(600);
      const newSession: Session = {
        id: Math.random().toString(36).substr(2, 9),
        case_id: caseId,
        persona_type: persona as any,
        difficulty_level: 'hard',
        turn_count: 0,
        is_completed: false
      };
      DB.sessions.push(newSession);
      
      // Dynamic initial message based on persona
      let initialText = "Hola. Pasa.";
      if (persona === 'boss_pragmatic') initialText = "Tienes 5 minutos. ¿Qué es tan urgente?";
      if (persona === 'hr_cold') initialText = "Hola. Si es sobre la revisión salarial, recuerda que el ciclo está cerrado. Te escucho.";
      if (persona === 'boss_empathic') initialText = "Hola, ¿cómo estás? Me imagino por qué vienes. Cuéntame.";
      if (persona === 'finance_controller') initialText = "He visto tu solicitud. Vamos directos al grano: los números no cuadran con el presupuesto actual. ¿Por qué deberíamos hacer una excepción?";
      if (persona === 'plant_manager_ops_senior') initialText = "Pasa. Mira, valoro tu trabajo en planta, pero RRHH me tiene atado con las bandas. ¿Qué propones que sea justo para todos?";

      const initialMsg: Message = {
        id: Math.random().toString(),
        session_id: newSession.id,
        role: 'assistant',
        content: initialText,
        created_at: new Date().toISOString()
      };
      DB.messages.push(initialMsg);
      
      return { session: newSession, initial_message: initialMsg };
    },

    simulateTurn: async (sessionId: string, userMessage: string) => {
      const session = DB.sessions.find(s => s.id === sessionId);
      if (!session) throw new Error("Session not found");
      const c = DB.cases.find(ca => ca.id === session.case_id);

      // Save user message
      DB.messages.push({
        id: Math.random().toString(),
        session_id: sessionId,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      });

      try {
        if (!API_KEY) throw new Error("No Key");

        const history = getHistoryContext(sessionId);
        
        const personaSystemPrompts = {
          boss_pragmatic: `
            Perfil: Jefe pragmático industrial. Te importan los costes, el presupuesto y los precedentes.
            Estilo: Seco, directo, escéptico.
            Objeciones: 'no hay presupuesto', 'estamos fuera de ciclo', 'demuéstrame el ROI'.
            Concesiones: Pequeños ajustes si hay evidencia clara de ahorro.
          `,
          hr_cold: `
            Perfil: RRHH frío y burocrático.
            Estilo: Formal, distante, escudo en las normas.
            Objeciones: 'bandas salariales', 'política de empresa', 'equidad interna'.
            Concesiones: Ninguna monetaria directa fuera de ciclo. Quizás formación.
          `,
          boss_empathic: `
            Perfil: Jefe empático pero sin poder.
            Estilo: Amable, escucha activa, apologético ('manos atadas').
            Objeciones: 'me encantaría pero dirección no aprueba', 'no es el momento'.
            Concesiones: Días libres, flexibilidad, promesas a futuro.
          `,
          finance_controller: `
            Perfil: Finanzas/Controller.
            Objetivo: Proteger el presupuesto y evitar precedentes peligrosos.
            Estilo: Analítico, sobrio, enfocado 100% en números. No le importan los sentimientos, solo el ROI.
            Objeciones (Escalera):
              1. "No está en presupuesto este año."
              2. "Si te lo doy a ti, se rompe la estructura de costes."
              3. "Tu impacto no justifica ese incremento fijo."
              4. "Estamos fuera de ciclo fiscal."
              5. "Solo puedo autorizar un bono variable puntual, nada consolidable."
            Red Flags: No prometas nada sin ver un Excel mental de retorno.
            Frases típicas: "¿Cuál es el retorno de esa inversión?", "Hablamos de variable, no de fijo."
          `,
          plant_manager_ops_senior: `
            Perfil: Jefe de Planta / Operaciones Senior.
            Objetivo: Retener talento clave para que la planta no pare, pero manteniendo la equidad interna con otros operarios.
            Estilo: Directo pero humano. Valora seguridad, LOTO, continuidad y formación.
            Objeciones (Escalera):
              1. "Necesito evidencia dura para pelearlo con RRHH."
              2. "No puedo romper la banda de tu categoría."
              3. "Si te subo a ti, tengo a 20 más en la puerta mañana."
              4. "Te ofrezco un plan de crecimiento a 6 meses."
              5. "Esto es lo máximo que puedo hacer por ahora."
            Concesiones: Plan con KPIs, revisión en 12 semanas, formación certificada.
            Frases típicas: "No me pares la línea", "Ayúdame a ayudarte con RRHH."
          `
        };

        const specificPersonaPrompt = personaSystemPrompts[session.persona_type as keyof typeof personaSystemPrompts];

        const systemInstruction = `
          ACTÚA COMO: ${specificPersonaPrompt}
          
          CONTEXTO:
          Estás negociando con un empleado (${c?.current_role}) en un entorno industrial/operaciones.
          Salario actual: ${c?.current_salary}. Objetivo del empleado: ${c?.target_salary}.
          Logros del empleado: "${c?.achievements}".
          
          REGLAS DE INTERACCIÓN:
          1. ERES LA CONTRAPARTE. NO eres un coach. NO des consejos. Simplemente negocia.
          2. Mantén el personaje estrictamente. Usa el tono definido (Finance=Analítico, Plant=Operativo).
          3. Responde al último mensaje del usuario basándote en el historial.
          4. TUS RESPUESTAS: Máximo 3 frases. Conversacionales. Idioma: Español neutro/España.
          5. OBSTÁCULOS: Pon una objeción realista del sector industrial o haz una pregunta de descubrimiento en cada turno.
          6. NO aceptes la primera oferta. Haz sudar al usuario. Solo cede si el argumento es muy sólido y acorde a tu perfil.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text: `HISTORIAL DE LA CONVERSACIÓN:\n${history}\n\nTU TURNO (Responde como el personaje):` }] }],
          config: { systemInstruction }
        });

        const aiResponseText = response.text || "...";
        
        const aiMsg: Message = {
          id: Math.random().toString(),
          session_id: sessionId,
          role: 'assistant',
          content: aiResponseText,
          created_at: new Date().toISOString()
        };
        DB.messages.push(aiMsg);
        session.turn_count++;
        
        return { ai_message: aiMsg, turn_count: session.turn_count };

      } catch (e) {
        console.warn("AI Fallback (Chat)", e);
        await delay(1000);
        
        // Simple fallback logic if AI fails
        const fallbackResponses = [
          "Entiendo tu punto, pero el presupuesto está cerrado este año.",
          "Es una cifra alta comparada con la media del equipo.",
          "Necesito que me justifiques mejor ese número con resultados tangibles.",
          "Déjame consultarlo con dirección, pero no prometo nada."
        ];
        const randomResp = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        const aiMsg: Message = {
          id: Math.random().toString(),
          session_id: sessionId,
          role: 'assistant',
          content: `(Modo Offline) ${randomResp}`,
          created_at: new Date().toISOString()
        };
        DB.messages.push(aiMsg);
        session.turn_count++;
        return { ai_message: aiMsg, turn_count: session.turn_count };
      }
    },

    scoreSession: async (sessionId: string) => {
      const session = DB.sessions.find(s => s.id === sessionId);
      if (session) session.is_completed = true;

      try {
        if (!API_KEY) throw new Error("No Key");
        const history = getHistoryContext(sessionId);
        
        // Ensure there is enough history to score
        if (history.length < 50) {
             throw new Error("Chat too short");
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `
            Evalúa esta negociación salarial basándote en la rúbrica (Anclaje, Claridad, Evidencia, Control Emocional). 
            Transcripción:\n${history}
            
            NOTA ADICIONAL DE EVALUACIÓN:
            Si el oponente era 'finance_controller', valora positivamente si el usuario usó datos numéricos y ROI.
            Si el oponente era 'plant_manager_ops_senior', valora positivamente si el usuario habló de compromiso a largo plazo y equidad.
          `,
          config: {
            responseMimeType: "application/json",
            responseSchema: scoreSchema,
          }
        });

        const score = JSON.parse(response.text!) as Score;
        DB.scores[sessionId] = score;
        return score;

      } catch (e) {
        console.warn("AI Fallback (Score)", e);
        await delay(1500);
        const fallbackScore: Score = {
          total_score: 65,
          criteria_breakdown: { anchoring: 2, clarity: 3, value_evidence: 3, questions: 2, objections: 2, concessions: 2, emotional_control: 4, silence: 1, closing: 2 },
          top_3_mistakes: ["Faltó anclar alto", "Cediste rápido", "No usaste silencios"],
          top_3_improvements: [{ concept: "Silencios", example_phrase: "..." }],
          recommended_phrases_future: ["¿Qué flexibilidad tenemos?"]
        };
        DB.scores[sessionId] = fallbackScore;
        return fallbackScore;
      }
    },

    generateTemplate: async (caseId: string, type: string) => {
      const limitReached = !DB.user.is_pro && (type !== 'meeting_request' && type !== 'closing');
      if (limitReached) throw new Error("LIMIT_REACHED");
      
      const c = DB.cases.find(ca => ca.id === caseId);

      try {
        if (!API_KEY) throw new Error("No Key");
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Genera un email corto y profesional para: ${type}. Rol: ${c?.current_role}. Objetivo: ${c?.target_salary}. Logros: ${c?.achievements}.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: templateSchema,
          }
        });

        return JSON.parse(response.text!) as TemplateResponse;

      } catch (e) {
        await delay(1000);
        return {
          subject: "Solicitud de reunión (Offline)",
          body: "Hola, me gustaría agendar una reunión para revisar mi salario..."
        };
      }
    }
  },

  stripe: {
    purchasePack: async () => {
      await delay(1000);
      DB.user.is_pro = true;
      return { success: true };
    }
  }
};
