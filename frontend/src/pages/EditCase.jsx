import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { caseAPI, beneficiaryAPI } from '../services/apiService';
import toast from 'react-hot-toast';
import { MdPerson, MdGavel, MdPhone } from 'react-icons/md';

const EditCase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);
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
    status: 'active'
  });

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const response = await caseAPI.getById(id);
      const caseInfo = response.data.case;
      setCaseData(caseInfo);
      
      // Pre-fill form with case data
      // Backend returns beneficiary fields as flat structure: beneficiary_name, contact_number, beneficiary_email, beneficiary_address, etc.
      // Also check if beneficiary object exists (for compatibility)
      const beneficiaryName = caseInfo.beneficiary_name || caseInfo.beneficiary?.name || '';
      const contactNumber = caseInfo.contact_number || caseInfo.beneficiary?.contact_number || '';
      const email = caseInfo.beneficiary_email || caseInfo.beneficiary?.email || '';
      const address = caseInfo.beneficiary_address || caseInfo.beneficiary?.address || '';
      const hasSmartphone = caseInfo.has_smartphone !== undefined ? caseInfo.has_smartphone : (caseInfo.beneficiary?.has_smartphone || false);
      const canRead = caseInfo.can_read !== undefined ? caseInfo.can_read : (caseInfo.beneficiary?.can_read || false);
      
      // Check if case_type, case_resolution_type, or court is "Other" and needs to be in _other field
      const standardCaseTypes = ['Domestic Violence', 'Child Custody', 'Property Dispute', 'Consumer Rights', 'Labor Rights', 'Sexual Harassment', 'Dowry Harassment'];
      const standardResolutionTypes = ['Litigation', 'Mediation', 'Arbitration', 'Legal Aid', 'Counseling'];
      const standardCourts = ['District Court Delhi', 'High Court Delhi', 'Family Court', 'Consumer Court', 'Sessions Court'];
      
      const caseType = caseInfo.case_type || '';
      const resolutionType = caseInfo.case_resolution_type || '';
      const court = caseInfo.court || '';
      
      setFormData({
        beneficiary_name: beneficiaryName,
        contact_number: contactNumber,
        email: email,
        address: address,
        has_smartphone: hasSmartphone ? 'yes' : 'no',
        can_read: canRead ? 'yes' : 'no',
        case_type: standardCaseTypes.includes(caseType) ? caseType : (caseType ? 'Other' : ''),
        case_type_other: standardCaseTypes.includes(caseType) ? '' : caseType,
        case_title: caseInfo.case_title || '',
        case_resolution_type: standardResolutionTypes.includes(resolutionType) ? resolutionType : (resolutionType ? 'Other' : ''),
        case_resolution_type_other: standardResolutionTypes.includes(resolutionType) ? '' : resolutionType,
        court: standardCourts.includes(court) ? court : (court ? 'Other' : ''),
        court_other: standardCourts.includes(court) ? '' : court,
        organizations: Array.isArray(caseInfo.organizations) ? caseInfo.organizations : [],
        case_notes: caseInfo.notes || '',
        status: caseInfo.status || 'active'
      });
    } catch (error) {
      toast.error('Failed to load case details');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

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
      // Update beneficiary if beneficiary_id exists
      const beneficiaryId = caseData.beneficiary_id || caseData.beneficiary?.id;
      if (beneficiaryId) {
        const beneficiaryUpdateData = {
          name: formData.beneficiary_name,
          contact_number: formData.contact_number,
          email: formData.email,
          address: formData.address,
          has_smartphone: formData.has_smartphone === 'yes',
          can_read: formData.can_read === 'yes',
          date_of_filing: caseData.beneficiary?.date_of_filing || caseData.date_of_filing || new Date().toISOString().split('T')[0]
        };
        await beneficiaryAPI.update(beneficiaryId, beneficiaryUpdateData);
      }
      
      // Update case
      const caseUpdateData = {
        case_type: formData.case_type === 'Other' ? formData.case_type_other : formData.case_type,
        case_title: formData.case_title,
        case_resolution_type: formData.case_resolution_type === 'Other' ? formData.case_resolution_type_other : formData.case_resolution_type,
        court: formData.court === 'Other' ? formData.court_other : formData.court,
        organizations: formData.organizations,
        status: formData.status,
        notes: formData.case_notes
      };
      
      await caseAPI.update(id, caseUpdateData);
      toast.success('Case updated successfully');
      
      // Dispatch custom event to notify other pages to refresh
      window.dispatchEvent(new CustomEvent('caseUpdated', { 
        detail: { caseId: id, updated: true } 
      }));
      
      navigate(`/cases/${id}`);
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(`Failed to update case: ${error.response.data.error}`);
      } else {
        toast.error(error.response?.data?.error || error.message || 'Failed to update case');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !caseData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading case details...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Case not found</p>
          <button onClick={() => navigate('/cases')} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header-with-back">
          <button onClick={() => navigate(`/cases/${id}`)} className="btn-back">
            ← Back
          </button>
          <div>
            <h1>Edit Case</h1>
            <p>Update case details</p>
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
                  <small className="error-text">
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

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="case_notes">Case Notes</label>
              <textarea
                id="case_notes"
                name="case_notes"
                value={formData.case_notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Additional notes about the case..."
              />
            </div>
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

          <div className="form-actions-new">
            <button type="button" onClick={() => navigate(`/cases/${id}`)} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? 'Updating...' : 'Update Case'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditCase;

