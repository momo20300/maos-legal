import { Router, type IRouter } from "express";
import Retell from "retell-sdk";
import { db, callLogs, conversations, messages, dossiers } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/requireAuth";
import crypto from "crypto";

const router: IRouter = Router();

type SupportedLang = "fr" | "ar" | "en" | "es" | "de" | "it" | "no" | "pl";

const AGENT_IDS: Record<SupportedLang, string> = {
  fr: process.env.RETELL_AGENT_FR || "agent_6e28c85d0fc67cdda9e45cf177",
  ar: process.env.RETELL_AGENT_AR || "agent_6eddf4f9cdcf80f7f2ba8d32e6",
  en: process.env.RETELL_AGENT_EN || "agent_6e28c85d0fc67cdda9e45cf177",
  es: process.env.RETELL_AGENT_ES || "agent_6e28c85d0fc67cdda9e45cf177",
  de: process.env.RETELL_AGENT_DE || "agent_6e28c85d0fc67cdda9e45cf177",
  it: process.env.RETELL_AGENT_IT || "agent_6e28c85d0fc67cdda9e45cf177",
  no: process.env.RETELL_AGENT_NO || "agent_6e28c85d0fc67cdda9e45cf177",
  pl: process.env.RETELL_AGENT_PL || "agent_6e28c85d0fc67cdda9e45cf177",
};

const SUPPORTED_LANGS: SupportedLang[] = ["fr", "ar", "en", "es", "de", "it", "no", "pl"];

const retell = new Retell({ apiKey: process.env.RETELL_API_KEY || "" });

router.get("/voice/agents", async (_req, res): Promise<void> => {
  res.json(
    SUPPORTED_LANGS.map(lang => ({
      lang,
      agentId: AGENT_IDS[lang],
      hasCustomAgent: !!process.env[`RETELL_AGENT_${lang.toUpperCase()}`],
    }))
  );
});

router.post("/voice/create-call", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const { language = "fr", conversationId } = req.body as { language?: SupportedLang; conversationId?: number };

  const lang: SupportedLang = SUPPORTED_LANGS.includes(language) ? language : "fr";
  const agentId = AGENT_IDS[lang];

  try {
    // Build dynamic variables — conversation history OR full user context
    const dynamicVars: Record<string, string> = {};

    if (conversationId) {
      // Continuing a specific conversation: load its messages
      try {
        const existingMsgs = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messages.createdAt)
          .limit(30);

        if (existingMsgs.length > 0) {
          const historyText = existingMsgs
            .map(m => {
              const who = m.role === "assistant"
                ? (lang === "ar" ? "المستشار" : "Expert MAOS")
                : (lang === "ar" ? "العميل" : "Client");
              return `${who}: ${m.content.slice(0, 800)}`;
            })
            .join("\n\n");

          dynamicVars["conversation_history"] = historyText.slice(0, 4000);
          dynamicVars["has_history"] = "true";
        }
      } catch { /* non-blocking */ }
    } else {
      // No specific conversation — load full user context so the agent knows the client's history
      try {
        const [recentConvs, userDossiers] = await Promise.all([
          db.select({
            id: conversations.id,
            title: conversations.title,
            legalDomain: conversations.legalDomain,
            jurisdiction: conversations.jurisdiction,
            source: conversations.source,
            createdAt: conversations.createdAt,
          })
            .from(conversations)
            .where(eq(conversations.userId, userId))
            .orderBy(desc(conversations.createdAt))
            .limit(8),
          db.select()
            .from(dossiers)
            .where(eq(dossiers.userId, userId))
            .orderBy(desc(dossiers.createdAt))
            .limit(6),
        ]);

        const isAr = lang === "ar";

        let contextLines: string[] = [];

        if (recentConvs.length > 0) {
          contextLines.push(isAr ? "## المشاورات الأخيرة" : "## Consultations récentes");
          recentConvs.forEach((c, i) => {
            const srcLabel = c.source === "voice"
              ? (isAr ? "صوتية" : "vocale")
              : (isAr ? "كتابية" : "textuelle");
            const dateStr = new Date(c.createdAt).toLocaleDateString(isAr ? "ar" : "fr-MA", {
              day: "numeric", month: "short", year: "numeric"
            });
            contextLines.push(
              `${i + 1}. [#${c.id}] ${c.title} — ${c.legalDomain} (${c.jurisdiction}) — ${srcLabel} — ${dateStr}`
            );
          });
        }

        if (userDossiers.length > 0) {
          contextLines.push(isAr ? "\n## ملفاتي النشطة" : "\n## Mes dossiers actifs");
          userDossiers.forEach((d, i) => {
            contextLines.push(`${i + 1}. ${d.name}${d.description ? ` — ${d.description.slice(0, 150)}` : ""}`);
          });
        }

        if (contextLines.length > 0) {
          const header = isAr
            ? "## سياق العميل — MAOS Legal\nالمعلومات التالية تصف ملف العميل الكامل. استخدمها للإجابة بدقة على أسئلته.\n\n"
            : "## Contexte client — MAOS Legal\nLes informations suivantes décrivent le dossier complet du client. Utilise-les pour répondre avec précision à ses questions.\n\n";

          const fullContext = (header + contextLines.join("\n")).slice(0, 4000);
          dynamicVars["conversation_history"] = fullContext;
          dynamicVars["user_context"] = fullContext;
          dynamicVars["has_history"] = "true";
        }
      } catch { /* non-blocking */ }
    }

    const webCall = await retell.call.createWebCall({
      agent_id: agentId,
      ...(Object.keys(dynamicVars).length > 0 ? { retell_llm_dynamic_variables: dynamicVars } : {}),
    });

    await db.insert(callLogs).values({
      id: crypto.randomUUID(),
      userId,
      callId: webCall.call_id,
      language: lang,
      agentId,
      status: "initiated",
    });

    res.json({ callId: webCall.call_id, accessToken: webCall.access_token, agentId });
  } catch (err: any) {
    console.error("Retell create-call error:", err);
    res.status(500).json({ error: "Impossible de démarrer l'appel vocal." });
  }
});

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

// Archive a finished call — appends to an existing conversation or creates a new one
router.post("/voice/archive-call", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const { callId, language = "fr", conversationId: existingConvId } = req.body as {
    callId: string;
    language?: SupportedLang;
    conversationId?: number;
  };

  if (!callId) {
    res.status(400).json({ error: "callId requis" });
    return;
  }

  try {
    // Retry fetching the transcript up to 5 times (Retell processes async)
    let callData: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      callData = await retell.call.retrieve(callId);
      if (callData?.transcript && callData.transcript.trim().length > 10) break;
      await new Promise(r => setTimeout(r, 2000));
    }

    const rawTranscript: string = callData?.transcript ?? "";
    const transcriptObj: Array<{ role: string; content: string }> = callData?.transcript_object ?? [];

    const lang: SupportedLang = SUPPORTED_LANGS.includes(language) ? language : "fr";
    const now = new Date();
    const dateStr = now.toLocaleDateString(lang === "ar" ? "ar" : "fr-MA", {
      day: "numeric", month: "long", year: "numeric"
    });
    const timeStr = now.toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });

    const jurisdiction = lang === "ar" ? "Arabic" : lang === "en" ? "US" : "Morocco";

    // Build transcript content
    let content: string;
    if (transcriptObj.length > 0) {
      const lines = transcriptObj.map((t) => {
        const who = t.role === "agent"
          ? (lang === "ar" ? "**المستشار القانوني**" : "**Expert MAOS Legal**")
          : (lang === "ar" ? "**أنت**" : "**Vous**");
        return `${who} : ${t.content}`;
      });
      content = lines.join("\n\n");
    } else if (rawTranscript.trim()) {
      content = rawTranscript;
    } else {
      content = lang === "ar"
        ? "لم تتوفر نسخة النص بعد. يُرجى التحقق لاحقاً."
        : "La transcription n'est pas encore disponible. Veuillez vérifier ultérieurement.";
    }

    const callNumber = lang === "ar" ? "📞 مكالمة جديدة" : "📞 Nouvel appel";
    const header = lang === "ar"
      ? `## ${callNumber} — ${dateStr} ${timeStr}\n\n---\n\n`
      : `## ${callNumber} — ${dateStr} à ${timeStr}\n\n---\n\n`;

    let targetConvId: number;

    if (existingConvId) {
      // Verify conversation belongs to user
      const [existingConv] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, existingConvId))
        .limit(1);

      if (existingConv && existingConv.userId === userId) {
        // Append to existing conversation
        await db.insert(messages).values({
          conversationId: existingConv.id,
          role: "assistant",
          content: header + content,
        });
        targetConvId = existingConv.id;
      } else {
        // Fallback: create new conversation
        const [conv] = await db.insert(conversations).values({
          userId,
          title: lang === "ar" ? `مكالمة صوتية — ${dateStr}` : `Appel vocal — ${dateStr}`,
          jurisdiction,
          legalDomain: lang === "ar" ? "استشارة صوتية" : "Consultation vocale",
          source: "voice",
        }).returning();
        await db.insert(messages).values({ conversationId: conv.id, role: "assistant", content: header + content });
        targetConvId = conv.id;
      }
    } else {
      // Create new conversation
      const [conv] = await db.insert(conversations).values({
        userId,
        title: lang === "ar" ? `مكالمة صوتية — ${dateStr}` : `Appel vocal — ${dateStr}`,
        jurisdiction,
        legalDomain: lang === "ar" ? "استشارة صوتية" : "Consultation vocale",
        source: "voice",
      }).returning();

      const fullHeader = lang === "ar"
        ? `# 📞 نسخة المكالمة الصوتية\n**التاريخ :** ${dateStr}\n\n---\n\n`
        : `# 📞 Transcription de l'appel vocal\n**Date :** ${dateStr}\n\n---\n\n`;

      await db.insert(messages).values({ conversationId: conv.id, role: "assistant", content: fullHeader + content });
      targetConvId = conv.id;
    }

    res.json({ conversationId: targetConvId });
  } catch (err: any) {
    console.error("archive-call error:", err);
    res.status(500).json({ error: "Erreur lors de l'archivage de l'appel." });
  }
});

export default router;
