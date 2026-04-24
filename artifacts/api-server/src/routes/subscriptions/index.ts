import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const PLANS = [
  {
    id: "professional",
    name: "Professionnel",
    price: 49,
    currency: "USD",
    interval: "month",
    features: [
      "100 consultations juridiques / mois",
      "Droit UE, US, Arabe et Marocain (MAOS Legal)",
      "Citations d'articles de loi précises",
      "Jurisprudence et références législatives",
      "Tous les domaines juridiques",
      "Préparation concours Avocat / Procureur",
      "Réponses prioritaires",
    ],
    questionsPerMonth: 100,
    highlighted: false,
  },
  {
    id: "expert",
    name: "Expert",
    price: 199,
    currency: "USD",
    interval: "month",
    features: [
      "Consultations illimitées",
      "Droit UE, US, Arabe et Marocain (MAOS Legal)",
      "Recherche juridique approfondie",
      "Accès complet à la jurisprudence",
      "Tous les domaines juridiques",
      "Préparation concours Avocat / Procureur",
      "Panel d'experts IA dédié",
      "Analyse de documents",
      "Profils de juridiction personnalisés",
    ],
    questionsPerMonth: null,
    highlighted: true,
  },
];

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

router.get("/subscriptions/status", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const userId = auth?.userId;

  if (!userId) {
    res.json({
      hasActiveSubscription: false,
      plan: null,
      questionsUsed: 0,
      questionsLimit: 0,
      renewsAt: null,
      isActive: false,
    });
    return;
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user?.stripeSubscriptionId) {
      res.json({
        hasActiveSubscription: false,
        plan: null,
        questionsUsed: 0,
        questionsLimit: 0,
        renewsAt: null,
        isActive: false,
      });
      return;
    }

    const subResult = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${user.stripeSubscriptionId} LIMIT 1`
    );
    const sub = subResult.rows[0] as any;

    if (!sub || sub.status !== "active") {
      res.json({
        hasActiveSubscription: false,
        plan: sub?.status || "inactive",
        questionsUsed: 0,
        questionsLimit: 0,
        renewsAt: sub?.current_period_end || null,
        isActive: false,
      });
      return;
    }

    const plan = PLANS.find((p) => p.id === (sub.metadata?.planId || "professional")) || PLANS[0];

    res.json({
      hasActiveSubscription: true,
      plan: plan!.name,
      questionsUsed: 0,
      questionsLimit: plan!.questionsPerMonth,
      renewsAt: sub.current_period_end,
      isActive: true,
    });
  } catch {
    res.json({
      hasActiveSubscription: false,
      plan: null,
      questionsUsed: 0,
      questionsLimit: 0,
      renewsAt: null,
      isActive: false,
    });
  }
});

export default router;
