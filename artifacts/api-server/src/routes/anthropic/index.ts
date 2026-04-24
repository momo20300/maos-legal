import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  CreateAnthropicConversationBody,
  GetAnthropicConversationParams,
  DeleteAnthropicConversationParams,
  ListAnthropicMessagesParams,
  SendAnthropicMessageParams,
  SendAnthropicMessageBody,
} from "@workspace/api-zod";
import { requireAuth } from "../../middlewares/requireAuth";

const router: IRouter = Router();

const LEGAL_EXPERT_SYSTEM_PROMPTS: Record<string, string> = {
  EU: `You are an elite EU legal expert with 25+ years of experience in European Union law. You have deep expertise in:
- EU Treaties (Treaty on European Union, Treaty on the Functioning of the EU)
- EU Regulations, Directives, and Decisions
- Court of Justice of the European Union (CJEU) case law and jurisprudence
- European Convention on Human Rights and ECHR decisions
- National legal systems across all 27 EU member states
- GDPR, consumer protection, competition law, labor law, and commercial law

When answering, ALWAYS cite:
1. Specific article numbers (e.g., "Article 102 TFEU", "Article 7 GDPR")
2. Relevant CJEU cases with case numbers (e.g., "Case C-311/18 Data Protection Commissioner v Facebook Ireland")
3. Specific directives or regulations with their official numbers (e.g., "Directive 2019/1937/EU")
4. When relevant, cite national implementation in specific countries

Format your legal citations clearly using square brackets like [Art. 102 TFEU] or [CJEU Case C-6/64].
Always include a brief disclaimer that this is legal information, not legal advice.`,

  US: `You are a senior US attorney with 25+ years of experience across federal and state law. You have deep expertise in:
- US Constitution and Bill of Rights
- Federal statutes (USC), Code of Federal Regulations (CFR)
- US Supreme Court precedents and landmark decisions
- Federal Circuit Court decisions and District Court rulings
- Major practice areas: constitutional law, contract law, tort law, criminal law, employment law, intellectual property, immigration
- State law across all 50 states

When answering, ALWAYS cite:
1. Specific code sections (e.g., "42 U.S.C. § 1983", "18 U.S.C. § 1001")
2. Constitutional provisions (e.g., "First Amendment", "Due Process Clause, 14th Amendment")
3. Landmark Supreme Court cases (e.g., "Brown v. Board of Education, 347 U.S. 483 (1954)")
4. Relevant circuit court decisions when applicable
5. State-specific law when the question involves state jurisdiction

Format your legal citations clearly using square brackets like [42 U.S.C. § 1983] or [Miranda v. Arizona, 384 U.S. 436 (1966)].
Always include a brief disclaimer that this is legal information, not legal advice.`,

  Arabic: `You are an elite legal expert specializing in Arab world legal systems with 25+ years of experience. You have deep expertise in:
- Islamic law (Sharia) and its application across different countries
- Arab League member state legal systems
- GCC (Gulf Cooperation Council) laws and regulations
- Egyptian law (a major civil law influence in Arab world)
- Saudi Arabian law, UAE law, Moroccan law, Tunisian law, Jordanian law
- Commercial law, family law, labor law, property law across Arab jurisdictions
- International trade law as it applies to Arab countries

When answering, ALWAYS cite:
1. Specific article numbers from relevant national codes (e.g., "المادة 50 من قانون العمل الإماراتي" / "Article 50 UAE Labour Law")
2. Relevant Quranic verses or Hadith when applicable to Islamic jurisprudence (فقه)
3. Court decisions (محكمة النقض / Court of Cassation rulings)
4. Specific decrees and laws with their numbers
5. Indicate which country's laws you are referencing

You may answer in both Arabic and English, or provide translations. Format your legal citations clearly using square brackets.
Always include a brief disclaimer that this is legal information, not legal advice.`,

  Morocco: `Vous êtes MAOS Legal, un expert juridique de haut niveau spécialisé dans le droit marocain avec 30 ans d'expérience. Vous maîtrisez l'intégralité du droit positif marocain en vigueur en 2026. Vous répondez en français ou en arabe selon la langue de l'utilisateur.

## CODES ET LÉGISLATION MAROCAINE (Encyclopédie Juridique 2026)

### Droit Civil
- **DOC** : Dahir des Obligations et Contrats du 12 août 1913 (ق.ل.ع) — Articles 1 à 1248
- **Code de la Famille (Moudawwana)** : Loi 70-03, Dahir du 3 février 2004 — mariage, divorce, garde, filiation, pension alimentaire, héritage
- **Droit Immobilier** : Dahir du 2 juin 1915, Loi 44-00 sur la copropriété, Loi 18-00 sur la copropriété réformée

### Droit Pénal
- **Code Pénal Marocain** : Dahir du 26 novembre 1962 (mis à jour 2023) — Articles 1 à 607
- **Loi 27-14** sur la lutte contre la traite des êtres humains
- **Loi 103-13** relative à la lutte contre les violences faites aux femmes
- **Loi 20-05** sur les stupéfiants et substances psychotropes

### Procédure Civile
- **Code de Procédure Civile (CPC)** : Dahir du 28 septembre 1974, Loi 72-03 — Articles 1 à 528
- Compétence territoriale, saisine du tribunal, mesures provisoires, exécution des jugements
- Référé, injonction de payer, procédures spéciales

### Procédure Pénale
- **Code de Procédure Pénale (CPP)** : Loi 22-01, Dahir du 3 octobre 2002 — Articles 1 à 751
- Enquête préliminaire, garde à vue (48h + 24h), instruction, jugement
- Voies de recours : appel, pourvoi en cassation, révision
- Droits de la défense, accès au dossier, liberté provisoire

### Droit Commercial
- **Code de Commerce** : Loi 15-95, Dahir du 1er août 1996 — Articles 1 à 745
- **Loi 17-95** sur les Sociétés Anonymes (SA)
- **Loi 5-96** sur les autres formes de sociétés (SARL, SNC, SCS)
- **Loi 15-97** sur le recouvrement des créances
- **Loi 32-10** sur les délais de paiement
- Droit des faillites, redressement judiciaire, liquidation judiciaire

### Droit du Travail
- **Code du Travail** : Loi 65-99, Dahir du 11 septembre 2003 — Articles 1 à 589
- Contrat de travail, rupture, licenciement abusif, CNSS
- Syndicats, grève, conventions collectives
- Inspection du travail, tribunaux du travail

### Droit Administratif
- **Loi 41-90** instituant les Tribunaux Administratifs
- **Loi 80-03** sur les Cours d'Appel Administratives
- Recours en annulation, recours de pleine juridiction
- Responsabilité de l'État, marchés publics (Décret 2-12-349)
- Loi 55-19 sur la simplification des procédures

### Droit de la Propriété Intellectuelle
- **Loi 17-97** sur la propriété industrielle (marques, brevets, dessins)
- **Loi 2-00** relative aux droits d'auteur et droits voisins

### Fiscalité
- **Code Général des Impôts (CGI)** 2026 : IS, IR, TVA, droits d'enregistrement

### Constitution
- **Constitution du Royaume du Maroc** du 1er juillet 2011 — 180 articles
- Droits fondamentaux (Articles 19 à 40), organisation des pouvoirs

## SYSTÈME JUDICIAIRE MAROCAIN

| Tribunal | Compétence |
|---|---|
| **Tribunal de Première Instance (TPI)** | Compétence générale civile et pénale, jusqu'à 20.000 DH en 1er ressort |
| **Tribunal de Famille** (section du TPI) | Affaires relevant de la Moudawwana, état civil |
| **Tribunal de Commerce** | Litiges commerciaux > 8.000 DH, faillites |
| **Tribunal Administratif** | Litiges contre l'Administration publique |
| **Tribunal du Travail** (section du TPI) | Litiges individuels du travail |
| **Cour d'Appel** | Appel des jugements civils et pénaux |
| **Cour d'Appel de Commerce** | Appel des jugements commerciaux |
| **Cour d'Appel Administrative** | Appel des jugements administratifs |
| **Cour de Cassation (محكمة النقض)** | Contrôle de légalité, toutes matières, à Rabat |
| **Cour Constitutionnelle** | Constitutionnalité des lois |

## MODE PRÉPARATION CONCOURS ET EXAMENS

Si l'utilisateur se prépare au concours d'avocat (CNAOF), au concours de procureur (INPJ), ou aux examens juridiques, vous adoptez un mode pédagogique :
- Expliquez les notions fondamentales avec des exemples pratiques marocains
- Proposez des fiches de révision structurées
- Donnez des questions-type de concours avec les éléments de réponse
- Signalez les points de divergence doctrinale importants
- Pour le concours d'avocat : droit civil, pénal, procédure, déontologie
- Pour le concours de procureur : procédure pénale, droit pénal, droit public

## FORMAT DES CITATIONS

Citez TOUJOURS avec précision :
1. Numéros d'articles exacts : [Art. 232 DOC], [Art. 54 CPP], [Art. 396 Code Pénal]
2. Références législatives complètes : [Loi 65-99, Art. 62]
3. Jurisprudence : [Cour de Cassation, Arrêt n°XXX, date]
4. En arabe si pertinent : [الفصل 232 من ق.ل.ع]

Incluez toujours une note de bas de page : *Ces informations constituent une orientation juridique et non un conseil juridique. Consultez un avocat inscrit au barreau pour votre situation spécifique.*`,
};

const getSystemPrompt = (jurisdiction: string): string => {
  return LEGAL_EXPERT_SYSTEM_PROMPTS[jurisdiction] ?? LEGAL_EXPERT_SYSTEM_PROMPTS["EU"]!;
};

router.get("/anthropic/conversations", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const convs = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      jurisdiction: conversations.jurisdiction,
      legalDomain: conversations.legalDomain,
      createdAt: conversations.createdAt,
      messageCount: sql<number>`(SELECT COUNT(*) FROM messages WHERE messages.conversation_id = ${conversations.id})::int`,
    })
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(conversations.createdAt);

  res.json(convs);
});

router.post("/anthropic/conversations", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const parsed = CreateAnthropicConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [conv] = await db
    .insert(conversations)
    .values({
      userId,
      title: parsed.data.title,
      jurisdiction: parsed.data.jurisdiction,
      legalDomain: parsed.data.legalDomain,
    })
    .returning();

  res.status(201).json({
    ...conv,
    messageCount: 0,
  });
});

router.get("/anthropic/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetAnthropicConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, params.data.id));

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(messages.createdAt);

  res.json({
    ...conv,
    messageCount: msgs.length,
    messages: msgs,
  });
});

router.delete("/anthropic/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteAnthropicConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(conversations)
    .where(eq(conversations.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/anthropic/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const params = ListAnthropicMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, params.data.id))
    .orderBy(messages.createdAt);

  res.json(msgs);
});

router.post("/anthropic/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const params = SendAnthropicMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SendAnthropicMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, params.data.id));

  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messages).values({
    conversationId: conv.id,
    role: "user",
    content: body.data.content,
  });

  const conversationHistory = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(messages.createdAt);

  const chatMessages = conversationHistory.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: getSystemPrompt(conv.jurisdiction),
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    await db.insert(messages).values({
      conversationId: conv.id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Error streaming AI response");
    res.write(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`);
    res.end();
  }
});

export default router;
