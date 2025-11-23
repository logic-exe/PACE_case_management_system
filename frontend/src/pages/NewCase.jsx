import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { beneficiaryAPI, caseAPI, documentAPI } from '../services/apiService';
import { useDriveAuth } from '../hooks/useDriveAuth';
import toast from 'react-hot-toast';

const NewCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [createDriveFolder, setCreateDriveFolder] = useState(true);
  const { driveToken, isConnected, connectGoogleDrive } = useDriveAuth();
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    contact_number: '',
    email: '',
    address: '',
    has_smartphone: '',
    can_read: '',
    case_type: '',
    case_type_other: '',
    case_title: '',
    case_resolution_type: '',
    court: '',
    court_other: '',
    organizations: [],
    case_notes: '',
    google_drive_url: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOrganizationToggle = (org) => {
    setFormData(prev => ({
      ...prev,
      organizations: prev.organizations.includes(org)
        ? prev.organizations.filter(o => o !== org)
        : [...prev.organizations, org]
    }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.beneficiary_name || !formData.contact_number || !formData.case_type || !formData.case_title) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // First create beneficiary
      const beneficiaryData = {
        name: formData.beneficiary_name,
        contact_number: formData.contact_number,
        email: formData.email,
        address: formData.address,
        has_smartphone: formData.has_smartphone === 'yes',
        can_read: formData.can_read === 'yes',
        date_of_filing: new Date().toISOString().split('T')[0]
      };
      
      const beneficiaryRes = await beneficiaryAPI.create(beneficiaryData);
      
      // Then create case
      const caseData = {
        beneficiary_id: beneficiaryRes.data.beneficiary.id,
        case_type: formData.case_type === 'Other' ? formData.case_type_other : formData.case_type,
        case_title: formData.case_title,
        case_resolution_type: formData.case_resolution_type,
        court: formData.court === 'Other' ? formData.court_other : formData.court,
        organizations: formData.organizations,
        status: 'active',
        notes: formData.case_notes,
        createDriveFolder: createDriveFolder && isConnected
      };
      
      const caseRes = await caseAPI.create(caseData, driveToken);
      const newCaseId = caseRes.data.case.id;
      
      // Upload documents if any files were selected and Drive is connected
      if (uploadedFiles.length > 0 && isConnected && driveToken) {
        if (!caseRes.data.case.google_drive_folder_id) {
          toast.error('Case folder not created. Documents cannot be uploaded.');
        } else {
          let uploadCount = 0;
          let failCount = 0;
          
          for (const file of uploadedFiles) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('category', 'other');
              formData.append('fileName', file.name);
              
              await documentAPI.upload(newCaseId, formData, driveToken);
              uploadCount++;
            } catch (error) {
              console.error(`Failed to upload ${file.name}:`, error);
              failCount++;
            }
          }
          
          if (uploadCount > 0) {
            toast.success(`Case created! ${uploadCount} document(s) uploaded successfully.`);
          }
          if (failCount > 0) {
            toast.error(`${failCount} document(s) failed to upload.`);
          }
        }
      } else {
        toast.success('Case created successfully!');
      }
      
      navigate('/cases');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-container">
        <div className="page-header-with-back">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Back
          </button>
          <div>
            <h1>Create New Case</h1>
            <p>Fill in the case details to create a new record in the system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="case-form-new">
          {/* Beneficiary Information Section */}
          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon">📋</span>
              <h2>Beneficiary Information</h2>
            </div>
            
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="beneficiary_name">
                  Beneficiary Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="beneficiary_name"
                  name="beneficiary_name"
                  value={formData.beneficiary_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Asha Devi"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_number">
                  Contact Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="email">Email Address (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="beneficiary@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          {/* Case Details Section */}
          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon">⚖️</span>
              <h2>Case Details</h2>
            </div>

            <div className="form-group">
              <label htmlFor="case_type">
                Case Type <span className="required">*</span>
              </label>
              <select
                id="case_type"
                name="case_type"
                value={formData.case_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select case type</option>
                <option value="Domestic Violence">Domestic Violence</option>
                <option value="Child Custody">Child Custody</option>
                <option value="Property Dispute">Property Dispute</option>
                <option value="Consumer Rights">Consumer Rights</option>
                <option value="Labor Rights">Labor Rights</option>
                <option value="Sexual Harassment">Sexual Harassment</option>
                <option value="Dowry Harassment">Dowry Harassment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="case_title">
                Case Title/Description <span className="required">*</span>
              </label>
              <input
                type="text"
                id="case_title"
                name="case_title"
                value={formData.case_title}
                onChange={handleInputChange}
                placeholder="e.g., Anjali Murder Case"
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="case_resolution_type">
                  Case Resolution Type <span className="required">*</span>
                </label>
                <select
                  id="case_resolution_type"
                  name="case_resolution_type"
                  value={formData.case_resolution_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select resolution type</option>
                  <option value="Litigation">Litigation</option>
                  <option value="Mediation">Mediation</option>
                  <option value="Arbitration">Arbitration</option>
                  <option value="Legal Aid">Legal Aid</option>
                  <option value="Counseling">Counseling</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="court">Specific Court (if applicable)</label>
                <select
                  id="court"
                  name="court"
                  value={formData.court}
                  onChange={handleInputChange}
                >
                  <option value="">Select court</option>
                  <option value="District Court Delhi">District Court Delhi</option>
                  <option value="High Court Delhi">High Court Delhi</option>
                  <option value="Family Court">Family Court</option>
                  <option value="Consumer Court">Consumer Court</option>
                  <option value="Sessions Court">Sessions Court</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Organizations Involved</label>
              <div className="checkbox-grid">
                {[
                  'NCW (National Commission for Women)',
                  'DCW (Delhi Commission for Women)',
                  'Thana (Police Station)',
                  'District Office',
                  'CWC (Child Welfare Committee)',
                  'DLSA (District Legal Services Authority)'
                ].map(org => (
                  <label key={org} className="checkbox-label-new">
                    <input
                      type="checkbox"
                      checked={formData.organizations.includes(org)}
                      onChange={() => handleOrganizationToggle(org)}
                    />
                    <span>{org}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="case_notes">Case Notes/Background</label>
              <textarea
                id="case_notes"
                name="case_notes"
                value={formData.case_notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Provide detailed background information about the case..."
              />
            </div>
          </div>

          {/* Beneficiary Communication Preferences Section */}
          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon">📱</span>
              <h2>Beneficiary Communication Preferences</h2>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="has_smartphone">
                  Has Smartphone? <span className="required">*</span>
                </label>
                <select
                  id="has_smartphone"
                  name="has_smartphone"
                  value={formData.has_smartphone}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="can_read">
                  Can Read? <span className="required">*</span>
                </label>
                <select
                  id="can_read"
                  name="can_read"
                  value={formData.can_read}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Initial Documents Section */}
          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon">📎</span>
              <h2>Initial Documents</h2>
            </div>

            <div
              className="file-drop-zone"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                type="file"
                id="file-input"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="drop-icon">↑</div>
              <p className="drop-text">Drag & Drop Files Here</p>
              <p className="drop-subtext">or click to browse</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="uploaded-files-list">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">📄 {file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="file-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={createDriveFolder}
                  onChange={(e) => setCreateDriveFolder(e.target.checked)}
                  disabled={!isConnected}
                />
                <span>Auto-create Google Drive folder for this case</span>
              </label>
              {!isConnected && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button 
                    type="button"
                    onClick={connectGoogleDrive}
                    className="btn-connect-drive"
                  >
                    🔗 Connect Google Drive
                  </button>
                </div>
              )}
              {isConnected && (
                <p style={{ marginTop: '0.5rem', color: '#28a745', fontSize: '0.9rem' }}>
                  ✓ Google Drive connected
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-new">
            <button type="button" onClick={() => navigate('/cases')} className="btn-cancel">
              Cancel
            </button>
            <button type="button" className="btn-draft">
              Save as Draft
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewCase;
