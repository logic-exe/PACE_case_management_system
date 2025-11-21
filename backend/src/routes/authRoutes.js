import express from 'express';
import { 
  login, 
  register, 
  logout, 
  getCurrentUser,
  getGoogleAuthUrl,
  handleGoogleCallback
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', authenticateToken, getCurrentUser);

// Google Drive OAuth
router.get('/google/url', authenticateToken, getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);

export default router;
