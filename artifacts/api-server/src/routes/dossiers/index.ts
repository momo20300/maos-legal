import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, dossiers, dossierItems, conversations } from "@workspace/db";
import { requireAuth } from "../../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/dossiers", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  const rows = await db
    .select()
    .from(dossiers)
    .where(eq(dossiers.userId, userId))
    .orderBy(desc(dossiers.createdAt));
  res.json(rows);
});

router.post("/dossiers", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  const { name, description } = req.body as { name: string; description?: string };
  if (!name || name.trim().length < 1) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const [row] = await db
    .insert(dossiers)
    .values({ userId, name: name.trim(), description: description?.trim() })
    .returning();
  res.status(201).json(row);
});

router.delete("/dossiers/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(dossiers).where(and(eq(dossiers.id, id), eq(dossiers.userId, userId)));
  res.json({ ok: true });
});

router.get("/dossiers/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [dossier] = await db
    .select()
    .from(dossiers)
    .where(and(eq(dossiers.id, id), eq(dossiers.userId, userId)));

  if (!dossier) { res.status(404).json({ error: "Not found" }); return; }

  const items = await db
    .select({
      id: dossierItems.id,
      dossierId: dossierItems.dossierId,
      itemType: dossierItems.itemType,
      conversationId: dossierItems.conversationId,
      addedAt: dossierItems.addedAt,
      conversationTitle: conversations.title,
      conversationJurisdiction: conversations.jurisdiction,
      conversationLegalDomain: conversations.legalDomain,
      conversationCreatedAt: conversations.createdAt,
    })
    .from(dossierItems)
    .leftJoin(conversations, eq(dossierItems.conversationId, conversations.id))
    .where(eq(dossierItems.dossierId, id))
    .orderBy(desc(dossierItems.addedAt));

  res.json({ ...dossier, items });
});

router.post("/dossiers/:id/items", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  const dossierId = parseInt(req.params.id);
  if (isNaN(dossierId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [dossier] = await db.select().from(dossiers).where(and(eq(dossiers.id, dossierId), eq(dossiers.userId, userId)));
  if (!dossier) { res.status(404).json({ error: "Not found" }); return; }

  const { itemType, conversationId } = req.body as { itemType: string; conversationId?: number };
  if (!itemType || !conversationId) { res.status(400).json({ error: "itemType and conversationId required" }); return; }

  const [row] = await db.insert(dossierItems).values({ dossierId, itemType, conversationId }).returning();
  res.status(201).json(row);
});

router.delete("/dossiers/:id/items/:itemId", requireAuth, async (req, res): Promise<void> => {
  const userId = (req.session as any).userId;
  const dossierId = parseInt(req.params.id);
  const itemId = parseInt(req.params.itemId);
  if (isNaN(dossierId) || isNaN(itemId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [dossier] = await db.select().from(dossiers).where(and(eq(dossiers.id, dossierId), eq(dossiers.userId, userId)));
  if (!dossier) { res.status(404).json({ error: "Not found" }); return; }

  await db.delete(dossierItems).where(and(eq(dossierItems.id, itemId), eq(dossierItems.dossierId, dossierId)));
  res.json({ ok: true });
});

export default router;
