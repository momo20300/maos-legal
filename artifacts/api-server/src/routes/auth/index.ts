import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

const ADMIN_EMAIL = "elasri.mounsef@gmail.com";

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, firstName, lastName } = req.body as {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères." });
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Un compte avec cet email existe déjà." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await db.insert(users).values({
      id,
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
    });

    (req.session as any).userId = id;
    (req.session as any).email = email.toLowerCase();

    res.json({
      id,
      email: email.toLowerCase(),
      firstName: firstName || null,
      lastName: lastName || null,
      isAdmin: email.toLowerCase() === ADMIN_EMAIL,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis." });
    return;
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Email ou mot de passe incorrect." });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Email ou mot de passe incorrect." });
      return;
    }

    (req.session as any).userId = user.id;
    (req.session as any).email = user.email;

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      isAdmin: user.email === ADMIN_EMAIL,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Non authentifié." });
    return;
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "Utilisateur introuvable." });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      isAdmin: user.email === ADMIN_EMAIL,
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

export default router;
