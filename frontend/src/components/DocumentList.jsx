import { useState, useEffect } from 'react';
import { documentAPI } from '../services/apiService';
import toast from 'react-hot-toast';
import { MdDescription } from 'react-icons/md';

const DocumentList = ({ caseId, driveToken, refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [caseId, filterCategory, refreshTrigger]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getByCase(caseId, filterCategory || null);
      setDocuments(response.data.documents || []);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentAPI.delete(documentId, driveToken);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryBadge = (category) => {
    const badges = {
      complaint: 'badge-complaint',
      order: 'badge-order',
      correspondence: 'badge-correspondence',
      evidence: 'badge-evidence',
      other: 'badge-other'
    };
    return badges[category] || 'badge-other';
  };

  if (loading) {
    return <div className="loading-container">Loading documents...</div>;
  }

  return (
    <div className="document-list-section">
      <div className="document-list-header">
        <h3>Documents ({documents.length})</h3>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="complaint">Complaint</option>
          <option value="order">Order</option>
          <option value="correspondence">Correspondence</option>
          <option value="evidence">Evidence</option>
          <option value="other">Other</option>
        </select>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-card-header">
                <span className="document-icon"><MdDescription /></span>
                <div className="document-info">
                  <h4 className="document-name">{doc.name}</h4>
                  <div className="document-meta">
                    <span className={`badge ${getCategoryBadge(doc.category)}`}>
                      {doc.category}
                    </span>
                    <span className="document-date">{formatDate(doc.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="document-details">
                <p className="document-size">Size: {formatFileSize(doc.size)}</p>
                {doc.uploaded_by_name && (
                  <p className="document-uploader">Uploaded by: {doc.uploaded_by_name}</p>
                )}
              </div>

              <div className="document-actions">
                <a
                  href={doc.drive_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-view"
                >
                  View in Drive
                </a>
                <a
                  href={doc.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-download"
                >
                  Download
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="btn-delete"
                  disabled={!driveToken}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;

