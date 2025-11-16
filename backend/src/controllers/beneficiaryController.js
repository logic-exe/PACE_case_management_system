import { Beneficiary } from '../models/Beneficiary.js';

export const getAllBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.getAll();
    res.json({ beneficiaries });
  } catch (error) {
    console.error('Get all beneficiaries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBeneficiaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const beneficiary = await Beneficiary.findById(id);
    
    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Get associated cases
    const cases = await Beneficiary.getCasesForBeneficiary(id);
    
    res.json({ beneficiary, cases });
  } catch (error) {
    console.error('Get beneficiary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBeneficiary = async (req, res) => {
  try {
    const beneficiaryData = req.body;

    // Validation
    if (!beneficiaryData.name) {
      return res.status(400).json({ error: 'Beneficiary name is required' });
    }

    const newBeneficiary = await Beneficiary.create(beneficiaryData);
    res.status(201).json({ 
      message: 'Beneficiary created successfully',
      beneficiary: newBeneficiary 
    });
  } catch (error) {
    console.error('Create beneficiary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const beneficiaryData = req.body;

    const updatedBeneficiary = await Beneficiary.update(id, beneficiaryData);
    
    if (!updatedBeneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    res.json({ 
      message: 'Beneficiary updated successfully',
      beneficiary: updatedBeneficiary 
    });
  } catch (error) {
    console.error('Update beneficiary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedBeneficiary = await Beneficiary.delete(id);
    
    if (!deletedBeneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    res.json({ 
      message: 'Beneficiary deleted successfully',
      beneficiary: deletedBeneficiary 
    });
  } catch (error) {
    console.error('Delete beneficiary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
