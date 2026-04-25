import { createContext, useContext, useState, useEffect } from "react";

export type Language = "fr" | "ar" | "en" | "es" | "de" | "no" | "pl" | "it";

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
    signIn: string;
    payToStart: string;
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
    maosSubtitle: string;
    maosRevisionMode: string;
  };
  auth: {
    intelligenceJuridiquePremium: string;
    signInDisclaimer: string;
    signUpDisclaimer: string;
    signInTitle: string;
    signInSubtitle: string;
    signUpTitle: string;
    signUpSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    firstNameLabel: string;
    lastNameLabel: string;
    signInButton: string;
    signUpButton: string;
    homeButton: string;
    noAccount: string;
    alreadyAccount: string;
    signUpLink: string;
    signInLink: string;
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
    maosExpertTitle: string;
    maosExpertDesc: string;
    fileFormatError: string;
    fileSizeError: string;
    fileFormatDesc: string;
    fileSizeDesc: string;
    defaultAnalysisRequest: string;
    analyzeDocBadge: string;
    readyMaosTitle: string;
    readyDefaultTitle: string;
    maosReadyDesc: string;
    defaultReadyDesc: string;
    photosImages: string;
    pdfDocuments: string;
    takePhotoLabel: string;
    analyzingDoc: string;
    analyzingLegal: string;
    fileTypePdf: string;
    fileTypeImage: string;
    docQuestionPlaceholder: string;
    attachFileLabel: string;
    attachCameraLabel: string;
    fileHint: string;
    analyzeButton: string;
    submitButton: string;
    legalDisclaimer: string;
    lexaiPartnerLabel: string;
    emptyPhotoDesc: string;
    emptyImageDesc: string;
    emptyPdfDesc: string;
    examplePvAccident: string;
    exampleContrat: string;
    exampleBail: string;
    exampleMiseEnDemeure: string;
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
    premiumOnly: string;
    sslBadge: string;
    jurisdictionsBadge: string;
    citationsBadge: string;
    responseBadge: string;
    encryptionNote: string;
    activePlan: string;
    renewsOn: string;
    goToChat: string;
    currentPlanLabel: string;
    subscribeNow: string;
    getStartedNow: string;
    mostPopular: string;
    cardRequired: string;
    month: string;
  };
  plans: {
    professional: {
      name: string;
      features: string[];
    };
    expert: {
      name: string;
      features: string[];
    };
  };
  notFound: {
    title: string;
    description: string;
    goHome: string;
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
      subtitle: "Next-generation AI expert in Moroccan law, all branches.\nEuropean, American & Middle Eastern legal systems.\nExact article citations and authoritative case law.\nSenior-partner-level answers, delivered instantly.\nBar exam & legal profession preparation.",
      startConsultation: "Start Consultation",
      viewPlans: "View Plans",
      signIn: "Sign In",
      payToStart: "Pay to Get Started →",
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
      maosSubtitle: "Moroccan Legal Intelligence • Legal Encyclopedia 2026",
      maosRevisionMode: "Study Mode",
    },
    auth: {
      intelligenceJuridiquePremium: "Premium Legal Intelligence",
      signInDisclaimer: "By accessing MAOS Legal, you agree to our terms of use and privacy policy.",
      signUpDisclaimer: "Create your MAOS Legal account and choose your subscription to access premium legal intelligence.",
      signInTitle: "Welcome back!",
      signInSubtitle: "Sign in to your MAOS Legal account",
      signUpTitle: "Create an account",
      signUpSubtitle: "Join MAOS Legal",
      emailLabel: "Email",
      emailPlaceholder: "your@email.com",
      passwordLabel: "Password",
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      signInButton: "Sign in",
      signUpButton: "Create my account",
      homeButton: "Home",
      noAccount: "No account yet?",
      alreadyAccount: "Already have an account?",
      signUpLink: "Sign up",
      signInLink: "Sign in",
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
      maosExpertTitle: "🇲🇦 MAOS Legal — Moroccan Law Expert",
      maosExpertDesc: "DOC · Penal Code · Moudawwana · CPC · CPP · Commercial Law · Labor Law · Administrative Law · All Courts · Bar & Legal Professions Exam Prep",
      fileFormatError: "Unsupported format",
      fileSizeError: "File too large",
      fileFormatDesc: "Accepted formats: JPG, PNG, WebP, GIF, PDF",
      fileSizeDesc: "Maximum file size is 15 MB",
      defaultAnalysisRequest: "Legal analysis requested",
      analyzeDocBadge: "Document analysis enabled",
      readyMaosTitle: "🇲🇦 MAOS Legal — Ready",
      readyDefaultTitle: "Consultation Ready",
      maosReadyDesc: "Your MAOS Legal expert is ready. Ask your question or submit a document for analysis.",
      defaultReadyDesc: "Your legal intelligence expert is ready. Ask a question or upload a document for analysis.",
      photosImages: "Photos & images",
      pdfDocuments: "PDF documents",
      takePhotoLabel: "Take photo",
      analyzingDoc: "Analyzing document...",
      analyzingLegal: "Analyzing legal precedents...",
      fileTypePdf: "PDF document",
      fileTypeImage: "Image",
      docQuestionPlaceholder: "Ask your question about this document (optional)...",
      attachFileLabel: "Attach a document or image",
      attachCameraLabel: "Take a photo",
      fileHint: "JPG · PNG · PDF · 15 MB max",
      analyzeButton: "Analyze",
      submitButton: "Submit",
      legalDisclaimer: "Responses are AI-generated and do not constitute formal legal advice. Always verify citations and consult a qualified attorney.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "Take a photo of any document with your camera",
      emptyImageDesc: "Upload a photo, screenshot or scan",
      emptyPdfDesc: "Upload a PDF contract, judgment or form",
      examplePvAccident: "🚗 Accident report",
      exampleContrat: "📋 Contract",
      exampleBail: "🏠 Lease",
      exampleMiseEnDemeure: "⚠️ Notice letter",
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
      premiumOnly: "Premium Access Only",
      sslBadge: "256-bit SSL",
      jurisdictionsBadge: "4 Jurisdictions",
      citationsBadge: "Real Law Citations",
      responseBadge: "Instant Response",
      encryptionNote: "All subscriptions include enterprise-grade encryption. Prices are in USD.",
      activePlan: "Active Plan",
      renewsOn: "Renews on",
      goToChat: "Go to Chat",
      currentPlanLabel: "Current Plan",
      subscribeNow: "Subscribe Now",
      getStartedNow: "Get Started",
      mostPopular: "Most Popular",
      cardRequired: "Credit card required • No free trial",
      month: "month",
    },
    plans: {
      professional: {
        name: "Professional",
        features: [
          "100 legal consultations / month",
          "EU, US, Arabic & Moroccan law (MAOS Legal)",
          "Precise law article citations",
          "Case law & legislative references",
          "All legal domains",
          "Bar & legal professions exam preparation",
          "Priority responses",
        ],
      },
      expert: {
        name: "Expert",
        features: [
          "Unlimited consultations",
          "EU, US, Arabic & Moroccan law (MAOS Legal)",
          "In-depth legal research",
          "Full access to case law",
          "All legal domains",
          "Bar & legal professions exam preparation",
          "Dedicated AI expert panel",
          "Document analysis",
          "Custom jurisdiction profiles",
        ],
      },
    },
    notFound: {
      title: "404 — Page Not Found",
      description: "The page you are looking for does not exist.",
      goHome: "Return to Home",
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
      headline2: "sans compromis",
      subtitle: "Expert nouvelle génération en droit Marocain toutes branches.\nDroit Européen, Américain et Pays du Moyen-Orient.\nCitations exactes d'articles de loi et de jurisprudence.\nPréparation aux concours Avocat et métiers juridiques.",
      startConsultation: "Démarrer une Consultation",
      viewPlans: "Voir les Offres",
      signIn: "Se connecter",
      payToStart: "Payer pour commencer →",
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
      maosSubtitle: "Intelligence Juridique Marocaine • Encyclopédie du Droit 2026",
      maosRevisionMode: "Mode Révision",
    },
    auth: {
      intelligenceJuridiquePremium: "Intelligence Juridique Premium",
      signInDisclaimer: "En accédant à MAOS Legal, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.",
      signUpDisclaimer: "Créez votre compte MAOS Legal et choisissez votre abonnement pour accéder à l'intelligence juridique premium.",
      signInTitle: "Bon retour !",
      signInSubtitle: "Connectez-vous à votre espace MAOS Legal",
      signUpTitle: "Créer un compte",
      signUpSubtitle: "Rejoignez MAOS Legal",
      emailLabel: "Email",
      emailPlaceholder: "votre@email.com",
      passwordLabel: "Mot de passe",
      firstNameLabel: "Prénom",
      lastNameLabel: "Nom",
      signInButton: "Se connecter",
      signUpButton: "Créer mon compte",
      homeButton: "Accueil",
      noAccount: "Pas encore de compte ?",
      alreadyAccount: "Déjà un compte ?",
      signUpLink: "S'inscrire",
      signInLink: "Se connecter",
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
      maosExpertTitle: "🇲🇦 MAOS Legal — Expert Droit Marocain",
      maosExpertDesc: "DOC · Code Pénal · Moudawwana · CPC · CPP · Droit Commercial · Droit du Travail · Droit Administratif · Tous Tribunaux · Préparation Concours Avocat / Métiers juridiques",
      fileFormatError: "Format non supporté",
      fileSizeError: "Fichier trop volumineux",
      fileFormatDesc: "Formats acceptés : JPG, PNG, WebP, GIF, PDF",
      fileSizeDesc: "La taille maximum est 15 Mo",
      defaultAnalysisRequest: "Analyse juridique demandée",
      analyzeDocBadge: "Analyse de documents activée",
      readyMaosTitle: "🇲🇦 MAOS Legal — Prêt",
      readyDefaultTitle: "Consultation prête",
      maosReadyDesc: "Votre expert MAOS Legal est prêt. Posez votre question ou soumettez un document pour analyse.",
      defaultReadyDesc: "Votre expert en intelligence juridique est prêt. Posez une question ou téléchargez un document pour analyse.",
      photosImages: "Photos & images",
      pdfDocuments: "Documents PDF",
      takePhotoLabel: "Photo directe",
      analyzingDoc: "Analyse du document en cours...",
      analyzingLegal: "Analyse des précédents juridiques...",
      fileTypePdf: "Document PDF",
      fileTypeImage: "Image",
      docQuestionPlaceholder: "Posez votre question sur ce document (optionnel)...",
      attachFileLabel: "Joindre un document ou une image",
      attachCameraLabel: "Prendre une photo",
      fileHint: "JPG · PNG · PDF · 15 Mo max",
      analyzeButton: "Analyser",
      submitButton: "Soumettre",
      legalDisclaimer: "Les réponses sont générées par IA et ne constituent pas un conseil juridique formel. Vérifiez toujours les citations et consultez un avocat qualifié.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "Photographiez un document avec votre appareil photo",
      emptyImageDesc: "Importez une photo, capture d'écran ou scan",
      emptyPdfDesc: "Importez un contrat PDF, jugement ou formulaire",
      examplePvAccident: "🚗 PV d'accident",
      exampleContrat: "📋 Contrat",
      exampleBail: "🏠 Bail",
      exampleMiseEnDemeure: "⚠️ Mise en demeure",
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
      premiumOnly: "Accès Premium Uniquement",
      sslBadge: "SSL 256 bits",
      jurisdictionsBadge: "4 Juridictions",
      citationsBadge: "Citations Légales Réelles",
      responseBadge: "Réponse Instantanée",
      encryptionNote: "Tous les abonnements incluent un chiffrement de niveau entreprise. Prix en USD.",
      activePlan: "Abonnement Actif",
      renewsOn: "Renouvellement le",
      goToChat: "Accéder au Chat",
      currentPlanLabel: "Votre abonnement actuel",
      subscribeNow: "S'abonner maintenant",
      getStartedNow: "Commencer maintenant",
      mostPopular: "Le Plus Populaire",
      cardRequired: "Carte bancaire requise • Sans essai gratuit",
      month: "mois",
    },
    plans: {
      professional: {
        name: "Professionnel",
        features: [
          "100 consultations juridiques / mois",
          "Droit UE, US, Arabe et Marocain (MAOS Legal)",
          "Citations d'articles de loi précises",
          "Jurisprudence et références législatives",
          "Tous les domaines juridiques",
          "Préparation concours Avocat / Métiers juridiques",
          "Réponses prioritaires",
        ],
      },
      expert: {
        name: "Expert",
        features: [
          "Consultations illimitées",
          "Droit UE, US, Arabe et Marocain (MAOS Legal)",
          "Recherche juridique approfondie",
          "Accès complet à la jurisprudence",
          "Tous les domaines juridiques",
          "Préparation concours Avocat / Métiers juridiques",
          "Panel d'experts IA dédié",
          "Analyse de documents",
          "Profils de juridiction personnalisés",
        ],
      },
    },
    notFound: {
      title: "404 — Page introuvable",
      description: "La page que vous recherchez n'existe pas.",
      goHome: "Retour à l'accueil",
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
      headline2: "عنه، فوراً",
      subtitle: "خبير الجيل الجديد في القانون المغربي بجميع فروعه\nالقانون الأوروبي والأمريكي ودول الشرق الأوسط\nاستشهادات دقيقة بمواد القانون والسوابق القضائية\nالتحضير لمباراة المحاماة والمهن القانونية",
      startConsultation: "بدء الاستشارة",
      viewPlans: "عرض الخطط",
      signIn: "تسجيل الدخول",
      payToStart: "ادفع للبدء ←",
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
      maosSubtitle: "الذكاء القانوني المغربي • موسوعة القانون 2026",
      maosRevisionMode: "وضع المراجعة",
    },
    auth: {
      intelligenceJuridiquePremium: "الذكاء القانوني المتميز",
      signInDisclaimer: "بالوصول إلى MAOS Legal، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بنا.",
      signUpDisclaimer: "أنشئ حسابك في MAOS Legal واختر اشتراكك للوصول إلى الذكاء القانوني المتميز.",
      signInTitle: "مرحباً بعودتك!",
      signInSubtitle: "تسجيل الدخول إلى حسابك في MAOS Legal",
      signUpTitle: "إنشاء حساب",
      signUpSubtitle: "انضم إلى MAOS Legal",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "بريدك@الإلكتروني.com",
      passwordLabel: "كلمة المرور",
      firstNameLabel: "الاسم الأول",
      lastNameLabel: "اسم العائلة",
      signInButton: "تسجيل الدخول",
      signUpButton: "إنشاء حسابي",
      homeButton: "الرئيسية",
      noAccount: "ليس لديك حساب؟",
      alreadyAccount: "لديك حساب بالفعل؟",
      signUpLink: "إنشاء حساب",
      signInLink: "تسجيل الدخول",
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
      maosExpertTitle: "🇲🇦 MAOS Legal — خبير القانون المغربي",
      maosExpertDesc: "ق.ل.ع · القانون الجنائي · مدونة الأسرة · ق.م.م · ق.م.ج · القانون التجاري · قانون الشغل · القانون الإداري · جميع المحاكم · التحضير لمباراة المحاماة / النيابة",
      fileFormatError: "تنسيق غير مدعوم",
      fileSizeError: "الملف كبير جداً",
      fileFormatDesc: "الصيغ المقبولة: JPG، PNG، WebP، GIF، PDF",
      fileSizeDesc: "الحجم الأقصى هو 15 ميغابايت",
      defaultAnalysisRequest: "تحليل قانوني مطلوب",
      analyzeDocBadge: "تحليل المستندات مُفعَّل",
      readyMaosTitle: "🇲🇦 MAOS Legal — جاهز",
      readyDefaultTitle: "الاستشارة جاهزة",
      maosReadyDesc: "خبير MAOS Legal جاهز. اطرح سؤالك أو أرسل مستنداً للتحليل.",
      defaultReadyDesc: "خبيرك في الذكاء القانوني جاهز. اطرح سؤالاً أو أرسل مستنداً للتحليل.",
      photosImages: "صور وصور",
      pdfDocuments: "وثائق PDF",
      takePhotoLabel: "التقاط صورة",
      analyzingDoc: "جارٍ تحليل المستند...",
      analyzingLegal: "جارٍ البحث في السوابق القانونية...",
      fileTypePdf: "وثيقة PDF",
      fileTypeImage: "صورة",
      docQuestionPlaceholder: "اطرح سؤالك حول هذا المستند (اختياري)...",
      attachFileLabel: "إرفاق مستند أو صورة",
      attachCameraLabel: "التقاط صورة",
      fileHint: "JPG · PNG · PDF · 15 ميغابايت كحد أقصى",
      analyzeButton: "تحليل",
      submitButton: "إرسال",
      legalDisclaimer: "الردود مُولَّدة بالذكاء الاصطناعي ولا تُشكّل استشارة قانونية رسمية. تحقق دائماً من الاستشهادات واستشر محامياً مؤهلاً.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "التقط صورة لأي وثيقة بكاميرتك",
      emptyImageDesc: "حمّل صورة أو لقطة شاشة أو مسحاً ضوئياً",
      emptyPdfDesc: "حمّل عقداً أو حكماً أو نموذجاً بصيغة PDF",
      examplePvAccident: "🚗 محضر الحادث",
      exampleContrat: "📋 عقد",
      exampleBail: "🏠 عقد إيجار",
      exampleMiseEnDemeure: "⚠️ إنذار رسمي",
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
      premiumOnly: "وصول مدفوع فقط",
      sslBadge: "SSL 256 بت",
      jurisdictionsBadge: "4 ولايات قضائية",
      citationsBadge: "مراجع قانونية حقيقية",
      responseBadge: "استجابة فورية",
      encryptionNote: "تشمل جميع الاشتراكات تشفيراً على مستوى المؤسسات. الأسعار بالدولار الأمريكي.",
      activePlan: "الاشتراك النشط",
      renewsOn: "يتجدد في",
      goToChat: "الذهاب للاستشارة",
      currentPlanLabel: "اشتراكك الحالي",
      subscribeNow: "اشترك الآن",
      getStartedNow: "ابدأ الآن",
      mostPopular: "الأكثر شعبية",
      cardRequired: "بطاقة بنكية مطلوبة • بدون تجربة مجانية",
      month: "شهر",
    },
    plans: {
      professional: {
        name: "المهني",
        features: [
          "100 استشارة قانونية / شهر",
          "القانون الأوروبي والأمريكي والعربي والمغربي (MAOS Legal)",
          "استشهادات دقيقة بمواد القانون",
          "السوابق القضائية والمراجع التشريعية",
          "جميع المجالات القانونية",
          "التحضير لمباراة المحاماة / المهن القانونية",
          "ردود ذات أولوية",
        ],
      },
      expert: {
        name: "الخبير",
        features: [
          "استشارات غير محدودة",
          "القانون الأوروبي والأمريكي والعربي والمغربي (MAOS Legal)",
          "بحث قانوني متعمق",
          "الوصول الكامل للسوابق القضائية",
          "جميع المجالات القانونية",
          "التحضير لمباراة المحاماة / المهن القانونية",
          "لجنة خبراء ذكاء اصطناعي مخصصة",
          "تحليل المستندات",
          "ملفات ولاية قضائية مخصصة",
        ],
      },
    },
    notFound: {
      title: "404 — الصفحة غير موجودة",
      description: "الصفحة التي تبحث عنها غير موجودة.",
      goHome: "العودة إلى الرئيسية",
    },
  },

  es: {
    nav: { chat: "Consulta", pricing: "Precios", newCase: "Nuevo Caso", signIn: "Iniciar sesión" },
    landing: {
      badge: "El Futuro de la Inteligencia Jurídica",
      headline1: "Claridad jurídica",
      headline2: "sin compromisos.",
      subtitle: "Experto IA de nueva generación en derecho marroquí, todas las ramas.\nSistemas jurídicos europeo, americano y de Oriente Medio.\nCitas exactas de artículos y jurisprudencia autorizada.\nPreparación para el examen de abogacía y profesiones jurídicas.",
      startConsultation: "Iniciar Consulta",
      viewPlans: "Ver Planes",
      signIn: "Iniciar sesión",
      payToStart: "Pagar para Comenzar →",
      systemsOk: "Sistemas Operativos",
      systemsDegraded: "Sistemas Degradados",
      consultations: "Consultas",
      featuresTitle: "Diseñado para la Excelencia",
      featuresSubtitle: "La precisión de un socio sénior, la velocidad de la IA avanzada.",
      feature1Title: "Inteligencia Multijurisdiccional",
      feature1Desc: "Experiencia profunda en sistemas jurídicos de la UE, EE.UU., árabe y marroquí con citas legislativas precisas.",
      feature2Title: "Dominios Jurídicos Especializados",
      feature2Desc: "Del derecho penal a la propiedad intelectual, con perfiles de expertos IA especializados.",
      feature3Title: "Citas Autorizadas",
      feature3Desc: "Respuestas respaldadas por artículos específicos, jurisprudencia y referencias legislativas.",
      feature4Title: "MAOS Legal — Marruecos",
      feature4Desc: "Experto IA dedicado a todos los códigos marroquíes: DOC, Código Penal, CPC, CPP, Moudawwana y todos los tribunales.",
      statsTitle: "Confiado en jurisdicciones globales.",
      statsSubtitle: "Nuestra plataforma procesa consultas jurídicas complejas en marcos diversos diariamente.",
      topDomainsTitle: "Dominios Más Consultados",
      queries: "consultas",
      inquiries: "de consultas",
      pricingTitle: "Inversión en Inteligencia",
      pricingSubtitle: "Elige el nivel que corresponde a tus necesidades de inteligencia jurídica.",
      maosSubtitle: "Inteligencia Jurídica Marroquí • Enciclopedia del Derecho 2026",
      maosRevisionMode: "Modo Estudio",
    },
    auth: {
      intelligenceJuridiquePremium: "Inteligencia Jurídica Premium",
      signInDisclaimer: "Al acceder a MAOS Legal, aceptas nuestras condiciones de uso y política de privacidad.",
      signUpDisclaimer: "Crea tu cuenta MAOS Legal y elige tu suscripción para acceder a la inteligencia jurídica premium.",
      signInTitle: "¡Bienvenido de nuevo!",
      signInSubtitle: "Inicia sesión en tu cuenta MAOS Legal",
      signUpTitle: "Crear una cuenta",
      signUpSubtitle: "Únete a MAOS Legal",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@correo.com",
      passwordLabel: "Contraseña",
      firstNameLabel: "Nombre",
      lastNameLabel: "Apellido",
      signInButton: "Iniciar sesión",
      signUpButton: "Crear mi cuenta",
      homeButton: "Inicio",
      noAccount: "¿Aún no tienes cuenta?",
      alreadyAccount: "¿Ya tienes cuenta?",
      signUpLink: "Registrarse",
      signInLink: "Iniciar sesión",
    },
    chat: {
      newConsultation: "Nueva Consulta",
      activeCases: "Casos Activos",
      noConsultations: "Sin consultas activas.",
      consultationTitle: "Nueva Consulta",
      consultationSubtitle: "Define los parámetros de tu consulta jurídica para conectar con el experto IA adecuado.",
      caseTitle: "Referencia / Título del Caso",
      casePlaceholder: "ej. Pregunta sobre el Código Laboral",
      jurisdiction: "Jurisdicción",
      jurisdictionPlaceholder: "Selecciona el derecho aplicable",
      legalDomain: "Dominio Jurídico",
      domainPlaceholder: "Selecciona una especialización",
      selectJurisdictionFirst: "Selecciona primero la jurisdicción",
      domainHint: "Esto determina qué experto IA responderá a tus consultas.",
      beginConsultation: "Iniciar Consulta",
      initializingExpert: "Inicializando Experto...",
      caseTitleMinLength: "El título debe tener al menos 3 caracteres",
      jurisdictionRequired: "Por favor selecciona una jurisdicción",
      domainRequired: "Por favor selecciona un dominio jurídico",
      youLabel: "Tú",
      expertLabel: "Experto Jurídico",
      typeMessage: "Escribe tu pregunta jurídica...",
      sendMessage: "Enviar",
      deleteConfirm: "¿Estás seguro de que quieres eliminar esta consulta?",
      maosExpertTitle: "🇲🇦 MAOS Legal — Experto en Derecho Marroquí",
      maosExpertDesc: "DOC · Código Penal · Moudawwana · CPC · CPP · Derecho Mercantil · Derecho Laboral · Derecho Administrativo · Todos los Tribunales · Preparación Examen Abogacía",
      fileFormatError: "Formato no soportado",
      fileSizeError: "Archivo demasiado grande",
      fileFormatDesc: "Formatos aceptados: JPG, PNG, WebP, GIF, PDF",
      fileSizeDesc: "El tamaño máximo es 15 MB",
      defaultAnalysisRequest: "Análisis jurídico solicitado",
      analyzeDocBadge: "Análisis de documentos activado",
      readyMaosTitle: "🇲🇦 MAOS Legal — Listo",
      readyDefaultTitle: "Consulta Lista",
      maosReadyDesc: "Tu experto MAOS Legal está listo. Haz tu pregunta o envía un documento para análisis.",
      defaultReadyDesc: "Tu experto en inteligencia jurídica está listo. Haz una pregunta o sube un documento.",
      photosImages: "Fotos e imágenes",
      pdfDocuments: "Documentos PDF",
      takePhotoLabel: "Tomar foto",
      analyzingDoc: "Analizando documento...",
      analyzingLegal: "Analizando precedentes jurídicos...",
      fileTypePdf: "Documento PDF",
      fileTypeImage: "Imagen",
      docQuestionPlaceholder: "Haz tu pregunta sobre este documento (opcional)...",
      attachFileLabel: "Adjuntar documento o imagen",
      attachCameraLabel: "Tomar una foto",
      fileHint: "JPG · PNG · PDF · 15 MB máx",
      analyzeButton: "Analizar",
      submitButton: "Enviar",
      legalDisclaimer: "Las respuestas son generadas por IA y no constituyen asesoramiento jurídico formal. Verifica siempre las citas y consulta a un abogado cualificado.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "Fotografía cualquier documento con tu cámara",
      emptyImageDesc: "Sube una foto, captura de pantalla o escaneo",
      emptyPdfDesc: "Sube un contrato PDF, sentencia o formulario",
      examplePvAccident: "🚗 Acta de accidente",
      exampleContrat: "📋 Contrato",
      exampleBail: "🏠 Arrendamiento",
      exampleMiseEnDemeure: "⚠️ Requerimiento",
    },
    jurisdictions: { EU: "Unión Europea (UE)", US: "Estados Unidos (EE.UU.)", Arabic: "Países Árabes", Morocco: "Marruecos — MAOS Legal" },
    pricing: {
      title: "Invierte en Inteligencia",
      subtitle: "Precios claros y transparentes para IA jurídica de nivel empresarial.",
      currentPlan: "Plan Actual", active: "ACTIVO", usageThisMonth: "Uso Este Mes", queriesLeft: "consultas",
      unlimited: "Ilimitado", perMonth: "/mes", getStarted: "Comenzar", subscribe: "Suscribirse",
      recommended: "Recomendado", questionsPerMonth: "preguntas / mes", unlimitedQuestions: "Preguntas ilimitadas",
      premiumOnly: "Solo Acceso Premium", sslBadge: "SSL 256 bits", jurisdictionsBadge: "4 Jurisdicciones",
      citationsBadge: "Citas Legales Reales", responseBadge: "Respuesta Instantánea",
      encryptionNote: "Todas las suscripciones incluyen cifrado de nivel empresarial. Precios en USD.",
      activePlan: "Plan Activo", renewsOn: "Renovación el", goToChat: "Ir al Chat",
      currentPlanLabel: "Tu plan actual", subscribeNow: "Suscribirse ahora", getStartedNow: "Comenzar ahora",
      mostPopular: "Más Popular", cardRequired: "Tarjeta bancaria requerida • Sin prueba gratuita", month: "mes",
    },
    plans: {
      professional: { name: "Profesional", features: ["100 consultas jurídicas / mes", "Derecho UE, EE.UU., Árabe y Marroquí (MAOS Legal)", "Citas precisas de artículos de ley", "Jurisprudencia y referencias legislativas", "Todos los dominios jurídicos", "Preparación examen abogacía / profesiones jurídicas", "Respuestas prioritarias"] },
      expert: { name: "Experto", features: ["Consultas ilimitadas", "Derecho UE, EE.UU., Árabe y Marroquí (MAOS Legal)", "Investigación jurídica en profundidad", "Acceso completo a jurisprudencia", "Todos los dominios jurídicos", "Preparación examen abogacía / profesiones jurídicas", "Panel de expertos IA dedicado", "Análisis de documentos", "Perfiles de jurisdicción personalizados"] },
    },
    notFound: { title: "404 — Página no encontrada", description: "La página que buscas no existe.", goHome: "Volver al inicio" },
  },

  de: {
    nav: { chat: "Beratung", pricing: "Preise", newCase: "Neuer Fall", signIn: "Anmelden" },
    landing: {
      badge: "Die Zukunft der Rechtsintelligenz",
      headline1: "Rechtliche Klarheit",
      headline2: "ohne Kompromisse.",
      subtitle: "KI-Experte der nächsten Generation im marokkanischen Recht, alle Bereiche.\nEuropäische, amerikanische und nahöstliche Rechtssysteme.\nGenaue Artikelzitate und maßgebliche Rechtsprechung.\nVorbereitung auf das Anwaltsexamen und juristische Berufe.",
      startConsultation: "Beratung starten",
      viewPlans: "Pläne ansehen",
      signIn: "Anmelden",
      payToStart: "Jetzt bezahlen →",
      systemsOk: "Systeme betriebsbereit",
      systemsDegraded: "Systeme beeinträchtigt",
      consultations: "Beratungen",
      featuresTitle: "Entwickelt für Exzellenz",
      featuresSubtitle: "Die Präzision eines Senior-Partners, die Geschwindigkeit fortschrittlicher KI.",
      feature1Title: "Multijurisdiktionale Intelligenz",
      feature1Desc: "Tiefes Fachwissen in EU-, US-, arabischen und marokkanischen Rechtssystemen mit genauen gesetzlichen Zitaten.",
      feature2Title: "Spezialisierte Rechtsbereiche",
      feature2Desc: "Vom Strafrecht bis zum geistigen Eigentum, mit spezialisierten KI-Expertenprofilen.",
      feature3Title: "Maßgebliche Zitate",
      feature3Desc: "Antworten gestützt auf spezifische Artikelnummern, Rechtsprechung und Gesetzesvorgaben.",
      feature4Title: "MAOS Legal — Marokko",
      feature4Desc: "Dedizierter KI-Experte für alle marokkanischen Codes: DOC, Strafgesetzbuch, CPC, CPP, Moudawwana und alle Gerichte.",
      statsTitle: "Vertraut in globalen Jurisdiktionen.",
      statsSubtitle: "Unsere Plattform verarbeitet täglich komplexe Rechtsanfragen in verschiedenen Rahmenwerken.",
      topDomainsTitle: "Meistberatene Bereiche",
      queries: "Anfragen",
      inquiries: "der Anfragen",
      pricingTitle: "Investition in Intelligenz",
      pricingSubtitle: "Wählen Sie die Stufe, die Ihren Anforderungen an Rechtsintelligenz entspricht.",
      maosSubtitle: "Marokkanische Rechtsintelligenz • Rechtsenzyklopädie 2026",
      maosRevisionMode: "Lernmodus",
    },
    auth: {
      intelligenceJuridiquePremium: "Premium Rechtsintelligenz",
      signInDisclaimer: "Durch den Zugang zu MAOS Legal stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu.",
      signUpDisclaimer: "Erstellen Sie Ihr MAOS Legal-Konto und wählen Sie Ihr Abonnement für Premium-Rechtsintelligenz.",
      signInTitle: "Willkommen zurück!",
      signInSubtitle: "Melden Sie sich bei Ihrem MAOS Legal-Konto an",
      signUpTitle: "Konto erstellen",
      signUpSubtitle: "Treten Sie MAOS Legal bei",
      emailLabel: "E-Mail",
      emailPlaceholder: "ihre@email.com",
      passwordLabel: "Passwort",
      firstNameLabel: "Vorname",
      lastNameLabel: "Nachname",
      signInButton: "Anmelden",
      signUpButton: "Mein Konto erstellen",
      homeButton: "Startseite",
      noAccount: "Noch kein Konto?",
      alreadyAccount: "Bereits ein Konto?",
      signUpLink: "Registrieren",
      signInLink: "Anmelden",
    },
    chat: {
      newConsultation: "Neue Beratung",
      activeCases: "Aktive Fälle",
      noConsultations: "Keine aktiven Beratungen.",
      consultationTitle: "Neue Beratung",
      consultationSubtitle: "Definieren Sie die Parameter Ihrer Rechtsanfrage, um mit dem geeigneten KI-Experten verbunden zu werden.",
      caseTitle: "Fallreferenz / Titel",
      casePlaceholder: "z.B. Frage zum Arbeitsgesetzbuch",
      jurisdiction: "Rechtsordnung",
      jurisdictionPlaceholder: "Anwendbares Recht auswählen",
      legalDomain: "Rechtsgebiet",
      domainPlaceholder: "Spezialisierung auswählen",
      selectJurisdictionFirst: "Zuerst Rechtsordnung auswählen",
      domainHint: "Dies bestimmt, welcher KI-Experte auf Ihre Anfragen antwortet.",
      beginConsultation: "Beratung beginnen",
      initializingExpert: "Experte wird initialisiert...",
      caseTitleMinLength: "Der Titel muss mindestens 3 Zeichen lang sein",
      jurisdictionRequired: "Bitte wählen Sie eine Rechtsordnung",
      domainRequired: "Bitte wählen Sie ein Rechtsgebiet",
      youLabel: "Sie",
      expertLabel: "Rechtsexperte",
      typeMessage: "Ihre Rechtsfrage eingeben...",
      sendMessage: "Senden",
      deleteConfirm: "Sind Sie sicher, dass Sie diese Beratung löschen möchten?",
      maosExpertTitle: "🇲🇦 MAOS Legal — Marokkanisches Recht Experte",
      maosExpertDesc: "DOC · Strafgesetzbuch · Moudawwana · CPC · CPP · Handelsrecht · Arbeitsrecht · Verwaltungsrecht · Alle Gerichte · Anwaltsexamen Vorbereitung",
      fileFormatError: "Format nicht unterstützt",
      fileSizeError: "Datei zu groß",
      fileFormatDesc: "Akzeptierte Formate: JPG, PNG, WebP, GIF, PDF",
      fileSizeDesc: "Maximale Dateigröße ist 15 MB",
      defaultAnalysisRequest: "Rechtsanalyse angefordert",
      analyzeDocBadge: "Dokumentenanalyse aktiviert",
      readyMaosTitle: "🇲🇦 MAOS Legal — Bereit",
      readyDefaultTitle: "Beratung bereit",
      maosReadyDesc: "Ihr MAOS Legal-Experte ist bereit. Stellen Sie Ihre Frage oder übermitteln Sie ein Dokument zur Analyse.",
      defaultReadyDesc: "Ihr Rechtsintelligenz-Experte ist bereit. Stellen Sie eine Frage oder laden Sie ein Dokument hoch.",
      photosImages: "Fotos & Bilder",
      pdfDocuments: "PDF-Dokumente",
      takePhotoLabel: "Foto aufnehmen",
      analyzingDoc: "Dokument wird analysiert...",
      analyzingLegal: "Rechtsprechung wird analysiert...",
      fileTypePdf: "PDF-Dokument",
      fileTypeImage: "Bild",
      docQuestionPlaceholder: "Stellen Sie Ihre Frage zu diesem Dokument (optional)...",
      attachFileLabel: "Dokument oder Bild anhängen",
      attachCameraLabel: "Foto aufnehmen",
      fileHint: "JPG · PNG · PDF · max. 15 MB",
      analyzeButton: "Analysieren",
      submitButton: "Absenden",
      legalDisclaimer: "Antworten werden von KI generiert und stellen keine formale Rechtsberatung dar. Überprüfen Sie stets Zitate und konsultieren Sie einen qualifizierten Anwalt.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "Fotografieren Sie ein Dokument mit Ihrer Kamera",
      emptyImageDesc: "Foto, Screenshot oder Scan hochladen",
      emptyPdfDesc: "PDF-Vertrag, Urteil oder Formular hochladen",
      examplePvAccident: "🚗 Unfallbericht",
      exampleContrat: "📋 Vertrag",
      exampleBail: "🏠 Mietvertrag",
      exampleMiseEnDemeure: "⚠️ Mahnung",
    },
    jurisdictions: { EU: "Europäische Union (EU)", US: "Vereinigte Staaten (USA)", Arabic: "Arabische Länder", Morocco: "Marokko — MAOS Legal" },
    pricing: {
      title: "Investition in Intelligenz",
      subtitle: "Klare, transparente Preise für KI-Rechtsintelligenz auf Unternehmensebene.",
      currentPlan: "Aktueller Plan", active: "AKTIV", usageThisMonth: "Nutzung diesen Monat", queriesLeft: "Anfragen",
      unlimited: "Unbegrenzt", perMonth: "/Monat", getStarted: "Loslegen", subscribe: "Abonnieren",
      recommended: "Empfohlen", questionsPerMonth: "Fragen / Monat", unlimitedQuestions: "Unbegrenzte Fragen",
      premiumOnly: "Nur Premium-Zugang", sslBadge: "256-Bit-SSL", jurisdictionsBadge: "4 Rechtsordnungen",
      citationsBadge: "Echte Rechtszitate", responseBadge: "Sofortige Antwort",
      encryptionNote: "Alle Abonnements beinhalten Verschlüsselung auf Unternehmensebene. Preise in USD.",
      activePlan: "Aktiver Plan", renewsOn: "Verlängerung am", goToChat: "Zum Chat",
      currentPlanLabel: "Ihr aktueller Plan", subscribeNow: "Jetzt abonnieren", getStartedNow: "Jetzt loslegen",
      mostPopular: "Beliebteste", cardRequired: "Bankkarte erforderlich • Kein kostenloser Test", month: "Monat",
    },
    plans: {
      professional: { name: "Professionell", features: ["100 Rechtsberatungen / Monat", "EU-, US-, Arabisches & Marokkanisches Recht (MAOS Legal)", "Präzise Gesetzeszitate", "Rechtsprechung & Gesetzesreferenzen", "Alle Rechtsgebiete", "Vorbereitung Anwaltsexamen / Juristische Berufe", "Prioritätsantworten"] },
      expert: { name: "Experte", features: ["Unbegrenzte Beratungen", "EU-, US-, Arabisches & Marokkanisches Recht (MAOS Legal)", "Eingehende Rechtsrecherche", "Vollzugang zur Rechtsprechung", "Alle Rechtsgebiete", "Vorbereitung Anwaltsexamen / Juristische Berufe", "Dediziertes KI-Expertenpanel", "Dokumentenanalyse", "Benutzerdefinierte Rechtsordnungsprofile"] },
    },
    notFound: { title: "404 — Seite nicht gefunden", description: "Die gesuchte Seite existiert nicht.", goHome: "Zur Startseite" },
  },

  it: {
    nav: { chat: "Consulenza", pricing: "Prezzi", newCase: "Nuovo Caso", signIn: "Accedi" },
    landing: {
      badge: "Il Futuro dell'Intelligenza Giuridica",
      headline1: "Chiarezza giuridica",
      headline2: "senza compromessi.",
      subtitle: "Esperto IA di nuova generazione nel diritto marocchino, tutti i rami.\nSistemi giuridici europeo, americano e mediorientale.\nCitazioni esatte di articoli e giurisprudenza autorevole.\nPreparazione all'esame di avvocatura e professioni giuridiche.",
      startConsultation: "Avvia Consulenza",
      viewPlans: "Vedi Piani",
      signIn: "Accedi",
      payToStart: "Paga per iniziare →",
      systemsOk: "Sistemi Operativi",
      systemsDegraded: "Sistemi Degradati",
      consultations: "Consulenze",
      featuresTitle: "Progettato per l'Eccellenza",
      featuresSubtitle: "La precisione di un senior partner, la velocità dell'IA avanzata.",
      feature1Title: "Intelligenza Multigiurisdizionale",
      feature1Desc: "Profonda esperienza nei sistemi giuridici UE, USA, arabo e marocchino con citazioni legislative precise.",
      feature2Title: "Domini Giuridici Specializzati",
      feature2Desc: "Dal diritto penale alla proprietà intellettuale, con profili di esperti IA specializzati.",
      feature3Title: "Citazioni Autorevoli",
      feature3Desc: "Risposte supportate da articoli specifici, giurisprudenza e riferimenti legislativi.",
      feature4Title: "MAOS Legal — Marocco",
      feature4Desc: "Esperto IA dedicato a tutti i codici marocchini: DOC, Codice Penale, CPC, CPP, Moudawwana e tutti i tribunali.",
      statsTitle: "Affidabile nelle giurisdizioni globali.",
      statsSubtitle: "La nostra piattaforma elabora quotidianamente richieste giuridiche complesse in quadri diversi.",
      topDomainsTitle: "Domini Più Consultati",
      queries: "richieste",
      inquiries: "delle richieste",
      pricingTitle: "Investimento in Intelligenza",
      pricingSubtitle: "Scegli il livello che corrisponde alle tue esigenze di intelligenza giuridica.",
      maosSubtitle: "Intelligenza Giuridica Marocchina • Enciclopedia del Diritto 2026",
      maosRevisionMode: "Modalità Studio",
    },
    auth: {
      intelligenceJuridiquePremium: "Intelligenza Giuridica Premium",
      signInDisclaimer: "Accedendo a MAOS Legal, accetti i nostri termini di utilizzo e la nostra politica sulla privacy.",
      signUpDisclaimer: "Crea il tuo account MAOS Legal e scegli il tuo abbonamento per accedere all'intelligenza giuridica premium.",
      signInTitle: "Bentornato!",
      signInSubtitle: "Accedi al tuo account MAOS Legal",
      signUpTitle: "Crea un account",
      signUpSubtitle: "Unisciti a MAOS Legal",
      emailLabel: "Email",
      emailPlaceholder: "tua@email.com",
      passwordLabel: "Password",
      firstNameLabel: "Nome",
      lastNameLabel: "Cognome",
      signInButton: "Accedi",
      signUpButton: "Crea il mio account",
      homeButton: "Home",
      noAccount: "Non hai ancora un account?",
      alreadyAccount: "Hai già un account?",
      signUpLink: "Registrati",
      signInLink: "Accedi",
    },
    chat: {
      newConsultation: "Nuova Consulenza",
      activeCases: "Casi Attivi",
      noConsultations: "Nessuna consulenza attiva.",
      consultationTitle: "Nuova Consulenza",
      consultationSubtitle: "Definisci i parametri della tua richiesta giuridica per connetterti con l'esperto IA appropriato.",
      caseTitle: "Riferimento / Titolo del Caso",
      casePlaceholder: "es. Domanda sul Codice del Lavoro",
      jurisdiction: "Giurisdizione",
      jurisdictionPlaceholder: "Seleziona il diritto applicabile",
      legalDomain: "Dominio Giuridico",
      domainPlaceholder: "Seleziona una specializzazione",
      selectJurisdictionFirst: "Seleziona prima la giurisdizione",
      domainHint: "Questo determina quale esperto IA risponderà alle tue richieste.",
      beginConsultation: "Avvia Consulenza",
      initializingExpert: "Inizializzazione Esperto...",
      caseTitleMinLength: "Il titolo deve avere almeno 3 caratteri",
      jurisdictionRequired: "Seleziona una giurisdizione",
      domainRequired: "Seleziona un dominio giuridico",
      youLabel: "Tu",
      expertLabel: "Esperto Giuridico",
      typeMessage: "Digita la tua domanda giuridica...",
      sendMessage: "Invia",
      deleteConfirm: "Sei sicuro di voler eliminare questa consulenza?",
      maosExpertTitle: "🇲🇦 MAOS Legal — Esperto Diritto Marocchino",
      maosExpertDesc: "DOC · Codice Penale · Moudawwana · CPC · CPP · Diritto Commerciale · Diritto del Lavoro · Diritto Amministrativo · Tutti i Tribunali · Preparazione Esame Avvocatura",
      fileFormatError: "Formato non supportato",
      fileSizeError: "File troppo grande",
      fileFormatDesc: "Formati accettati: JPG, PNG, WebP, GIF, PDF",
      fileSizeDesc: "La dimensione massima è 15 MB",
      defaultAnalysisRequest: "Analisi giuridica richiesta",
      analyzeDocBadge: "Analisi documenti attivata",
      readyMaosTitle: "🇲🇦 MAOS Legal — Pronto",
      readyDefaultTitle: "Consulenza Pronta",
      maosReadyDesc: "Il tuo esperto MAOS Legal è pronto. Fai la tua domanda o invia un documento per l'analisi.",
      defaultReadyDesc: "Il tuo esperto di intelligenza giuridica è pronto. Fai una domanda o carica un documento.",
      photosImages: "Foto e immagini",
      pdfDocuments: "Documenti PDF",
      takePhotoLabel: "Scatta foto",
      analyzingDoc: "Analisi del documento in corso...",
      analyzingLegal: "Analisi della giurisprudenza in corso...",
      fileTypePdf: "Documento PDF",
      fileTypeImage: "Immagine",
      docQuestionPlaceholder: "Fai la tua domanda su questo documento (opzionale)...",
      attachFileLabel: "Allega un documento o un'immagine",
      attachCameraLabel: "Scatta una foto",
      fileHint: "JPG · PNG · PDF · max 15 MB",
      analyzeButton: "Analizza",
      submitButton: "Invia",
      legalDisclaimer: "Le risposte sono generate dall'IA e non costituiscono una consulenza legale formale. Verifica sempre le citazioni e consulta un avvocato qualificato.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "Fotografa qualsiasi documento con la tua fotocamera",
      emptyImageDesc: "Carica una foto, screenshot o scansione",
      emptyPdfDesc: "Carica un contratto PDF, sentenza o modulo",
      examplePvAccident: "🚗 Verbale d'incidente",
      exampleContrat: "📋 Contratto",
      exampleBail: "🏠 Contratto d'affitto",
      exampleMiseEnDemeure: "⚠️ Diffida",
    },
    jurisdictions: { EU: "Unione Europea (UE)", US: "Stati Uniti (USA)", Arabic: "Paesi Arabi", Morocco: "Marocco — MAOS Legal" },
    pricing: {
      title: "Investimento in Intelligenza",
      subtitle: "Prezzi chiari e trasparenti per l'IA giuridica di livello enterprise.",
      currentPlan: "Piano Attuale", active: "ATTIVO", usageThisMonth: "Utilizzo Questo Mese", queriesLeft: "richieste",
      unlimited: "Illimitato", perMonth: "/mese", getStarted: "Inizia", subscribe: "Abbonati",
      recommended: "Raccomandato", questionsPerMonth: "domande / mese", unlimitedQuestions: "Domande illimitate",
      premiumOnly: "Solo Accesso Premium", sslBadge: "SSL 256 bit", jurisdictionsBadge: "4 Giurisdizioni",
      citationsBadge: "Citazioni Legali Reali", responseBadge: "Risposta Istantanea",
      encryptionNote: "Tutti gli abbonamenti includono crittografia di livello enterprise. Prezzi in USD.",
      activePlan: "Piano Attivo", renewsOn: "Rinnovo il", goToChat: "Vai alla Chat",
      currentPlanLabel: "Il tuo piano attuale", subscribeNow: "Abbonati ora", getStartedNow: "Inizia ora",
      mostPopular: "Più Popolare", cardRequired: "Carta bancaria richiesta • Senza prova gratuita", month: "mese",
    },
    plans: {
      professional: { name: "Professionale", features: ["100 consulenze giuridiche / mese", "Diritto UE, USA, Arabo e Marocchino (MAOS Legal)", "Citazioni precise di articoli di legge", "Giurisprudenza e riferimenti legislativi", "Tutti i domini giuridici", "Preparazione esame avvocatura / professioni giuridiche", "Risposte prioritarie"] },
      expert: { name: "Esperto", features: ["Consulenze illimitate", "Diritto UE, USA, Arabo e Marocchino (MAOS Legal)", "Ricerca giuridica approfondita", "Accesso completo alla giurisprudenza", "Tutti i domini giuridici", "Preparazione esame avvocatura / professioni giuridiche", "Panel di esperti IA dedicato", "Analisi documenti", "Profili di giurisdizione personalizzati"] },
    },
    notFound: { title: "404 — Pagina non trovata", description: "La pagina che cerchi non esiste.", goHome: "Torna alla home" },
  },

  no: {
    nav: { chat: "Konsultasjon", pricing: "Priser", newCase: "Ny Sak", signIn: "Logg inn" },
    landing: {
      badge: "Fremtiden for juridisk intelligens",
      headline1: "Juridisk klarhet",
      headline2: "uten kompromisser.",
      subtitle: "Neste generasjons KI-ekspert i marokkansk lov, alle grener.\nEuropiske, amerikanske og midtøstlige rettssystemer.\nNøyaktige artikkelhenvisninger og autoritativ rettspraksis.\nForberedelse til advokateksamen og juridiske yrker.",
      startConsultation: "Start Konsultasjon",
      viewPlans: "Se Planer",
      signIn: "Logg inn",
      payToStart: "Betal for å starte →",
      systemsOk: "Systemer i drift",
      systemsDegraded: "Systemer degradert",
      consultations: "Konsultasjoner",
      featuresTitle: "Utviklet for Fremragenhet",
      featuresSubtitle: "Presisjonen til en seniorpartner, hastigheten til avansert KI.",
      feature1Title: "Multijurisdiksjonell Intelligens",
      feature1Desc: "Dyp ekspertise innen EU-, US-, arabiske og marokkanske rettssystemer med nøyaktige lovhenvisninger.",
      feature2Title: "Spesialiserte Juridiske Domener",
      feature2Desc: "Fra strafferett til immaterialrett, med spesialiserte KI-ekspertprofiler.",
      feature3Title: "Autoritative Henvisninger",
      feature3Desc: "Svar støttet av spesifikke artikkelnumre, rettspraksis og lovhenvisninger.",
      feature4Title: "MAOS Legal — Marokko",
      feature4Desc: "Dedikert KI-ekspert på alle marokkanske koder: DOC, Straffeloven, CPC, CPP, Moudawwana og alle domstoler.",
      statsTitle: "Betrodd i globale jurisdiksjoner.",
      statsSubtitle: "Plattformen vår behandler daglig komplekse juridiske henvendelser på tvers av ulike rammeverk.",
      topDomainsTitle: "Mest Konsulterte Domener",
      queries: "henvendelser",
      inquiries: "av henvendelser",
      pricingTitle: "Investering i Intelligens",
      pricingSubtitle: "Velg nivået som matcher dine behov for juridisk intelligens.",
      maosSubtitle: "Marokkansk Juridisk Intelligens • Juridisk Leksikon 2026",
      maosRevisionMode: "Studiemodus",
    },
    auth: {
      intelligenceJuridiquePremium: "Premium Juridisk Intelligens",
      signInDisclaimer: "Ved å få tilgang til MAOS Legal godtar du våre brukervilkår og personvernregler.",
      signUpDisclaimer: "Opprett din MAOS Legal-konto og velg ditt abonnement for å få tilgang til premium juridisk intelligens.",
      signInTitle: "Velkommen tilbake!",
      signInSubtitle: "Logg inn på din MAOS Legal-konto",
      signUpTitle: "Opprett konto",
      signUpSubtitle: "Bli med i MAOS Legal",
      emailLabel: "E-post",
      emailPlaceholder: "din@epost.com",
      passwordLabel: "Passord",
      firstNameLabel: "Fornavn",
      lastNameLabel: "Etternavn",
      signInButton: "Logg inn",
      signUpButton: "Opprett min konto",
      homeButton: "Hjem",
      noAccount: "Ingen konto ennå?",
      alreadyAccount: "Har du allerede en konto?",
      signUpLink: "Registrer deg",
      signInLink: "Logg inn",
    },
    chat: {
      newConsultation: "Ny Konsultasjon",
      activeCases: "Aktive Saker",
      noConsultations: "Ingen aktive konsultasjoner.",
      consultationTitle: "Ny Konsultasjon",
      consultationSubtitle: "Definer parametrene for din juridiske henvendelse for å kobles med riktig KI-ekspert.",
      caseTitle: "Sakreferanse / Tittel",
      casePlaceholder: "f.eks. Spørsmål om Arbeidsmiljøloven",
      jurisdiction: "Jurisdiksjon",
      jurisdictionPlaceholder: "Velg gjeldende lov",
      legalDomain: "Juridisk Domene",
      domainPlaceholder: "Velg spesialisering",
      selectJurisdictionFirst: "Velg jurisdiksjon først",
      domainHint: "Dette bestemmer hvilken KI-ekspert som svarer på dine henvendelser.",
      beginConsultation: "Start Konsultasjon",
      initializingExpert: "Initialiserer Ekspert...",
      caseTitleMinLength: "Tittelen må ha minst 3 tegn",
      jurisdictionRequired: "Velg en jurisdiksjon",
      domainRequired: "Velg et juridisk domene",
      youLabel: "Du",
      expertLabel: "Juridisk Ekspert",
      typeMessage: "Skriv ditt juridiske spørsmål...",
      sendMessage: "Send",
      deleteConfirm: "Er du sikker på at du vil slette denne konsultasjonen?",
      maosExpertTitle: "🇲🇦 MAOS Legal — Marokkansk Lov Ekspert",
      maosExpertDesc: "DOC · Straffeloven · Moudawwana · CPC · CPP · Handelsrett · Arbeidsrett · Forvaltningsrett · Alle Domstoler · Advokateksamen Forberedelse",
      fileFormatError: "Format ikke støttet",
      fileSizeError: "Filen er for stor",
      fileFormatDesc: "Aksepterte formater: JPG, PNG, WebP, GIF, PDF",
      fileSizeDesc: "Maksimal filstørrelse er 15 MB",
      defaultAnalysisRequest: "Juridisk analyse forespurt",
      analyzeDocBadge: "Dokumentanalyse aktivert",
      readyMaosTitle: "🇲🇦 MAOS Legal — Klar",
      readyDefaultTitle: "Konsultasjon Klar",
      maosReadyDesc: "Din MAOS Legal-ekspert er klar. Still ditt spørsmål eller send et dokument for analyse.",
      defaultReadyDesc: "Din juridiske intelligensekspert er klar. Still et spørsmål eller last opp et dokument.",
      photosImages: "Bilder og fotografier",
      pdfDocuments: "PDF-dokumenter",
      takePhotoLabel: "Ta bilde",
      analyzingDoc: "Analyserer dokument...",
      analyzingLegal: "Analyserer juridisk presedens...",
      fileTypePdf: "PDF-dokument",
      fileTypeImage: "Bilde",
      docQuestionPlaceholder: "Still ditt spørsmål om dette dokumentet (valgfritt)...",
      attachFileLabel: "Legg ved dokument eller bilde",
      attachCameraLabel: "Ta et bilde",
      fileHint: "JPG · PNG · PDF · maks 15 MB",
      analyzeButton: "Analyser",
      submitButton: "Send",
      legalDisclaimer: "Svarene er KI-genererte og utgjør ikke formell juridisk rådgivning. Bekreft alltid henvisninger og konsulter en kvalifisert advokat.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "Ta et bilde av et dokument med kameraet ditt",
      emptyImageDesc: "Last opp et foto, skjermbilde eller skanning",
      emptyPdfDesc: "Last opp en PDF-kontrakt, dom eller skjema",
      examplePvAccident: "🚗 Ulykkesrapport",
      exampleContrat: "📋 Kontrakt",
      exampleBail: "🏠 Leieavtale",
      exampleMiseEnDemeure: "⚠️ Varsel",
    },
    jurisdictions: { EU: "Den europeiske union (EU)", US: "USA", Arabic: "Arabiske land", Morocco: "Marokko — MAOS Legal" },
    pricing: {
      title: "Investering i Intelligens",
      subtitle: "Klare, transparente priser for KI-juridisk intelligens på bedriftsnivå.",
      currentPlan: "Gjeldende Plan", active: "AKTIV", usageThisMonth: "Bruk denne måneden", queriesLeft: "henvendelser",
      unlimited: "Ubegrenset", perMonth: "/måned", getStarted: "Kom i gang", subscribe: "Abonner",
      recommended: "Anbefalt", questionsPerMonth: "spørsmål / mnd", unlimitedQuestions: "Ubegrensede spørsmål",
      premiumOnly: "Kun Premium-tilgang", sslBadge: "256-bit SSL", jurisdictionsBadge: "4 Jurisdiksjoner",
      citationsBadge: "Ekte Lovhenvisninger", responseBadge: "Øyeblikkelig Svar",
      encryptionNote: "Alle abonnementer inkluderer kryptering på bedriftsnivå. Priser i USD.",
      activePlan: "Aktivt Abonnement", renewsOn: "Fornyes den", goToChat: "Gå til Chat",
      currentPlanLabel: "Ditt gjeldende abonnement", subscribeNow: "Abonner nå", getStartedNow: "Kom i gang nå",
      mostPopular: "Mest Populær", cardRequired: "Bankkort påkrevd • Ingen gratis prøveperiode", month: "måned",
    },
    plans: {
      professional: { name: "Profesjonell", features: ["100 juridiske konsultasjoner / måned", "EU-, US-, Arabisk & Marokkansk lov (MAOS Legal)", "Presise lovhenvisninger", "Rettspraksis & lovgivningsreferanser", "Alle juridiske domener", "Forberedelse advokateksamen / juridiske yrker", "Prioritetssvar"] },
      expert: { name: "Ekspert", features: ["Ubegrensede konsultasjoner", "EU-, US-, Arabisk & Marokkansk lov (MAOS Legal)", "Grundig juridisk forskning", "Full tilgang til rettspraksis", "Alle juridiske domener", "Forberedelse advokateksamen / juridiske yrker", "Dedikert KI-ekspertpanel", "Dokumentanalyse", "Egendefinerte jurisdiksjonsprofiler"] },
    },
    notFound: { title: "404 — Side ikke funnet", description: "Siden du leter etter finnes ikke.", goHome: "Tilbake til hjem" },
  },

  pl: {
    nav: { chat: "Konsultacja", pricing: "Cennik", newCase: "Nowa Sprawa", signIn: "Zaloguj się" },
    landing: {
      badge: "Przyszłość inteligencji prawnej",
      headline1: "Jasność prawna",
      headline2: "bez kompromisów.",
      subtitle: "Ekspert AI nowej generacji w prawie marokańskim, wszystkie gałęzie.\nEuropejskie, amerykańskie i bliskowschodnie systemy prawne.\nDokładne cytaty artykułów i autorytatywne orzecznictwo.\nPrzygotowanie do egzaminu adwokackiego i zawodów prawniczych.",
      startConsultation: "Rozpocznij Konsultację",
      viewPlans: "Zobacz Plany",
      signIn: "Zaloguj się",
      payToStart: "Zapłać, aby zacząć →",
      systemsOk: "Systemy działają",
      systemsDegraded: "Systemy zdegradowane",
      consultations: "Konsultacje",
      featuresTitle: "Zaprojektowany dla Doskonałości",
      featuresSubtitle: "Precyzja starszego wspólnika, szybkość zaawansowanej AI.",
      feature1Title: "Wielojurysdykcyjna Inteligencja",
      feature1Desc: "Głęboka wiedza w zakresie systemów prawnych UE, USA, arabskiego i marokańskiego z dokładnymi cytatami ustawowymi.",
      feature2Title: "Specjalistyczne Dziedziny Prawne",
      feature2Desc: "Od prawa karnego po własność intelektualną, z wyspecjalizowanymi profilami ekspertów AI.",
      feature3Title: "Autorytatywne Cytaty",
      feature3Desc: "Odpowiedzi poparte konkretnymi numerami artykułów, orzecznictwem i odniesieniami ustawowymi.",
      feature4Title: "MAOS Legal — Maroko",
      feature4Desc: "Dedykowany ekspert AI we wszystkich kodeksach marokańskich: DOC, Kodeks Karny, CPC, CPP, Moudawwana i wszystkie sądy.",
      statsTitle: "Zaufany w globalnych jurysdykcjach.",
      statsSubtitle: "Nasza platforma przetwarza codziennie złożone zapytania prawne w różnych systemach.",
      topDomainsTitle: "Najczęściej Konsultowane Dziedziny",
      queries: "zapytania",
      inquiries: "zapytań",
      pricingTitle: "Inwestycja w Inteligencję",
      pricingSubtitle: "Wybierz poziom odpowiadający Twoim potrzebom w zakresie inteligencji prawnej.",
      maosSubtitle: "Marokańska Inteligencja Prawna • Encyklopedia Prawa 2026",
      maosRevisionMode: "Tryb Nauki",
    },
    auth: {
      intelligenceJuridiquePremium: "Premium Inteligencja Prawna",
      signInDisclaimer: "Uzyskując dostęp do MAOS Legal, akceptujesz nasze warunki użytkowania i politykę prywatności.",
      signUpDisclaimer: "Utwórz swoje konto MAOS Legal i wybierz subskrypcję, aby uzyskać dostęp do premium inteligencji prawnej.",
      signInTitle: "Witaj z powrotem!",
      signInSubtitle: "Zaloguj się do swojego konta MAOS Legal",
      signUpTitle: "Utwórz konto",
      signUpSubtitle: "Dołącz do MAOS Legal",
      emailLabel: "Email",
      emailPlaceholder: "twoj@email.com",
      passwordLabel: "Hasło",
      firstNameLabel: "Imię",
      lastNameLabel: "Nazwisko",
      signInButton: "Zaloguj się",
      signUpButton: "Utwórz moje konto",
      homeButton: "Strona główna",
      noAccount: "Nie masz jeszcze konta?",
      alreadyAccount: "Masz już konto?",
      signUpLink: "Zarejestruj się",
      signInLink: "Zaloguj się",
    },
    chat: {
      newConsultation: "Nowa Konsultacja",
      activeCases: "Aktywne Sprawy",
      noConsultations: "Brak aktywnych konsultacji.",
      consultationTitle: "Nowa Konsultacja",
      consultationSubtitle: "Określ parametry swojego zapytania prawnego, aby połączyć się z odpowiednim ekspertem AI.",
      caseTitle: "Referencja / Tytuł Sprawy",
      casePlaceholder: "np. Pytanie dotyczące Kodeksu Pracy",
      jurisdiction: "Jurysdykcja",
      jurisdictionPlaceholder: "Wybierz obowiązujące prawo",
      legalDomain: "Dziedzina Prawna",
      domainPlaceholder: "Wybierz specjalizację",
      selectJurisdictionFirst: "Najpierw wybierz jurysdykcję",
      domainHint: "To określa, który ekspert AI odpowie na Twoje zapytania.",
      beginConsultation: "Rozpocznij Konsultację",
      initializingExpert: "Inicjalizacja Eksperta...",
      caseTitleMinLength: "Tytuł musi mieć co najmniej 3 znaki",
      jurisdictionRequired: "Wybierz jurysdykcję",
      domainRequired: "Wybierz dziedzinę prawną",
      youLabel: "Ty",
      expertLabel: "Ekspert Prawny",
      typeMessage: "Wpisz swoje pytanie prawne...",
      sendMessage: "Wyślij",
      deleteConfirm: "Czy na pewno chcesz usunąć tę konsultację?",
      maosExpertTitle: "🇲🇦 MAOS Legal — Ekspert Prawa Marokańskiego",
      maosExpertDesc: "DOC · Kodeks Karny · Moudawwana · CPC · CPP · Prawo Handlowe · Prawo Pracy · Prawo Administracyjne · Wszystkie Sądy · Przygotowanie do Egzaminu Adwokackiego",
      fileFormatError: "Nieobsługiwany format",
      fileSizeError: "Plik za duży",
      fileFormatDesc: "Akceptowane formaty: JPG, PNG, WebP, GIF, PDF",
      fileSizeDesc: "Maksymalny rozmiar pliku to 15 MB",
      defaultAnalysisRequest: "Analiza prawna żądana",
      analyzeDocBadge: "Analiza dokumentów włączona",
      readyMaosTitle: "🇲🇦 MAOS Legal — Gotowy",
      readyDefaultTitle: "Konsultacja Gotowa",
      maosReadyDesc: "Twój ekspert MAOS Legal jest gotowy. Zadaj pytanie lub prześlij dokument do analizy.",
      defaultReadyDesc: "Twój ekspert ds. inteligencji prawnej jest gotowy. Zadaj pytanie lub prześlij dokument.",
      photosImages: "Zdjęcia i obrazy",
      pdfDocuments: "Dokumenty PDF",
      takePhotoLabel: "Zrób zdjęcie",
      analyzingDoc: "Analizowanie dokumentu...",
      analyzingLegal: "Analizowanie precedensów prawnych...",
      fileTypePdf: "Dokument PDF",
      fileTypeImage: "Obraz",
      docQuestionPlaceholder: "Zadaj pytanie dotyczące tego dokumentu (opcjonalne)...",
      attachFileLabel: "Załącz dokument lub obraz",
      attachCameraLabel: "Zrób zdjęcie",
      fileHint: "JPG · PNG · PDF · maks. 15 MB",
      analyzeButton: "Analizuj",
      submitButton: "Wyślij",
      legalDisclaimer: "Odpowiedzi są generowane przez AI i nie stanowią formalnej porady prawnej. Zawsze weryfikuj cytaty i konsultuj się z wykwalifikowanym prawnikiem.",
      lexaiPartnerLabel: "MAOS Legal",
      emptyPhotoDesc: "Zrób zdjęcie dokumentu aparatem",
      emptyImageDesc: "Prześlij zdjęcie, zrzut ekranu lub skan",
      emptyPdfDesc: "Prześlij umowę PDF, wyrok lub formularz",
      examplePvAccident: "🚗 Protokół wypadku",
      exampleContrat: "📋 Umowa",
      exampleBail: "🏠 Umowa najmu",
      exampleMiseEnDemeure: "⚠️ Wezwanie do zapłaty",
    },
    jurisdictions: { EU: "Unia Europejska (UE)", US: "Stany Zjednoczone (USA)", Arabic: "Kraje Arabskie", Morocco: "Maroko — MAOS Legal" },
    pricing: {
      title: "Inwestycja w Inteligencję",
      subtitle: "Przejrzyste ceny dla AI prawnej na poziomie korporacyjnym.",
      currentPlan: "Aktualny Plan", active: "AKTYWNY", usageThisMonth: "Użycie w tym miesiącu", queriesLeft: "zapytania",
      unlimited: "Nieograniczony", perMonth: "/miesiąc", getStarted: "Zacznij", subscribe: "Subskrybuj",
      recommended: "Zalecany", questionsPerMonth: "pytań / miesiąc", unlimitedQuestions: "Nieograniczone pytania",
      premiumOnly: "Tylko Premium", sslBadge: "SSL 256-bit", jurisdictionsBadge: "4 Jurysdykcje",
      citationsBadge: "Prawdziwe Cytaty Prawne", responseBadge: "Natychmiastowa Odpowiedź",
      encryptionNote: "Wszystkie subskrypcje obejmują szyfrowanie na poziomie korporacyjnym. Ceny w USD.",
      activePlan: "Aktywna Subskrypcja", renewsOn: "Odnowienie dnia", goToChat: "Przejdź do Czatu",
      currentPlanLabel: "Twoja aktualna subskrypcja", subscribeNow: "Subskrybuj teraz", getStartedNow: "Zacznij teraz",
      mostPopular: "Najpopularniejszy", cardRequired: "Karta bankowa wymagana • Bez bezpłatnego okresu próbnego", month: "miesiąc",
    },
    plans: {
      professional: { name: "Profesjonalny", features: ["100 konsultacji prawnych / miesiąc", "Prawo UE, USA, Arabskie i Marokańskie (MAOS Legal)", "Precyzyjne cytaty artykułów prawnych", "Orzecznictwo i odniesienia legislacyjne", "Wszystkie dziedziny prawne", "Przygotowanie do egzaminu adwokackiego / zawodów prawniczych", "Priorytetowe odpowiedzi"] },
      expert: { name: "Ekspert", features: ["Nieograniczone konsultacje", "Prawo UE, USA, Arabskie i Marokańskie (MAOS Legal)", "Dogłębne badania prawne", "Pełny dostęp do orzecznictwa", "Wszystkie dziedziny prawne", "Przygotowanie do egzaminu adwokackiego / zawodów prawniczych", "Dedykowany panel ekspertów AI", "Analiza dokumentów", "Niestandardowe profile jurysdykcji"] },
    },
    notFound: { title: "404 — Strona nie znaleziona", description: "Szukana strona nie istnieje.", goHome: "Wróć do strony głównej" },
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("maos-language");
    return (saved as Language) || "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("maos-language", lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
