import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { beneficiaryAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const EditBeneficiary = () => {
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [beneficiary, setBeneficiary] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    email: '',
    address: '',
    has_smartphone: false,
    can_read: false,
    date_of_filing: ''
  });

  useEffect(() => {
    fetchBeneficiary();
  }, [beneficiaryId]);

  const fetchBeneficiary = async () => {
    try {
      const response = await beneficiaryAPI.getById(beneficiaryId);
      const beneficiaryData = response.data.beneficiary;
      setBeneficiary(beneficiaryData);
      setFormData({
        name: beneficiaryData.name || '',
        contact_number: beneficiaryData.contact_number || '',
        email: beneficiaryData.email || '',
        address: beneficiaryData.address || '',
        has_smartphone: beneficiaryData.has_smartphone || false,
        can_read: beneficiaryData.can_read || false,
        date_of_filing: beneficiaryData.date_of_filing ? beneficiaryData.date_of_filing.split('T')[0] : ''
      });
    } catch (error) {
      toast.error('Failed to load beneficiary details');
      navigate('/beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await beneficiaryAPI.update(beneficiaryId, formData);
      toast.success('Beneficiary updated successfully');
      navigate('/beneficiaries');
    } catch (error) {
      toast.error('Failed to update beneficiary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading beneficiary details...</p>
      </div>
    );
  }

  if (!beneficiary) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p>Beneficiary not found</p>
          <button onClick={() => navigate('/beneficiaries')} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-with-back">
        <button onClick={() => navigate('/beneficiaries')} className="btn-back">
          ← Back
        </button>
        <div>
          <h1>Edit Beneficiary</h1>
          <p>Update beneficiary information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="case-form-new">
        <div className="form-section-card">
          <div className="section-header-icon">
            <span className="icon">👤</span>
            <h2>Personal Information</h2>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact_number">Contact Number *</label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date_of_filing">Date of Filing</label>
              <input
                type="date"
                id="date_of_filing"
                name="date_of_filing"
                value={formData.date_of_filing}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-section-card">
          <div className="section-header-icon">
            <span className="icon">📱</span>
            <h2>Communication Preferences</h2>
          </div>

          <div className="form-group">
            <label className="checkbox-label-new">
              <input
                type="checkbox"
                name="has_smartphone"
                checked={formData.has_smartphone}
                onChange={handleInputChange}
              />
              <span>Has Smartphone</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label-new">
              <input
                type="checkbox"
                name="can_read"
                checked={formData.can_read}
                onChange={handleInputChange}
              />
              <span>Can Read</span>
            </label>
          </div>
        </div>

        <div className="form-actions-new">
          <button type="button" onClick={() => navigate('/beneficiaries')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-create" disabled={loading}>
            {loading ? 'Updating...' : 'Update Beneficiary'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBeneficiary;