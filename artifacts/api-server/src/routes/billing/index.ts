import { Router, type IRouter } from "express";
import { db, users, userBalance, balanceTransactions, callLogs } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../../middlewares/requireAuth";

const router: IRouter = Router();

const VOICE_COST_PER_MIN_MAD = 5;
const FREE_CREDITS_MAD = 100;
const ADMIN_EMAIL = "elasri.mounsef@gmail.com";

async function ensureBalance(userId: string) {
  const [existing] = await db.select().from(userBalance).where(eq(userBalance.userId, userId));
  if (!existing) {
    await db.insert(userBalance).values({
      userId,
      balanceMad: "0",
      freeCreditsRemainingMad: String(FREE_CREDITS_MAD),
      totalCallMinutes: 0,
    });
    await db.insert(balanceTransactions).values({
      userId,
      amountMad: String(FREE_CREDITS_MAD),
      type: "free_credit",
      description: "Crédit gratuit d'accueil offert",
    });
    const [created] = await db.select().from(userBalance).where(eq(userBalance.userId, userId));
    return created;
  }
  return existing;
}

router.get("/billing/balance", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  try {
    const balance = await ensureBalance(userId);
    res.json({
      balanceMad: Number(balance.balanceMad),
      freeCreditsRemainingMad: Number(balance.freeCreditsRemainingMad),
      freeCreditsUsedMad: FREE_CREDITS_MAD - Number(balance.freeCreditsRemainingMad),
      totalCallMinutes: balance.totalCallMinutes,
      voiceCostPerMinMad: VOICE_COST_PER_MIN_MAD,
      freeCreditsInitialMad: FREE_CREDITS_MAD,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/billing/transactions", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  try {
    const txns = await db
      .select()
      .from(balanceTransactions)
      .where(eq(balanceTransactions.userId, userId))
      .orderBy(desc(balanceTransactions.createdAt))
      .limit(50);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/billing/recharge", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const { amountMad } = req.body as { amountMad: number };
  if (!amountMad || amountMad < 50 || amountMad > 10000) {
    res.status(400).json({ error: "Montant invalide (min 50 MAD, max 10 000 MAD)" });
    return;
  }
  try {
    await ensureBalance(userId);
    await db.update(userBalance)
      .set({ balanceMad: sql`balance_mad + ${amountMad}`, updatedAt: new Date() })
      .where(eq(userBalance.userId, userId));
    await db.insert(balanceTransactions).values({
      userId,
      amountMad: String(amountMad),
      type: "card_recharge",
      description: `Recharge par carte bancaire — ${amountMad} MAD`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/billing/charge-call", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const { callId, durationSeconds } = req.body as { callId: string; durationSeconds: number };
  if (!callId || !durationSeconds || durationSeconds <= 0) {
    res.status(400).json({ error: "Données invalides" });
    return;
  }
  const durationMinutes = Math.ceil(durationSeconds / 60);
  const costMad = durationMinutes * VOICE_COST_PER_MIN_MAD;
  try {
    const balance = await ensureBalance(userId);
    let remaining = costMad;
    let freeUsed = 0;
    const freeAvailable = Number(balance.freeCreditsRemainingMad);
    if (freeAvailable > 0) {
      freeUsed = Math.min(freeAvailable, remaining);
      remaining -= freeUsed;
    }

    await db.update(userBalance)
      .set({
        freeCreditsRemainingMad: sql`free_credits_remaining_mad - ${freeUsed}`,
        balanceMad: sql`balance_mad - ${remaining}`,
        totalCallMinutes: sql`total_call_minutes + ${durationMinutes}`,
        updatedAt: new Date(),
      })
      .where(eq(userBalance.userId, userId));

    await db.insert(balanceTransactions).values({
      userId,
      amountMad: String(-costMad),
      type: "call_charge",
      description: `Appel vocal — ${durationMinutes} min (${costMad} MAD)`,
      callId,
    });

    await db.update(callLogs).set({ durationSeconds }).where(eq(callLogs.callId, callId));

    res.json({ success: true, costMad, durationMinutes });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/billing/users", async (req: any, res): Promise<void> => {
  if (req.session?.email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
  try {
    const result = await db.execute(sql`
      SELECT u.id, u.email, u.first_name, u.last_name, u.plan, u.subscription_status, u.created_at,
             COALESCE(b.balance_mad, 0) as balance_mad,
             COALESCE(b.free_credits_remaining_mad, 100) as free_credits_remaining_mad,
             COALESCE(b.total_call_minutes, 0) as total_call_minutes
      FROM users u
      LEFT JOIN user_balance b ON b.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/billing/users", async (req: any, res): Promise<void> => {
  if (req.session?.email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
  const { email, password, firstName, lastName, plan, initialBalanceMad } = req.body as {
    email: string; password: string; firstName?: string; lastName?: string;
    plan?: string; initialBalanceMad?: number;
  };
  if (!email || !password) { res.status(400).json({ error: "Email et mot de passe requis" }); return; }
  try {
    const bcrypt = await import("bcryptjs");
    const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(password, 12);
    await db.insert(users).values({
      id, email, passwordHash, firstName, lastName,
      plan: plan || "professional",
      subscriptionStatus: "active",
    });
    const freeMad = FREE_CREDITS_MAD;
    await db.insert(userBalance).values({
      userId: id,
      balanceMad: String(initialBalanceMad || 0),
      freeCreditsRemainingMad: String(freeMad),
      totalCallMinutes: 0,
    });
    await db.insert(balanceTransactions).values({
      userId: id,
      amountMad: String(freeMad),
      type: "free_credit",
      description: "Crédit gratuit d'accueil offert",
    });
    if (initialBalanceMad && initialBalanceMad > 0) {
      await db.insert(balanceTransactions).values({
        userId: id,
        amountMad: String(initialBalanceMad),
        type: "admin_credit",
        description: `Crédit initial par l'administrateur — ${initialBalanceMad} MAD`,
      });
    }
    res.json({ success: true, id });
  } catch (err: any) {
    if (err?.message?.includes("unique")) res.status(409).json({ error: "Email déjà utilisé" });
    else res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/admin/billing/users/:userId/credit", async (req: any, res): Promise<void> => {
  if (req.session?.email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
  const { userId } = req.params;
  const { amountMad, note } = req.body as { amountMad: number; note?: string };
  if (!amountMad || amountMad === 0) { res.status(400).json({ error: "Montant requis" }); return; }
  try {
    await ensureBalance(userId);
    if (amountMad > 0) {
      await db.update(userBalance)
        .set({ balanceMad: sql`balance_mad + ${amountMad}`, updatedAt: new Date() })
        .where(eq(userBalance.userId, userId));
    } else {
      await db.update(userBalance)
        .set({ balanceMad: sql`balance_mad + ${amountMad}`, updatedAt: new Date() })
        .where(eq(userBalance.userId, userId));
    }
    await db.insert(balanceTransactions).values({
      userId,
      amountMad: String(amountMad),
      type: amountMad > 0 ? "admin_credit" : "admin_debit",
      description: note || (amountMad > 0 ? `Crédit administrateur — ${amountMad} MAD` : `Débit administrateur — ${Math.abs(amountMad)} MAD`),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/admin/billing/users/:userId/transactions", async (req: any, res): Promise<void> => {
  if (req.session?.email !== ADMIN_EMAIL) { res.status(403).json({ error: "Forbidden" }); return; }
  const { userId } = req.params;
  try {
    const txns = await db
      .select().from(balanceTransactions)
      .where(eq(balanceTransactions.userId, userId))
      .orderBy(desc(balanceTransactions.createdAt))
      .limit(100);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
