import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { beneficiaryAPI } from '../services/apiService';
import toast from 'react-hot-toast';

const Beneficiaries = () => {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getAll();
      setBeneficiaries(response.data.beneficiaries);
    } catch (error) {
      toast.error('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const viewBeneficiary = async (id) => {
    try {
      const response = await beneficiaryAPI.getById(id);
      setSelectedBeneficiary(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load beneficiary details');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      active: 'badge-active',
      pending: 'badge-pending',
      urgent: 'badge-urgent',
      resolved: 'badge-resolved'
    };
    return statusClasses[status] || 'badge-default';
  };

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading beneficiaries...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Beneficiaries</h1>
            <p>Manage beneficiary information</p>
          </div>
        </div>

        <div className="beneficiaries-grid">
          {beneficiaries.map((beneficiary) => (
            <div 
              key={beneficiary.id} 
              className="beneficiary-card clickable-card"
              onClick={() => viewBeneficiary(beneficiary.id)}
            >
              <div className="beneficiary-header">
                <h3>{beneficiary.name}</h3>
                <div className="beneficiary-tags">
                  {beneficiary.has_smartphone && (
                    <span className="tag tag-smartphone">📱 Smartphone</span>
                  )}
                  {beneficiary.can_read && (
                    <span className="tag tag-literate">📖 Can Read</span>
                  )}
                </div>
              </div>
              
              <div className="beneficiary-info">
                <p><strong>Contact:</strong> {beneficiary.contact_number || 'N/A'}</p>
                <p><strong>Email:</strong> {beneficiary.email || 'N/A'}</p>
                <p><strong>Date of Filing:</strong> {formatDate(beneficiary.date_of_filing)}</p>
                <p><strong>Address:</strong> {beneficiary.address || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>

        {showModal && selectedBeneficiary && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedBeneficiary.beneficiary.name}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <p><strong>Phone:</strong> {selectedBeneficiary.beneficiary.contact_number}</p>
                  <p><strong>Email:</strong> {selectedBeneficiary.beneficiary.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedBeneficiary.beneficiary.address}</p>
                </div>

                <div className="detail-section">
                  <h3>Communication Preferences</h3>
                  <p><strong>Has Smartphone:</strong> {selectedBeneficiary.beneficiary.has_smartphone ? 'Yes' : 'No'}</p>
                  <p><strong>Can Read:</strong> {selectedBeneficiary.beneficiary.can_read ? 'Yes' : 'No'}</p>
                </div>

                <div className="detail-section">
                  <h3>Associated Cases ({selectedBeneficiary.cases.length})</h3>
                  {selectedBeneficiary.cases.length === 0 ? (
                    <p className="text-secondary">No cases associated</p>
                  ) : (
                    <div className="beneficiary-cases-list">
                      {selectedBeneficiary.cases.map((caseItem) => (
                        <div 
                          key={caseItem.id} 
                          className="case-item-card clickable-card"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(false);
                            navigate(`/cases/${caseItem.id}`);
                          }}
                        >
                          <div className="case-item-header">
                            <strong>{caseItem.case_code}</strong>
                            <span className={`badge ${getStatusBadgeClass(caseItem.status)}`}>
                              {caseItem.status}
                            </span>
                          </div>
                          <p className="case-item-type">{caseItem.case_type}</p>
                          <p className="case-item-title">{caseItem.case_title}</p>
                          <div className="case-item-meta">
                            <span>📅 {formatDate(caseItem.created_at)}</span>
                            <span>⚖️ {caseItem.court}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Beneficiaries;
