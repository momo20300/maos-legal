import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { requireAuth } from "../../middlewares/requireAuth";

const router: IRouter = Router();

const DOMAINS = ["Droit Civil", "Droit Pénal", "Droit Commercial", "Droit Administratif", "Droit du Travail", "Moudawwana", "Droit Constitutionnel", "Procédure Civile", "Procédure Pénale", "Droit des Affaires"];

const EXERCISE_SYSTEM = `Tu es un professeur de droit marocain expert, spécialisé dans la préparation aux concours juridiques (barreau, magistrature, notariat) et aux examens universitaires de droit.

Ta mission : générer des exercices pratiques de droit sous forme de cas pratiques, dissertation, ou commentaire d'article.

RÈGLES ABSOLUES :
1. Génère un exercice RÉALISTE et DIFFICILE, digne d'un vrai examen
2. L'exercice doit inclure un contexte factuel précis + une ou plusieurs questions claires
3. Mentionne toujours la matière, le type d'exercice, et le niveau
4. Pour les cas pratiques marocains : cite les codes marocains pertinents (DOC, Code Pénal, Moudawwana, CPCC...)
5. Termine par une ligne séparée "CONSIGNE :" avec ce que l'étudiant doit faire
6. Ne donne PAS la réponse dans l'exercice`;

const CORRECTION_SYSTEM = `Tu es un professeur de droit marocain expert et correcteur d'examens rigoureux.

Ta mission : corriger la réponse d'un étudiant de manière pédagogique et complète.

STRUCTURE DE LA CORRECTION (OBLIGATOIRE) :
## Évaluation globale
Note sur 20 : X/20
Appréciation : [Excellent / Très bien / Bien / Passable / Insuffisant]

## Points forts
[Ce que l'étudiant a bien compris]

## Points à améliorer  
[Les erreurs ou oublis]

## Correction type
[La réponse modèle complète et détaillée avec les articles de loi pertinents]

## Références juridiques clés
[Articles, codes, jurisprudence à retenir]

RÈGLES :
- Sois précis sur les articles de loi (DOC, Code Pénal, Moudawwana, CPCC, Code de Commerce...)
- Cite la jurisprudence marocaine si pertinent
- Reste bienveillant mais exigeant
- Explique POURQUOI c'est juste ou faux`;

router.post("/prep/exercise", requireAuth, async (req, res): Promise<void> => {
  const { domain, difficulty, language = "fr" } = req.body as {
    domain?: string; difficulty?: string; language?: string;
  };

  const dom = domain || "Droit Civil";
  const diff = difficulty || "Intermédiaire";

  const systemPrompt = language === "ar"
    ? `أنت أستاذ متخصص في القانون المغربي. مهمتك: توليد تمرين قانوني واقعي ومفصل للطلاب. قدم: سياقاً وقائعياً دقيقاً، ثم أسئلة واضحة للطالب. لا تعطِ الإجابة في التمرين. المستوى: ${diff}. المادة: ${dom}.`
    : EXERCISE_SYSTEM;

  const userPrompt = language === "ar"
    ? `أنشئ تمريناً قانونياً في مادة "${dom}" بمستوى "${diff}". يجب أن يكون واقعياً وصعباً كما في الامتحانات الحقيقية.`
    : `Génère un exercice de droit en matière de "${dom}" de niveau "${diff}". L'exercice doit être réaliste et difficile, digne d'un vrai examen de droit marocain ou européen.`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  try {
    const stream = anthropic.messages.stream({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        res.write(chunk.delta.text);
      }
    }
    res.end();
  } catch (err: any) {
    console.error("Prep exercise error:", err);
    res.status(500).end("Erreur lors de la génération de l'exercice.");
  }
});

router.post("/prep/correct", requireAuth, async (req, res): Promise<void> => {
  const { exercise, answer, domain, language = "fr" } = req.body as {
    exercise: string; answer: string; domain?: string; language?: string;
  };

  if (!exercise || !answer) {
    res.status(400).json({ error: "Exercice et réponse requis." });
    return;
  }

  const systemPrompt = language === "ar"
    ? `أنت مصحح امتحانات قانونية خبير. قيّم إجابة الطالب بشكل مفصل: النقطة على 20، نقاط القوة، نقاط التحسين، والإجابة النموذجية الكاملة مع المراجع القانونية.`
    : CORRECTION_SYSTEM;

  const userPrompt = language === "ar"
    ? `التمرين:\n${exercise}\n\nإجابة الطالب:\n${answer}\n\nصحح هذه الإجابة بشكل مفصل.`
    : `EXERCICE :\n${exercise}\n\nRÉPONSE DE L'ÉTUDIANT :\n${answer}\n\nCorrige cette réponse en détail selon la structure demandée.`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");

  try {
    const stream = anthropic.messages.stream({
      model: "claude-opus-4-5",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        res.write(chunk.delta.text);
      }
    }
    res.end();
  } catch (err: any) {
    console.error("Prep correction error:", err);
    res.status(500).end("Erreur lors de la correction.");
  }
});

export default router;
