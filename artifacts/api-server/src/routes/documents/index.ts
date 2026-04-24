import { Router, type IRouter } from "express";
import { db, documentArchive } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  try {
    const docs = await db
      .select()
      .from(documentArchive)
      .where(eq(documentArchive.userId, userId))
      .orderBy(desc(documentArchive.createdAt))
      .limit(100);
    res.json(docs);
  } catch (err) {
    console.error("List documents error:", err);
    res.status(500).json({ error: "Erreur récupération documents" });
  }
});

router.get("/documents/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [doc] = await db
      .select()
      .from(documentArchive)
      .where(eq(documentArchive.id, id));
    if (!doc || doc.userId !== userId) { res.status(404).json({ error: "Document not found" }); return; }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Erreur" });
  }
});

export default router;
