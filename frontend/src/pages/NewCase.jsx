import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { beneficiaryAPI, caseAPI, documentAPI } from '../services/apiService';
import { useDriveAuth } from '../hooks/useDriveAuth';
import toast from 'react-hot-toast';
import { MdPerson, MdGavel, MdPhone, MdAttachFile, MdLink, MdCheckCircle, MdClose } from 'react-icons/md';

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
    case_resolution_type_other: '',
    court: '',
    court_other: '',
    organizations: [],
    case_notes: '',
    google_drive_url: ''
  });

  useEffect(() => {
    const prefillData = sessionStorage.getItem('prefillBeneficiaryData');
    if (prefillData) {
      try {
        const beneficiaryData = JSON.parse(prefillData);
        setFormData(prev => ({ ...prev, ...beneficiaryData }));
        sessionStorage.removeItem('prefillBeneficiaryData');
        toast.success(`Form pre-filled with ${beneficiaryData.beneficiary_name}'s information`);
      } catch (error) {
        console.error('Error parsing prefill data:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact_number') {
      const cleanNumber = value.replace(/\D/g, '');
      const limitedNumber = cleanNumber.slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: limitedNumber }));
      return;
    }
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
    if (formData.contact_number.length !== 10) {
      toast.error('Please enter exactly 10 digits for phone number');
      return;
    }
    setLoading(true);
    try {
      let beneficiaryId;
      const existingBeneficiaryRes = await beneficiaryAPI.findByNameAndPhone(
        formData.beneficiary_name,
        formData.contact_number
      );
      if (existingBeneficiaryRes.data.exists) {
        beneficiaryId = existingBeneficiaryRes.data.beneficiary.id;
        toast.success(`Found existing beneficiary: ${formData.beneficiary_name}. Adding case to their profile.`);
      } else {
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
        beneficiaryId = beneficiaryRes.data.beneficiary.id;
      }
      const caseData = {
        beneficiary_id: beneficiaryId,
        case_type: formData.case_type === 'Other' ? formData.case_type_other : formData.case_type,
        case_title: formData.case_title,
        case_resolution_type: formData.case_resolution_type === 'Other' ? formData.case_resolution_type_other : formData.case_resolution_type,
        court: formData.court === 'Other' ? formData.court_other : formData.court,
        organizations: formData.organizations,
        status: 'active',
        notes: formData.case_notes,
        createDriveFolder: createDriveFolder && isConnected
      };
      const caseRes = await caseAPI.create(caseData, driveToken);
      const newCaseId = caseRes.data.case.id;
      const driveFolder = caseRes.data.driveFolder;
      if (uploadedFiles.length > 0) {
        if (!isConnected || !driveToken) {
          toast.error('Google Drive not connected. Documents cannot be uploaded.');
          toast.success('Case created successfully, but documents were not uploaded.');
        } else if (!driveFolder?.created) {
          const errorMsg = driveFolder?.error || 'Unknown error creating folder';
          toast.error(`Case folder creation failed: ${errorMsg}. Documents cannot be uploaded.`);
          toast.success('Case created successfully, but documents were not uploaded.');
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
            toast.success(`Case created successfully! ${uploadCount} document(s) uploaded.`);
          }
          if (failCount > 0) {
            toast.error(`${failCount} document(s) failed to upload.`);
          }
          if (uploadCount === 0 && failCount > 0) {
            toast.error('Case created but all document uploads failed.');
          }
        }
      } else {
        if (driveFolder?.created) {
          toast.success('Case created successfully with Google Drive folder!');
        } else if (driveFolder?.error && createDriveFolder) {
          toast.success('Case created successfully, but Google Drive folder creation failed.');
        } else {
          toast.success('Case created successfully!');
        }
      }
      navigate('/cases');
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(`Failed to create case: ${error.response.data.error}`);
      } else {
        toast.error(error.response?.data?.error || error.message || 'Failed to create case');
      }
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
          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon"><MdPerson /></span>
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
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                />
                {formData.contact_number && formData.contact_number.length !== 10 && (
                  <small style={{ color: 'red', fontSize: '0.8rem' }}>
                    Please enter exactly 10 digits
                  </small>
                )}
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

          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon"><MdGavel /></span>
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

            {formData.case_type === 'Other' && (
              <div className="form-group">
                <label htmlFor="case_type_other">
                  Please specify case type <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="case_type_other"
                  name="case_type_other"
                  value={formData.case_type_other}
                  onChange={handleInputChange}
                  placeholder="Enter specific case type"
                  required
                />
              </div>
            )}

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
                  <option value="Other">Other</option>
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

            {formData.case_resolution_type === 'Other' && (
              <div className="form-group">
                <label htmlFor="case_resolution_type_other">
                  Please specify resolution type <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="case_resolution_type_other"
                  name="case_resolution_type_other"
                  value={formData.case_resolution_type_other}
                  onChange={handleInputChange}
                  placeholder="Enter specific resolution type"
                  required
                />
              </div>
            )}

            {formData.court === 'Other' && (
              <div className="form-group">
                <label htmlFor="court_other">
                  Please specify court
                </label>
                <input
                  type="text"
                  id="court_other"
                  name="court_other"
                  value={formData.court_other}
                  onChange={handleInputChange}
                  placeholder="Enter specific court name"
                />
              </div>
            )}
          </div>

          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon"><MdPhone /></span>
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

          <div className="form-section-card">
            <div className="section-header-icon">
              <span className="icon"><MdAttachFile /></span>
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
                    <span className="file-name"><MdAttachFile style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="file-remove"
                    >
                      <MdClose />
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
                    <MdLink /> Connect Google Drive
                  </button>
                </div>
              )}
              {isConnected && (
                <p style={{ marginTop: '0.5rem', color: '#28a745', fontSize: '0.9rem' }}>
                  <MdCheckCircle style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Google Drive connected
                </p>
              )}
            </div>
          </div>

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
