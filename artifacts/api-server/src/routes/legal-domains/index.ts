import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, messages, conversations } from "@workspace/db";

const router: IRouter = Router();

const LEGAL_DOMAINS = [
  {
    id: "contract",
    name: "Contract Law",
    jurisdiction: "EU",
    description: "Commercial contracts, consumer agreements, breach of contract",
    icon: "FileText",
    expertTitle: "EU Contract Law Specialist",
  },
  {
    id: "gdpr",
    name: "Data Protection & GDPR",
    jurisdiction: "EU",
    description: "GDPR compliance, data rights, privacy regulations",
    icon: "Shield",
    expertTitle: "EU Data Protection Expert",
  },
  {
    id: "labor-eu",
    name: "Employment Law",
    jurisdiction: "EU",
    description: "Workers' rights, dismissal, discrimination, EU working time directive",
    icon: "Briefcase",
    expertTitle: "EU Labour Law Specialist",
  },
  {
    id: "competition",
    name: "Competition Law",
    jurisdiction: "EU",
    description: "Antitrust, state aid, market dominance, mergers",
    icon: "Scale",
    expertTitle: "EU Competition Law Expert",
  },
  {
    id: "immigration-eu",
    name: "EU Immigration",
    jurisdiction: "EU",
    description: "Freedom of movement, residence rights, asylum",
    icon: "Globe",
    expertTitle: "EU Immigration Specialist",
  },
  {
    id: "constitutional",
    name: "Constitutional Law",
    jurisdiction: "US",
    description: "Bill of Rights, civil liberties, federal powers",
    icon: "Landmark",
    expertTitle: "US Constitutional Law Expert",
  },
  {
    id: "criminal-us",
    name: "Criminal Law",
    jurisdiction: "US",
    description: "Federal and state criminal codes, rights of the accused",
    icon: "Gavel",
    expertTitle: "US Criminal Law Specialist",
  },
  {
    id: "employment-us",
    name: "Employment Law",
    jurisdiction: "US",
    description: "FLSA, Title VII, ADA, wrongful termination",
    icon: "Briefcase",
    expertTitle: "US Employment Law Expert",
  },
  {
    id: "ip",
    name: "Intellectual Property",
    jurisdiction: "US",
    description: "Patents, trademarks, copyright, trade secrets",
    icon: "Lightbulb",
    expertTitle: "US IP Law Specialist",
  },
  {
    id: "immigration-us",
    name: "US Immigration",
    jurisdiction: "US",
    description: "Visas, green cards, citizenship, deportation",
    icon: "Globe",
    expertTitle: "US Immigration Expert",
  },
  {
    id: "family-arabic",
    name: "Family Law (Sharia)",
    jurisdiction: "Arabic",
    description: "Marriage, divorce, custody under Islamic law",
    icon: "Heart",
    expertTitle: "Islamic Family Law Expert",
  },
  {
    id: "commercial-arabic",
    name: "Commercial Law",
    jurisdiction: "Arabic",
    description: "Business contracts, trade law, banking under GCC regulations",
    icon: "TrendingUp",
    expertTitle: "Arab Commercial Law Specialist",
  },
  {
    id: "labor-arabic",
    name: "Labour Law",
    jurisdiction: "Arabic",
    description: "Worker rights, Kafala system, labour disputes across Arab states",
    icon: "Briefcase",
    expertTitle: "Arab Labour Law Expert",
  },
  {
    id: "property-arabic",
    name: "Property Law",
    jurisdiction: "Arabic",
    description: "Real estate, ownership rights, waqf, inheritance",
    icon: "Home",
    expertTitle: "Arab Property Law Specialist",
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
      { jurisdiction: "EU", count: 0, percentage: 33 },
      { jurisdiction: "US", count: 0, percentage: 33 },
      { jurisdiction: "Arabic", count: 0, percentage: 34 },
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
