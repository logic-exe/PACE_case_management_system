import express from 'express';
import {
  getAllCases,
  getOngoingCases,
  getCasesWithFilters,
  getCaseById,
  createCase,
  updateCase,
  deleteCase
} from '../controllers/caseController.js';

const router = express.Router();

// Public routes (authentication disabled)
router.get('/', getAllCases);
router.get('/ongoing', getOngoingCases);
router.get('/filter', getCasesWithFilters);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

export default router;
