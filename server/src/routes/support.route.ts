import { Router } from 'express';
import { sendSupportRequest } from '../controllers/support.controller';
import { validate } from '../middlewares/validate.middleware';
import { contactSchema } from '../validators/support.validator';

const router = Router();

router.post('/contact', validate(contactSchema), sendSupportRequest);

export default router;
