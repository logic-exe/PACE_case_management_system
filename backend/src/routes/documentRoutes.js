import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  uploadMiddleware,
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateDocument
} from '../controllers/documentController.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/cases/:caseId/upload', uploadMiddleware, uploadDocument);
router.get('/cases/:caseId', getDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;

