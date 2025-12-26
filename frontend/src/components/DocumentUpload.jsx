import { useState } from 'react';
import { documentAPI } from '../services/apiService';
import toast from 'react-hot-toast';
import { MdDescription } from 'react-icons/md';

const DocumentUpload = ({ caseId, driveToken, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('other');
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!driveToken) {
      toast.error('Please connect Google Drive first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (fileName) {
        formData.append('fileName', fileName);
      }

      await documentAPI.upload(caseId, formData, driveToken);
      toast.success('Document uploaded successfully!');
      
      // Reset form
      setFile(null);
      setFileName('');
      setCategory('other');
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = '';
      }
      
      // Notify parent
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload-section">
      <h3>Upload Document</h3>
      <form onSubmit={handleUpload} className="document-upload-form">
        <div className="form-group">
          <label htmlFor="file-input">Select File</label>
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          />
          {file && (
            <div className="file-preview" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdDescription style={{ fontSize: '1.2rem' }} />
              <span>{file.name}</span>
              <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="file-name">File Name (Optional)</label>
          <input
            type="text"
            id="file-name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Custom file name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="complaint">Complaint</option>
            <option value="order">Order</option>
            <option value="correspondence">Correspondence</option>
            <option value="evidence">Evidence</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={!file || uploading || !driveToken}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default DocumentUpload;

