import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import anthropicRouter from "./anthropic";
import subscriptionsRouter from "./subscriptions";
import legalDomainsRouter from "./legal-domains";
import adminRouter from "./admin";
import voiceRouter from "./voice";
import prepRouter from "./prep";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(anthropicRouter);
router.use(subscriptionsRouter);
router.use(legalDomainsRouter);
router.use(adminRouter);
router.use(voiceRouter);
router.use(prepRouter);

export default router;
