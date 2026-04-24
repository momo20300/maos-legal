import { Router, type IRouter } from "express";
import healthRouter from "./health";
import anthropicRouter from "./anthropic";
import subscriptionsRouter from "./subscriptions";
import legalDomainsRouter from "./legal-domains";

const router: IRouter = Router();

router.use(healthRouter);
router.use(anthropicRouter);
router.use(subscriptionsRouter);
router.use(legalDomainsRouter);

export default router;
