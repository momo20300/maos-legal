import { Router, type IRouter } from "express";
import healthRouter from "./health";
import anthropicRouter from "./anthropic";
import subscriptionsRouter from "./subscriptions";
import legalDomainsRouter from "./legal-domains";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(anthropicRouter);
router.use(subscriptionsRouter);
router.use(legalDomainsRouter);
router.use(adminRouter);

export default router;
