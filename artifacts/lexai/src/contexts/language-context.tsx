import { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "ar" | "en";

export interface Translations {
  nav: {
    chat: string;
    pricing: string;
    newCase: string;
    signIn: string;
  };
  landing: {
    badge: string;
    headline1: string;
    headline2: string;
    subtitle: string;
    startConsultation: string;
    viewPlans: string;
    systemsOk: string;
    systemsDegraded: string;
    consultations: string;
    featuresTitle: string;
    featuresSubtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    feature4Title: string;
    feature4Desc: string;
    statsTitle: string;
    statsSubtitle: string;
    topDomainsTitle: string;
    queries: string;
    inquiries: string;
    pricingTitle: string;
    pricingSubtitle: string;
  };
  chat: {
    newConsultation: string;
    activeCases: string;
    noConsultations: string;
    consultationTitle: string;
    consultationSubtitle: string;
    caseTitle: string;
    casePlaceholder: string;
    jurisdiction: string;
    jurisdictionPlaceholder: string;
    legalDomain: string;
    domainPlaceholder: string;
    selectJurisdictionFirst: string;
    domainHint: string;
    beginConsultation: string;
    initializingExpert: string;
    caseTitleMinLength: string;
    jurisdictionRequired: string;
    domainRequired: string;
    youLabel: string;
    expertLabel: string;
    typeMessage: string;
    sendMessage: string;
    deleteConfirm: string;
  };
  jurisdictions: {
    EU: string;
    US: string;
    Arabic: string;
    Morocco: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    currentPlan: string;
    active: string;
    usageThisMonth: string;
    queriesLeft: string;
    unlimited: string;
    perMonth: string;
    getStarted: string;
    subscribe: string;
    recommended: string;
    questionsPerMonth: string;
    unlimitedQuestions: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      chat: "Chat",
      pricing: "Pricing",
      newCase: "New Case",
      signIn: "Sign In",
    },
    landing: {
      badge: "The Future of Legal Intelligence",
      headline1: "Uncompromising legal",
      headline2: "clarity, instantly.",
      subtitle: "Access a sophisticated panel of AI legal experts across Europe, the US, Arabic jurisdictions, and Moroccan law. Precise answers, authoritative citations, zero ambiguity.",
      startConsultation: "Start Consultation",
      viewPlans: "View Plans",
      systemsOk: "Systems Operational",
      systemsDegraded: "Systems Degraded",
      consultations: "Consultations",
      featuresTitle: "Engineered for Excellence",
      featuresSubtitle: "The precision of a senior partner, the speed of advanced AI.",
      feature1Title: "Multijurisdictional Intelligence",
      feature1Desc: "Deep expertise across EU, US, Arabic, and Moroccan legal systems with accurate statutory citations.",
      feature2Title: "Specialized Legal Domains",
      feature2Desc: "From Criminal Procedure to Intellectual Property, matched with specialized AI expert profiles.",
      feature3Title: "Authoritative Citations",
      feature3Desc: "Responses backed by specific article numbers, case law, and statutory references.",
      feature4Title: "MAOS Legal — Morocco",
      feature4Desc: "Dedicated AI expert on all Moroccan codes: DOC, Code Pénal, CPC, CPP, Moudawwana, and all court systems.",
      statsTitle: "Trusted across global jurisdictions.",
      statsSubtitle: "Our platform processes complex legal inquiries across diverse frameworks daily.",
      topDomainsTitle: "Top Domains Consulted",
      queries: "queries",
      inquiries: "of inquiries",
      pricingTitle: "Transparent Investment",
      pricingSubtitle: "Choose the tier that matches your legal intelligence needs.",
    },
    chat: {
      newConsultation: "New Consultation",
      activeCases: "Active Cases",
      noConsultations: "No active consultations.",
      consultationTitle: "New Consultation",
      consultationSubtitle: "Define the parameters of your legal inquiry to connect with the appropriate AI expert.",
      caseTitle: "Case Reference / Title",
      casePlaceholder: "e.g. GDPR Compliance Question",
      jurisdiction: "Jurisdiction",
      jurisdictionPlaceholder: "Select applicable law",
      legalDomain: "Legal Domain",
      domainPlaceholder: "Select specialization",
      selectJurisdictionFirst: "Select jurisdiction first",
      domainHint: "This determines which AI expert persona responds to your queries.",
      beginConsultation: "Begin Consultation",
      initializingExpert: "Initializing Expert...",
      caseTitleMinLength: "Case title must be at least 3 characters",
      jurisdictionRequired: "Please select a jurisdiction",
      domainRequired: "Please select a legal domain",
      youLabel: "You",
      expertLabel: "Legal Expert",
      typeMessage: "Type your legal question...",
      sendMessage: "Send",
      deleteConfirm: "Are you sure you want to delete this conversation?",
    },
    jurisdictions: {
      EU: "European Union (EU)",
      US: "United States (US)",
      Arabic: "Arabic Countries",
      Morocco: "Morocco — MAOS Legal",
    },
    pricing: {
      title: "Invest in Intelligence",
      subtitle: "Clear, transparent pricing for enterprise-grade legal AI.",
      currentPlan: "Current Plan",
      active: "ACTIVE",
      usageThisMonth: "Usage This Month",
      queriesLeft: "queries",
      unlimited: "Unlimited",
      perMonth: "/month",
      getStarted: "Get Started",
      subscribe: "Subscribe",
      recommended: "Recommended",
      questionsPerMonth: "questions / mo",
      unlimitedQuestions: "Unlimited questions",
    },
  },

  fr: {
    nav: {
      chat: "Consultation",
      pricing: "Tarifs",
      newCase: "Nouveau Dossier",
      signIn: "Connexion",
    },
    landing: {
      badge: "L'Avenir de l'Intelligence Juridique",
      headline1: "La clarté juridique",
      headline2: "sans compromis.",
      subtitle: "Accédez à un panel sophistiqué d'experts juridiques IA couvrant l'Europe, les États-Unis, les pays arabes et le droit marocain. Réponses précises, citations faisant autorité, zéro ambiguïté.",
      startConsultation: "Démarrer une Consultation",
      viewPlans: "Voir les Offres",
      systemsOk: "Systèmes Opérationnels",
      systemsDegraded: "Systèmes Dégradés",
      consultations: "Consultations",
      featuresTitle: "Conçu pour l'Excellence",
      featuresSubtitle: "La précision d'un associé senior, la rapidité de l'IA avancée.",
      feature1Title: "Intelligence Multi-Juridictionnelle",
      feature1Desc: "Expertise approfondie en droit européen, américain, arabe et marocain avec des citations législatives précises.",
      feature2Title: "Domaines Juridiques Spécialisés",
      feature2Desc: "Du droit pénal à la propriété intellectuelle, avec des profils d'experts IA spécialisés.",
      feature3Title: "Citations Faisant Autorité",
      feature3Desc: "Réponses appuyées sur des numéros d'articles spécifiques, la jurisprudence et les références législatives.",
      feature4Title: "MAOS Legal — Maroc",
      feature4Desc: "Expert IA dédié à tous les codes marocains : DOC, Code Pénal, CPC, CPP, Moudawwana et tous les tribunaux.",
      statsTitle: "Approuvé dans les juridictions mondiales.",
      statsSubtitle: "Notre plateforme traite quotidiennement des requêtes juridiques complexes.",
      topDomainsTitle: "Domaines les Plus Consultés",
      queries: "requêtes",
      inquiries: "des requêtes",
      pricingTitle: "Un Investissement Transparent",
      pricingSubtitle: "Choisissez l'offre adaptée à vos besoins en intelligence juridique.",
    },
    chat: {
      newConsultation: "Nouvelle Consultation",
      activeCases: "Dossiers Actifs",
      noConsultations: "Aucune consultation active.",
      consultationTitle: "Nouvelle Consultation",
      consultationSubtitle: "Définissez les paramètres de votre requête juridique pour être connecté à l'expert IA approprié.",
      caseTitle: "Référence / Titre du Dossier",
      casePlaceholder: "ex: Question sur le Code du Travail",
      jurisdiction: "Juridiction",
      jurisdictionPlaceholder: "Sélectionnez le droit applicable",
      legalDomain: "Domaine Juridique",
      domainPlaceholder: "Sélectionnez une spécialisation",
      selectJurisdictionFirst: "Sélectionnez d'abord la juridiction",
      domainHint: "Ceci détermine quel expert IA répondra à vos questions.",
      beginConsultation: "Démarrer la Consultation",
      initializingExpert: "Initialisation de l'Expert...",
      caseTitleMinLength: "Le titre doit comporter au moins 3 caractères",
      jurisdictionRequired: "Veuillez sélectionner une juridiction",
      domainRequired: "Veuillez sélectionner un domaine juridique",
      youLabel: "Vous",
      expertLabel: "Expert Juridique",
      typeMessage: "Posez votre question juridique...",
      sendMessage: "Envoyer",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette consultation ?",
    },
    jurisdictions: {
      EU: "Union Européenne (UE)",
      US: "États-Unis (US)",
      Arabic: "Pays Arabes",
      Morocco: "Maroc — MAOS Legal",
    },
    pricing: {
      title: "Investissez dans l'Intelligence",
      subtitle: "Une tarification claire et transparente pour une IA juridique de niveau entreprise.",
      currentPlan: "Offre Actuelle",
      active: "ACTIF",
      usageThisMonth: "Utilisation ce Mois",
      queriesLeft: "requêtes",
      unlimited: "Illimité",
      perMonth: "/mois",
      getStarted: "Commencer",
      subscribe: "S'abonner",
      recommended: "Recommandé",
      questionsPerMonth: "questions / mois",
      unlimitedQuestions: "Questions illimitées",
    },
  },

  ar: {
    nav: {
      chat: "استشارة",
      pricing: "الأسعار",
      newCase: "قضية جديدة",
      signIn: "تسجيل الدخول",
    },
    landing: {
      badge: "مستقبل الذكاء القانوني",
      headline1: "وضوح قانوني لا تنازل",
      headline2: "عنه، فوراً.",
      subtitle: "احصل على لجنة متطورة من خبراء القانون بالذكاء الاصطناعي في أوروبا والولايات المتحدة والدول العربية والقانون المغربي. إجابات دقيقة، مراجع موثوقة، لا غموض.",
      startConsultation: "بدء الاستشارة",
      viewPlans: "عرض الخطط",
      systemsOk: "الأنظمة تعمل",
      systemsDegraded: "الأنظمة متدهورة",
      consultations: "استشارة",
      featuresTitle: "مصمم للتميز",
      featuresSubtitle: "دقة شريك أول وسرعة الذكاء الاصطناعي المتقدم.",
      feature1Title: "ذكاء متعدد الولايات القضائية",
      feature1Desc: "خبرة عميقة في الأنظمة القانونية الأوروبية والأمريكية والعربية والمغربية مع استشهادات تشريعية دقيقة.",
      feature2Title: "مجالات قانونية متخصصة",
      feature2Desc: "من القانون الجنائي إلى الملكية الفكرية، مع ملفات تعريف خبراء الذكاء الاصطناعي المتخصصين.",
      feature3Title: "مراجع موثوقة",
      feature3Desc: "ردود مدعومة بأرقام مواد محددة وسوابق قضائية ومراجع تشريعية.",
      feature4Title: "MAOS Legal — المغرب",
      feature4Desc: "خبير ذكاء اصطناعي مخصص لجميع القوانين المغربية: ق.ل.ع، القانون الجنائي، قانون المسطرة المدنية والجنائية، مدونة الأسرة.",
      statsTitle: "موثوق به في الولايات القضائية العالمية.",
      statsSubtitle: "تعالج منصتنا استفسارات قانونية معقدة عبر أطر متنوعة يومياً.",
      topDomainsTitle: "المجالات الأكثر استشارة",
      queries: "استفسار",
      inquiries: "من الاستفسارات",
      pricingTitle: "استثمر في الذكاء",
      pricingSubtitle: "اختر المستوى المناسب لاحتياجاتك من الذكاء القانوني.",
    },
    chat: {
      newConsultation: "استشارة جديدة",
      activeCases: "القضايا النشطة",
      noConsultations: "لا توجد استشارات نشطة.",
      consultationTitle: "استشارة جديدة",
      consultationSubtitle: "حدد معايير استفسارك القانوني للتواصل مع الخبير المناسب.",
      caseTitle: "مرجع / عنوان القضية",
      casePlaceholder: "مثال: سؤال حول قانون الشغل",
      jurisdiction: "الولاية القضائية",
      jurisdictionPlaceholder: "اختر القانون المطبق",
      legalDomain: "المجال القانوني",
      domainPlaceholder: "اختر التخصص",
      selectJurisdictionFirst: "اختر الولاية القضائية أولاً",
      domainHint: "هذا يحدد شخصية الخبير الذكاء الاصطناعي الذي سيرد على استفساراتك.",
      beginConsultation: "بدء الاستشارة",
      initializingExpert: "تهيئة الخبير...",
      caseTitleMinLength: "يجب أن يكون العنوان 3 أحرف على الأقل",
      jurisdictionRequired: "الرجاء اختيار الولاية القضائية",
      domainRequired: "الرجاء اختيار المجال القانوني",
      youLabel: "أنت",
      expertLabel: "الخبير القانوني",
      typeMessage: "اطرح سؤالك القانوني...",
      sendMessage: "إرسال",
      deleteConfirm: "هل أنت متأكد من حذف هذه الاستشارة؟",
    },
    jurisdictions: {
      EU: "الاتحاد الأوروبي",
      US: "الولايات المتحدة",
      Arabic: "الدول العربية",
      Morocco: "المغرب — MAOS Legal",
    },
    pricing: {
      title: "استثمر في الذكاء",
      subtitle: "تسعير شفاف وواضح لذكاء اصطناعي قانوني على مستوى المؤسسات.",
      currentPlan: "الخطة الحالية",
      active: "نشط",
      usageThisMonth: "الاستخدام هذا الشهر",
      queriesLeft: "استفسار",
      unlimited: "غير محدود",
      perMonth: "/شهر",
      getStarted: "ابدأ الآن",
      subscribe: "اشترك",
      recommended: "موصى به",
      questionsPerMonth: "سؤال / شهر",
      unlimitedQuestions: "أسئلة غير محدودة",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("lexai-language");
    return (saved as Language) || "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lexai-language", lang);
  };

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
