import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';
import { upload } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';

const router = Router();

router.get('/me', authenticate, userController.getProfile);

router.put('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);

router.post('/me/avatar', authenticate, upload.single('avatar'), userController.updateAvatar);

router.put('/me/password', authenticate, validate(changePasswordSchema), userController.changePassword);

router.get('/me/loyalty', authenticate, userController.getLoyaltySummary);

router.get('/me/loyalty/history', authenticate, userController.getLoyaltyHistory);

router.get('/me/birthday-status', authenticate, userController.getBirthdayStatus);

export default router;
