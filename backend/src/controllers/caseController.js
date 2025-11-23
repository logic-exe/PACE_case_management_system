import { Case } from '../models/Case.js';
import { Beneficiary } from '../models/Beneficiary.js';
import * as driveService from '../services/driveService.js';

export const getAllCases = async (req, res) => {
  try {
    const { dateFilter } = req.query;
    const cases = await Case.getAll(dateFilter);
    res.json({ cases });
  } catch (error) {
    console.error('Get all cases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOngoingCases = async (req, res) => {
  try {
    const { dateFilter } = req.query;
    const cases = await Case.getOngoing(dateFilter);
    res.json({ cases });
  } catch (error) {
    console.error('Get ongoing cases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCasesWithFilters = async (req, res) => {
  try {
    const filters = req.query;
    const cases = await Case.getWithFilters(filters);
    res.json({ cases });
  } catch (error) {
    console.error('Get filtered cases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseData = await Case.findById(id);
    
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ case: caseData });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCase = async (req, res) => {
  try {
    const caseData = req.body;

    // Validation
    if (!caseData.beneficiary_id) {
      return res.status(400).json({ error: 'Beneficiary ID is required' });
    }

    // Generate case code
    const caseCode = await Case.generateCaseCode();
    caseData.case_code = caseCode;

    // Get beneficiary name for folder name
    const beneficiary = await Beneficiary.findById(caseData.beneficiary_id);
    if (!beneficiary) {
      return res.status(404).json({ error: 'Beneficiary not found' });
    }

    // Initialize folder creation variables
    let folderCreated = false;
    let folderError = null;

    // Create Google Drive folder if access token is provided
    const driveAccessToken = req.headers['x-drive-access-token'];
    if (driveAccessToken && req.body.createDriveFolder !== false) {
      try {
        console.log('Creating Google Drive folder for case:', caseCode);
        const folderName = `${caseCode} - ${beneficiary.name}`;
        const folder = await driveService.createFolder(driveAccessToken, folderName);
        
        caseData.google_drive_folder_id = folder.id;
        caseData.google_drive_url = folder.url;
        folderCreated = true;
        console.log('Google Drive folder created successfully:', folder.id);
      } catch (error) {
        console.error('Failed to create Drive folder:', error);
        folderError = error.message;
        // Don't fail the case creation, but we'll inform the frontend
      }
    } else if (req.body.createDriveFolder !== false) {
      // No access token provided but folder creation was requested
      folderError = 'No Google Drive access token provided';
      console.log('No Google Drive access token provided for case creation');
    }

    const newCase = await Case.create(caseData);
    
    // Prepare response with folder status
    const response = {
      message: 'Case created successfully',
      case: newCase,
      driveFolder: {
        created: folderCreated,
        error: folderError
      }
    };

    // If there were files uploaded but no folder was created, inform the frontend
    if (req.files && req.files.length > 0 && !folderCreated) {
      response.warning = 'Case folder not created. Documents cannot be uploaded.';
      response.driveFolder.required = true;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const caseData = req.body;

    const updatedCase = await Case.update(id, caseData);
    
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ 
      message: 'Case updated successfully',
      case: updatedCase 
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCase = await Case.delete(id);
    
    if (!deletedCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ 
      message: 'Case deleted successfully',
      case: deletedCase 
    });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
