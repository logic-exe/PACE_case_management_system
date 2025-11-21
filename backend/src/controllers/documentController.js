import { Document } from '../models/Document.js';
import { Case } from '../models/Case.js';
import * as driveService from '../services/driveService.js';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export const uploadMiddleware = upload.single('file');

export const uploadDocument = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { category, fileName } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (!caseData.google_drive_folder_id) {
      return res.status(400).json({ 
        error: 'Case does not have a Google Drive folder. Please create the case folder first.' 
      });
    }

    const driveAccessToken = req.headers['x-drive-access-token'];
    if (!driveAccessToken) {
      return res.status(400).json({ error: 'Google Drive access token required' });
    }

    const fileToUpload = {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
    };

    const documentName = fileName || req.file.originalname;

    const driveFile = await driveService.uploadFile(
      driveAccessToken,
      fileToUpload,
      caseData.google_drive_folder_id,
      documentName
    );

    const documentData = {
      case_id: parseInt(caseId),
      name: documentName,
      drive_file_id: driveFile.id,
      drive_url: driveFile.url,
      download_url: driveFile.downloadUrl,
      mime_type: driveFile.mimeType,
      size: driveFile.size,
      category: category || 'other',
      uploaded_by: userId,
    };

    const document = await Document.create(documentData);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload document' });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { category } = req.query;

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    let documents;
    if (category) {
      documents = await Document.getByCategory(caseId, category);
    } else {
      documents = await Document.getByCaseId(caseId);
    }

    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
};

export const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const driveAccessToken = req.headers['x-drive-access-token'];
    if (driveAccessToken && document.drive_file_id) {
      try {
        await driveService.deleteFile(driveAccessToken, document.drive_file_id);
      } catch (error) {
        console.error('Failed to delete from Drive:', error);
      }
    }

    await Document.delete(id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDocument = await Document.update(id, { name, category });

    res.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
};

