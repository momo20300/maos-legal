export type AgentLanguage = 'fr'|'ar'|'en'|'es'|'de'|'it'|'pl'|'no'|'ar-gulf';

export interface AgentConfig {
  agentId: string;
  llmId: string;
  language: AgentLanguage;
  retellLangCode: string;
  label: string;
  flag: string;
  markets: string[];
  voiceGender: 'female'|'male';
}

export const MAOS_LEGAL_AGENTS: Record<AgentLanguage, AgentConfig> = {
  fr: {
    agentId: 'agent_6eddf4f9cdcf80f7f2ba8d32e6',
    llmId: 'llm_b32d0f2621269a5a7f3aa1223436',
    language: 'fr',
    retellLangCode: 'fr-FR',
    label: 'Francais',
    flag: 'FR',
    markets: ['Maroc','France','Belgique','Suisse','Afrique francophone'],
    voiceGender: 'male',
  },
  ar: {
    agentId: 'agent_6e28c85d0fc67cdda9e45cf177',
    llmId: 'llm_22a38fd8bcafcd8a214bcdc6e7ee',
    language: 'ar',
    retellLangCode: 'ar-SA',
    label: 'Arabe',
    flag: 'MA',
    markets: ['Maroc','Maghreb','MRE'],
    voiceGender: 'female',
  },
  en: {
    agentId: 'agent_c0e6596ce8b86c73f6de9de2bf',
    llmId: 'llm_158fad67efae565c4fab8d0482d3',
    language: 'en',
    retellLangCode: 'en-US',
    label: 'English',
    flag: 'GB',
    markets: ['UK','USA','Ireland','Gulf EN','International'],
    voiceGender: 'female',
  },
  es: {
    agentId: 'agent_d99b36478e31b828c39f18c749',
    llmId: 'llm_bb6075fa3bed5dd26b2f4d4145a1',
    language: 'es',
    retellLangCode: 'es-ES',
    label: 'Espanol',
    flag: 'ES',
    markets: ['Espagne','Amerique latine','Maroc hispanophone'],
    voiceGender: 'female',
  },
  de: {
    agentId: 'agent_e0d286daa6a8ff7f16191de92b',
    llmId: 'llm_9b077eb7093c7095ba27d77079ed',
    language: 'de',
    retellLangCode: 'de-DE',
    label: 'Deutsch',
    flag: 'DE',
    markets: ['Allemagne','Autriche','Suisse'],
    voiceGender: 'female',
  },
  it: {
    agentId: 'agent_1796de948ad3da50bed52bf93c',
    llmId: 'llm_d502bd45a9ef071b8b5526ee4a05',
    language: 'it',
    retellLangCode: 'it-IT',
    label: 'Italiano',
    flag: 'IT',
    markets: ['Italie'],
    voiceGender: 'female',
  },
  pl: {
    agentId: 'agent_fde2b1e82a5974895985242393',
    llmId: 'llm_2711c34e1511b8e4072b9860d27f',
    language: 'pl',
    retellLangCode: 'pl-PL',
    label: 'Polski',
    flag: 'PL',
    markets: ['Pologne','Diaspora EU'],
    voiceGender: 'female',
  },
  no: {
    agentId: 'agent_926732247eca06cea45803c082',
    llmId: 'llm_e96aa728375327de282d39dc83b5',
    language: 'no',
    retellLangCode: 'no-NO',
    label: 'Norsk',
    flag: 'NO',
    markets: ['Norvege','Scandinavie'],
    voiceGender: 'female',
  },
  'ar-gulf': {
    agentId: 'agent_6872b9213d63bb7f8cc2601b15',
    llmId: 'llm_db44307fd68b63621c30b191a79a',
    language: 'ar-gulf',
    retellLangCode: 'ar-SA',
    label: 'Gulf',
    flag: 'AE',
    markets: ['UAE','Arabie Saoudite','Qatar','Koweit','Bahrein','Oman'],
    voiceGender: 'female',
  },
};

export function getAgentByLanguage(lang: string): AgentConfig {
  return MAOS_LEGAL_AGENTS[lang as AgentLanguage] ?? MAOS_LEGAL_AGENTS.fr;
}
