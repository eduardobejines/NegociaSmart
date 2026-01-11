
export interface UserProfile {
  id: string;
  email: string;
  is_pro: boolean;
  cases_count: number;
}

export interface Case {
  id: string;
  user_id: string;
  title: string;
  current_role: string;
  current_salary: number;
  target_salary: number;
  currency_code: string;
  achievements: string;
  negotiation_date: string;
  ai_plan_json?: NegotiationPlan;
  created_at: string;
}

export interface NegotiationPlan {
  anchor_amount: number;
  target_range: string;
  opening_argument: string;
  evidence_bullets: string[];
  anticipated_objections: { objection: string; response: string }[];
  concessions_strategy: string;
  batna: string;
  closing_statement: string;
}

export interface Session {
  id: string;
  case_id: string;
  persona_type: 'boss_pragmatic' | 'hr_cold' | 'boss_empathic' | 'finance_controller' | 'plant_manager_ops_senior';
  difficulty_level: string;
  turn_count: number;
  is_completed: boolean;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Score {
  total_score: number;
  criteria_breakdown: Record<string, number>;
  top_3_mistakes: string[];
  top_3_improvements: { concept: string; example_phrase: string }[];
  recommended_phrases_future: string[];
}

export interface TemplateResponse {
  subject: string;
  body: string;
}
