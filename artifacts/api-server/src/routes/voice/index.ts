import { Router, type IRouter } from "express";
import Retell from "retell-sdk";
import { db, callLogs } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/requireAuth";
import crypto from "crypto";

const router: IRouter = Router();

const AGENT_IDS = {
  fr: "agent_6e28c85d0fc67cdda9e45cf177",
  ar: "agent_6eddf4f9cdcf80f7f2ba8d32e6",
};

const retell = new Retell({ apiKey: process.env.RETELL_API_KEY || "" });

router.post("/voice/create-call", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const { language = "fr" } = req.body as { language?: "fr" | "ar" };
  const agentId = AGENT_IDS[language] || AGENT_IDS.fr;

  try {
    const webCall = await retell.call.createWebCall({ agent_id: agentId });

    // Log the call
    await db.insert(callLogs).values({
      id: crypto.randomUUID(),
      userId,
      callId: webCall.call_id,
      language,
      agentId,
      status: "initiated",
    });

    res.json({ callId: webCall.call_id, accessToken: webCall.access_token, agentId });
  } catch (err: any) {
    console.error("Retell create-call error:", err);
    res.status(500).json({ error: "Impossible de démarrer l'appel vocal." });
  }
});

// Get call history for current user
router.get("/voice/calls", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  try {
    const calls = await db
      .select()
      .from(callLogs)
      .where(eq(callLogs.userId, userId))
      .orderBy(desc(callLogs.createdAt))
      .limit(50);
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des appels." });
  }
});

export default router;
