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
      headline2: "sans compromis.",
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
      headline2: "عنه، فوراً.",
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
