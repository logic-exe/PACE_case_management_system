import { getDriveClient } from '../config/drive.js';
import config from '../config/index.js';
import { Readable } from 'stream';

export const createFolder = async (accessToken, folderName, parentFolderId = null) => {
  const drive = getDriveClient(accessToken);
  
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  
  // Only set parent folder if explicitly provided and valid
  if (parentFolderId) {
    fileMetadata.parents = [parentFolderId];
  } else if (config.google.rootFolderId) {
    // Verify root folder exists before using it
    try {
      await drive.files.get({ fileId: config.google.rootFolderId });
      fileMetadata.parents = [config.google.rootFolderId];
    } catch (error) {
      console.warn(`Root folder ${config.google.rootFolderId} not accessible:`, error.message);
      console.log('Creating folder in Google Drive root instead');
      // Don't set parents - will create in user's Drive root
    }
  }
  
  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, name, webViewLink',
  });
  
  return {
    id: response.data.id,
    name: response.data.name,
    url: response.data.webViewLink,
  };
};

export const uploadFile = async (accessToken, file, folderId, fileName) => {
  const drive = getDriveClient(accessToken);
  
  const fileMetadata = {
    name: fileName,
    parents: folderId ? [folderId] : [],
  };
  
  // Convert buffer to stream for Google Drive API
  // Create a readable stream from the buffer
  const bufferStream = Readable.from(file.buffer);
  
  const media = {
    mimeType: file.mimetype,
    body: bufferStream,
  };
  
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink, size, mimeType',
  });
  
  const fileId = response.data.id;
  
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
  
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  return {
    id: response.data.id,
    name: response.data.name,
    url: response.data.webViewLink,
    downloadUrl: downloadUrl,
    mimeType: response.data.mimeType,
    size: parseInt(response.data.size || 0),
  };
};

export const deleteFile = async (accessToken, fileId) => {
  const drive = getDriveClient(accessToken);
  await drive.files.delete({ fileId });
  return true;
};

export const listFilesInFolder = async (accessToken, folderId) => {
  const drive = getDriveClient(accessToken);
  
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, webViewLink, mimeType, size, createdTime)',
  });
  
  return response.data.files.map(file => ({
    id: file.id,
    name: file.name,
    url: file.webViewLink,
    mimeType: file.mimeType,
    size: parseInt(file.size || 0),
    createdAt: file.createdTime,
  }));
};

