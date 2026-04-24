import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "5 legal questions per month",
      "EU, US, and Arabic law coverage",
      "Basic legal explanations",
      "Chat interface",
    ],
    questionsPerMonth: 5,
    highlighted: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 49,
    currency: "USD",
    interval: "month",
    features: [
      "100 legal questions per month",
      "EU, US, and Arabic law coverage",
      "Detailed analysis with citations",
      "Law article numbers and jurisprudence",
      "Audio responses",
      "Priority response time",
      "All legal domains",
    ],
    questionsPerMonth: 100,
    highlighted: true,
  },
  {
    id: "expert",
    name: "Expert",
    price: 199,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited legal questions",
      "EU, US, and Arabic law coverage",
      "Deep legal research with full citations",
      "Complete jurisprudence database access",
      "Audio responses",
      "Dedicated AI legal panel",
      "All legal domains",
      "Custom jurisdiction profiles",
      "Document analysis",
    ],
    questionsPerMonth: null,
    highlighted: false,
  },
];

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  res.json(PLANS);
});

router.get("/subscriptions/status", async (_req, res): Promise<void> => {
  res.json({
    plan: "free",
    questionsUsed: 2,
    questionsLimit: 5,
    renewsAt: null,
    isActive: true,
  });
});

export default router;
