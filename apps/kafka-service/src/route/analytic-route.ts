import express, { Router } from 'express';

import { trackAnalyticsEvent } from '../controller/analytics-controller';

const router: Router = express.Router();

router.post('/track', trackAnalyticsEvent);

export default router;
