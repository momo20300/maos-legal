import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, messages, conversations } from "@workspace/db";

const router: IRouter = Router();

const LEGAL_DOMAINS = [
  {
    id: "contract",
    name: "Contract Law",
    nameFr: "Droit des Contrats",
    nameAr: "قانون العقود",
    jurisdiction: "EU",
    description: "Commercial contracts, consumer agreements, breach of contract",
    icon: "FileText",
    expertTitle: "EU Contract Law Specialist",
  },
  {
    id: "gdpr",
    name: "Data Protection & GDPR",
    nameFr: "Protection des Données & RGPD",
    nameAr: "حماية البيانات",
    jurisdiction: "EU",
    description: "GDPR compliance, data rights, privacy regulations",
    icon: "Shield",
    expertTitle: "EU Data Protection Expert",
  },
  {
    id: "labor-eu",
    name: "Employment Law",
    nameFr: "Droit du Travail",
    nameAr: "قانون العمل",
    jurisdiction: "EU",
    description: "Workers' rights, dismissal, discrimination, EU working time directive",
    icon: "Briefcase",
    expertTitle: "EU Labour Law Specialist",
  },
  {
    id: "competition",
    name: "Competition Law",
    nameFr: "Droit de la Concurrence",
    nameAr: "قانون المنافسة",
    jurisdiction: "EU",
    description: "Antitrust, state aid, market dominance, mergers",
    icon: "Scale",
    expertTitle: "EU Competition Law Expert",
  },
  {
    id: "immigration-eu",
    name: "EU Immigration",
    nameFr: "Immigration UE",
    nameAr: "هجرة الاتحاد الأوروبي",
    jurisdiction: "EU",
    description: "Freedom of movement, residence rights, asylum",
    icon: "Globe",
    expertTitle: "EU Immigration Specialist",
  },
  {
    id: "constitutional",
    name: "Constitutional Law",
    nameFr: "Droit Constitutionnel",
    nameAr: "القانون الدستوري",
    jurisdiction: "US",
    description: "Bill of Rights, civil liberties, federal powers",
    icon: "Landmark",
    expertTitle: "US Constitutional Law Expert",
  },
  {
    id: "criminal-us",
    name: "Criminal Law",
    nameFr: "Droit Pénal",
    nameAr: "القانون الجنائي",
    jurisdiction: "US",
    description: "Federal and state criminal codes, rights of the accused",
    icon: "Gavel",
    expertTitle: "US Criminal Law Specialist",
  },
  {
    id: "employment-us",
    name: "Employment Law",
    nameFr: "Droit du Travail",
    nameAr: "قانون العمل",
    jurisdiction: "US",
    description: "FLSA, Title VII, ADA, wrongful termination",
    icon: "Briefcase",
    expertTitle: "US Employment Law Expert",
  },
  {
    id: "ip",
    name: "Intellectual Property",
    nameFr: "Propriété Intellectuelle",
    nameAr: "الملكية الفكرية",
    jurisdiction: "US",
    description: "Patents, trademarks, copyright, trade secrets",
    icon: "Lightbulb",
    expertTitle: "US IP Law Specialist",
  },
  {
    id: "immigration-us",
    name: "US Immigration",
    nameFr: "Immigration Américaine",
    nameAr: "الهجرة الأمريكية",
    jurisdiction: "US",
    description: "Visas, green cards, citizenship, deportation",
    icon: "Globe",
    expertTitle: "US Immigration Expert",
  },
  {
    id: "family-arabic",
    name: "Family Law (Sharia)",
    nameFr: "Droit de la Famille (Charia)",
    nameAr: "قانون الأسرة (الشريعة)",
    jurisdiction: "Arabic",
    description: "Marriage, divorce, custody under Islamic law",
    icon: "Heart",
    expertTitle: "Islamic Family Law Expert",
  },
  {
    id: "commercial-arabic",
    name: "Commercial Law",
    nameFr: "Droit Commercial",
    nameAr: "القانون التجاري",
    jurisdiction: "Arabic",
    description: "Business contracts, trade law, banking under GCC regulations",
    icon: "TrendingUp",
    expertTitle: "Arab Commercial Law Specialist",
  },
  {
    id: "labor-arabic",
    name: "Labour Law",
    nameFr: "Droit du Travail",
    nameAr: "قانون العمل",
    jurisdiction: "Arabic",
    description: "Worker rights, Kafala system, labour disputes across Arab states",
    icon: "Briefcase",
    expertTitle: "Arab Labour Law Expert",
  },
  {
    id: "property-arabic",
    name: "Property Law",
    nameFr: "Droit Immobilier",
    nameAr: "قانون الملكية",
    jurisdiction: "Arabic",
    description: "Real estate, ownership rights, waqf, inheritance",
    icon: "Home",
    expertTitle: "Arab Property Law Specialist",
  },
  // ─── MAOS Legal — Droit Marocain ───────────────────────────────────────────
  {
    id: "droit-civil-maroc",
    name: "Droit Civil (DOC)",
    nameFr: "Droit Civil (DOC)",
    nameAr: "القانون المدني",
    jurisdiction: "Morocco",
    description: "Obligations, contrats, responsabilité civile — Dahir des Obligations et Contrats 1913",
    icon: "FileText",
    expertTitle: "Expert Droit Civil Marocain",
  },
  {
    id: "droit-penal-maroc",
    name: "Droit Pénal",
    nameFr: "Droit Pénal",
    nameAr: "القانون الجنائي",
    jurisdiction: "Morocco",
    description: "Infractions, peines, responsabilité pénale — Code Pénal marocain",
    icon: "Gavel",
    expertTitle: "Expert Droit Pénal Marocain",
  },
  {
    id: "procedure-civile-maroc",
    name: "Procédure Civile (CPC)",
    nameFr: "Procédure Civile (CPC)",
    nameAr: "المسطرة المدنية",
    jurisdiction: "Morocco",
    description: "Saisine des tribunaux, référé, voies d'exécution — Code de Procédure Civile",
    icon: "Scale",
    expertTitle: "Expert Procédure Civile Marocaine",
  },
  {
    id: "procedure-penale-maroc",
    name: "Procédure Pénale (CPP)",
    nameFr: "Procédure Pénale (CPP)",
    nameAr: "المسطرة الجنائية",
    jurisdiction: "Morocco",
    description: "Enquête, garde à vue, instruction, jugement, voies de recours — Code de Procédure Pénale",
    icon: "Shield",
    expertTitle: "Expert Procédure Pénale Marocaine",
  },
  {
    id: "moudawwana",
    name: "Moudawwana — Code de la Famille",
    nameFr: "Moudawwana — Code de la Famille",
    nameAr: "مدونة الأسرة",
    jurisdiction: "Morocco",
    description: "Mariage, divorce, garde des enfants, pension alimentaire, héritage — Loi 70-03",
    icon: "Heart",
    expertTitle: "Expert Droit de la Famille Marocain",
  },
  {
    id: "droit-commercial-maroc",
    name: "Droit Commercial",
    nameFr: "Droit Commercial",
    nameAr: "القانون التجاري",
    jurisdiction: "Morocco",
    description: "Sociétés (SA, SARL), contrats commerciaux, faillites — Code de Commerce Loi 15-95",
    icon: "TrendingUp",
    expertTitle: "Expert Droit Commercial Marocain",
  },
  {
    id: "droit-travail-maroc",
    name: "Droit du Travail",
    nameFr: "Droit du Travail",
    nameAr: "قانون الشغل",
    jurisdiction: "Morocco",
    description: "Contrat de travail, licenciement, CNSS, conventions collectives — Code du Travail Loi 65-99",
    icon: "Briefcase",
    expertTitle: "Expert Droit du Travail Marocain",
  },
  {
    id: "droit-administratif-maroc",
    name: "Droit Administratif",
    nameFr: "Droit Administratif",
    nameAr: "القانون الإداري",
    jurisdiction: "Morocco",
    description: "Recours contre l'Administration, marchés publics, responsabilité de l'État",
    icon: "Landmark",
    expertTitle: "Expert Droit Administratif Marocain",
  },
  {
    id: "droit-immobilier-maroc",
    name: "Droit Immobilier & Foncier",
    nameFr: "Droit Immobilier & Foncier",
    nameAr: "قانون العقار",
    jurisdiction: "Morocco",
    description: "Titre foncier, copropriété, hypothèque, bail, expropriation",
    icon: "Home",
    expertTitle: "Expert Droit Immobilier Marocain",
  },
  {
    id: "concours-juridiques-maroc",
    name: "Préparation Concours — Avocat / Procureur",
    nameFr: "Préparation Concours — Avocat / Procureur",
    nameAr: "التحضير للمباريات — محامي / قاضي",
    jurisdiction: "Morocco",
    description: "Révision structurée pour le concours CNAOF (avocat) et INPJ (procureur), fiches de cours, questions-type",
    icon: "GraduationCap",
    expertTitle: "Coach Juridique — Concours Marocains",
  },
];

router.get("/legal-domains", async (_req, res): Promise<void> => {
  res.json(LEGAL_DOMAINS);
});

router.get("/legal-domains/stats", async (_req, res): Promise<void> => {
  const totalMessagesResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messages);

  const totalQuestions = totalMessagesResult[0]?.count ?? 0;

  const byJurisdictionResult = await db
    .select({
      jurisdiction: conversations.jurisdiction,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(conversations)
    .groupBy(conversations.jurisdiction);

  const total = byJurisdictionResult.reduce((acc, r) => acc + (r.count ?? 0), 0) || 1;

  const byJurisdiction = byJurisdictionResult.map((r) => ({
    jurisdiction: r.jurisdiction,
    count: r.count ?? 0,
    percentage: Math.round(((r.count ?? 0) / total) * 100),
  }));

  if (byJurisdiction.length === 0) {
    byJurisdiction.push(
      { jurisdiction: "EU", count: 0, percentage: 25 },
      { jurisdiction: "US", count: 0, percentage: 25 },
      { jurisdiction: "Arabic", count: 0, percentage: 25 },
      { jurisdiction: "Morocco", count: 0, percentage: 25 },
    );
  }

  const byDomainResult = await db
    .select({
      domain: conversations.legalDomain,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(conversations)
    .groupBy(conversations.legalDomain);

  const byDomain = byDomainResult.map((r) => ({
    domain: r.domain,
    count: r.count ?? 0,
  }));

  res.json({
    totalQuestions,
    byJurisdiction,
    byDomain,
  });
});

export default router;
