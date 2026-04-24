import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, users } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_EMAIL = "elasri.mounsef@gmail.com";

async function isAdmin(req: any): Promise<boolean> {
  const auth = getAuth(req);
  if (!auth?.userId) return false;
  try {
    const user = await clerkClient.users.getUser(auth.userId);
    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;
    return primaryEmail === ADMIN_EMAIL;
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

    const clerkUsers = await Promise.allSettled(
      allUsers.map((u) => clerkClient.users.getUser(u.id))
    );

    const enriched = allUsers.map((u, i) => {
      const clerkUser = clerkUsers[i].status === "fulfilled" ? clerkUsers[i].value : null;
      const email =
        u.email ||
        (clerkUser
          ? clerkUser.emailAddresses.find(
              (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress
          : null) ||
        null;

      return {
        id: u.id,
        email,
        plan: u.plan || null,
        subscriptionStatus: u.subscriptionStatus || "inactive",
        subscriptionExpiresAt: u.subscriptionExpiresAt,
        createdAt: u.createdAt,
      };
    });

    res.json(enriched);
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
      .insert(users)
      .values({
        id: userId,
        plan: plan ?? null,
        subscriptionStatus: subscriptionStatus ?? "inactive",
        subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          plan: plan ?? null,
          subscriptionStatus: subscriptionStatus ?? "inactive",
          subscriptionExpiresAt: subscriptionExpiresAt ? new Date(subscriptionExpiresAt) : null,
        },
      });

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
    try {
      await clerkClient.users.deleteUser(userId);
    } catch {
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
