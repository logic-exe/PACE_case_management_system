import express from 'express';
import {
  getAllBeneficiaries,
  getBeneficiaryById,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  findBeneficiaryByNameAndPhone
} from '../controllers/beneficiaryController.js';

const router = express.Router();

// Public routes (authentication disabled)
router.get('/', getAllBeneficiaries);
router.get('/find', findBeneficiaryByNameAndPhone);
router.get('/:id', getBeneficiaryById);
router.post('/', createBeneficiary);
router.put('/:id', updateBeneficiary);
router.delete('/:id', deleteBeneficiary);

export default router;
