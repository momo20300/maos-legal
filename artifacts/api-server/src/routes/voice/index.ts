import { Router, type IRouter } from "express";
import Retell from "retell-sdk";

const router: IRouter = Router();

const AGENT_IDS = {
  fr: "agent_6e28c85d0fc67cdda9e45cf177",
  ar: "agent_6eddf4f9cdcf80f7f2ba8d32e6",
};

const retell = new Retell({ apiKey: process.env.RETELL_API_KEY || "" });

router.post("/voice/create-call", async (req, res): Promise<void> => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).json({ error: "Non authentifié." });
    return;
  }

  const { language = "fr" } = req.body as { language?: "fr" | "ar" };
  const agentId = AGENT_IDS[language] || AGENT_IDS.fr;

  try {
    const webCall = await retell.call.createWebCall({ agent_id: agentId });
    res.json({
      callId: webCall.call_id,
      accessToken: webCall.access_token,
      agentId,
    });
  } catch (err: any) {
    console.error("Retell create-call error:", err);
    res.status(500).json({ error: "Impossible de démarrer l'appel vocal." });
  }
});

export default router;
