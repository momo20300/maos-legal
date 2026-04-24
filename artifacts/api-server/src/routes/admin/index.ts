import { Router, type IRouter } from "express";
import { db, users } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_EMAIL = "elasri.mounsef@gmail.com";

async function isAdmin(req: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) return false;
  const sessionEmail = req.session?.email;
  if (sessionEmail) return sessionEmail === ADMIN_EMAIL;
  try {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    return user?.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

router.get("/admin/stats", async (req, res): Promise<void> => {
  if (!(await isAdmin(req))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const [activeSubsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionStatus, "active"));

    const byPlan = await db.execute(
      sql`SELECT plan, COUNT(*) as count FROM users WHERE subscription_status = 'active' AND plan IS NOT NULL GROUP BY plan`
    );

    res.json({
      totalUsers: Number(totalUsersResult.count),
      activeSubscriptions: Number(activeSubsResult.count),
      byPlan: byPlan.rows as { plan: string; count: number }[],
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/users", async (req, res): Promise<void> => {
  if (!(await isAdmin(req))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(sql`created_at DESC`);

    const result = allUsers.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      plan: u.plan || null,
      subscriptionStatus: u.subscriptionStatus || "inactive",
      subscriptionExpiresAt: u.subscriptionExpiresAt,
      createdAt: u.createdAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/admin/users/:userId/subscription", async (req, res): Promise<void> => {
  if (!(await isAdmin(req))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { userId } = req.params;
  const { plan, subscriptionStatus, subscriptionExpiresAt } = req.body as {
    plan: string | null;
    subscriptionStatus: string;
    subscriptionExpiresAt?: string | null;
  };

  try {
    await db
      .update(users)
      .set({
        plan: plan ?? null,
        subscriptionStatus: subscriptionStatus ?? "inactive",
        subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
      })
      .where(eq(users.id, userId));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/users/:userId", async (req, res): Promise<void> => {
  if (!(await isAdmin(req))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { userId } = req.params;

  try {
    await db.delete(users).where(eq(users.id, userId));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
