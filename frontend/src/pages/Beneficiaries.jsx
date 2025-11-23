import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { beneficiaryAPI } from '../services/apiService';
import toast from 'react-hot-toast';
import { MdEdit, MdDelete, MdPhone, MdEmail, MdLocationOn, MdCalendarToday, MdPhoneAndroid, MdMenuBook, MdSearch } from 'react-icons/md';

const Beneficiaries = () => {
  const navigate = useNavigate();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchQuery, beneficiaries]);

  const fetchBeneficiaries = async () => {
    try {
      const response = await beneficiaryAPI.getAll();
      setBeneficiaries(response.data.beneficiaries);
      setFilteredBeneficiaries(response.data.beneficiaries);
    } catch (error) {
      toast.error('Failed to load beneficiaries');
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredBeneficiaries(beneficiaries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = beneficiaries.filter(beneficiary => 
      beneficiary.name?.toLowerCase().includes(query) ||
      beneficiary.contact_number?.includes(query) ||
      beneficiary.email?.toLowerCase().includes(query) ||
      beneficiary.address?.toLowerCase().includes(query) ||
      beneficiary.cases?.some(c => c.case_code?.toLowerCase().includes(query))
    );
    setFilteredBeneficiaries(filtered);
  };

  const deleteBeneficiary = async (beneficiaryId, beneficiaryName) => {
    if (window.confirm(`Are you sure you want to delete ${beneficiaryName}? This will also delete all associated cases and cannot be undone.`)) {
      try {
        await beneficiaryAPI.delete(beneficiaryId);
        toast.success('Beneficiary deleted successfully');
        fetchBeneficiaries(); // Refresh the list
        setShowModal(false); // Close modal if open
      } catch (error) {
        toast.error('Failed to delete beneficiary');
      }
    }
  };

  const editBeneficiary = (beneficiaryId) => {
    setShowModal(false);
    navigate(`/edit-beneficiary/${beneficiaryId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    // Format 10-digit number as XXXXX XXXXX
    if (phone.length === 10) {
      return `${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
  };

  const viewBeneficiary = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowModal(true);
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

  const navigateToCase = (caseId) => {
    setShowModal(false);
    navigate(`/cases/${caseId}`);
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

        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-bar">
            <span className="search-icon-input"><MdSearch /></span>
            <input
              type="text"
              placeholder="Search by name, phone, email, address, or case code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="cases-count" style={{ marginTop: '1rem' }}>
          <p>Showing {filteredBeneficiaries.length} of {beneficiaries.length} beneficiaries</p>
        </div>

        <div className="beneficiaries-grid">
          {filteredBeneficiaries.length === 0 ? (
            <div className="empty-state">
              <p>No beneficiaries found matching your search</p>
            </div>
          ) : (
            filteredBeneficiaries.map((beneficiary) => (
              <div 
                key={beneficiary.id} 
                className="beneficiary-card clickable-card"
                onClick={() => viewBeneficiary(beneficiary)}
              >
                <div className="beneficiary-header">
                  <h3>{beneficiary.name}</h3>
                  <div className="card-action-buttons">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editBeneficiary(beneficiary.id);
                      }}
                      className="card-action-btn edit-btn"
                      title="Edit Beneficiary"
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBeneficiary(beneficiary.id, beneficiary.name);
                      }}
                      className="card-action-btn delete-btn"
                      title="Delete Beneficiary"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
                
                <div className="beneficiary-tags">
                  {beneficiary.has_smartphone && (
                    <span className="tag tag-smartphone"><MdPhoneAndroid /> Smartphone</span>
                  )}
                  {beneficiary.can_read && (
                    <span className="tag tag-literate"><MdMenuBook /> Can Read</span>
                  )}
                </div>
                
                <div className="beneficiary-info">
                  <p><strong>Contact:</strong> {formatPhoneNumber(beneficiary.contact_number)}</p>
                  <p><strong>Email:</strong> {beneficiary.email || 'N/A'}</p>
                  <p><strong>Date of Filing:</strong> {formatDate(beneficiary.date_of_filing)}</p>
                  <p><strong>Address:</strong> {beneficiary.address || 'N/A'}</p>
                  
                  {/* Show case count */}
                  <div className="beneficiary-cases-summary" style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Cases: {beneficiary.cases.length}</strong>
                    {beneficiary.cases.length > 0 && (
                      <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                        {beneficiary.cases.map(c => c.case_code).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && selectedBeneficiary && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedBeneficiary.name}</h2>
                <button onClick={() => setShowModal(false)} className="modal-close">×</button>
              </div>
              
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Contact Information</h3>
                  <p><MdPhone style={{ verticalAlign: 'middle', marginRight: '8px' }} /><strong>Phone:</strong> {formatPhoneNumber(selectedBeneficiary.contact_number)}</p>
                  <p><MdEmail style={{ verticalAlign: 'middle', marginRight: '8px' }} /><strong>Email:</strong> {selectedBeneficiary.email || 'N/A'}</p>
                  <p><MdLocationOn style={{ verticalAlign: 'middle', marginRight: '8px' }} /><strong>Address:</strong> {selectedBeneficiary.address || 'N/A'}</p>
                </div>

                <div className="detail-section">
                  <h3>Communication Preferences</h3>
                  <p><strong>Has Smartphone:</strong> {selectedBeneficiary.has_smartphone ? 'Yes' : 'No'}</p>
                  <p><strong>Can Read:</strong> {selectedBeneficiary.can_read ? 'Yes' : 'No'}</p>
                  <p><MdCalendarToday style={{ verticalAlign: 'middle', marginRight: '8px' }} /><strong>Date of Filing:</strong> {formatDate(selectedBeneficiary.date_of_filing)}</p>
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
                            navigateToCase(caseItem.id);
                          }}
                          style={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '8px', 
                            padding: '12px', 
                            marginBottom: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div className="case-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#2c5aa0' }}>{caseItem.case_code}</strong>
                            <span className={`badge ${getStatusBadgeClass(caseItem.status)}`}>
                              {caseItem.status}
                            </span>
                          </div>
                          <p className="case-item-type" style={{ margin: '4px 0', fontWeight: '500', color: '#555' }}>
                            {caseItem.case_type}
                          </p>
                          <p className="case-item-title" style={{ margin: '4px 0', fontSize: '0.9rem', color: '#777' }}>
                            {caseItem.case_title}
                          </p>
                          <div className="case-item-meta" style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                            <span style={{ marginRight: '15px' }}>📅 {formatDate(caseItem.created_at)}</span>
                            {caseItem.court && <span>⚖️ {caseItem.court}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
                  <button 
                    onClick={() => {
                      // Pre-fill the form with beneficiary data and navigate to new case
                      const beneficiaryData = {
                        beneficiary_name: selectedBeneficiary.name,
                        contact_number: selectedBeneficiary.contact_number?.replace(/\D/g, '').slice(-10) || '',
                        email: selectedBeneficiary.email || '',
                        address: selectedBeneficiary.address || '',
                        has_smartphone: selectedBeneficiary.has_smartphone ? 'yes' : 'no',
                        can_read: selectedBeneficiary.can_read ? 'yes' : 'no'
                      };
                      
                      // Store beneficiary data in sessionStorage for the NewCase form
                      sessionStorage.setItem('prefillBeneficiaryData', JSON.stringify(beneficiaryData));
                      setShowModal(false);
                      navigate('/new-case');
                    }} 
                    className="btn btn-primary"
                    style={{ marginRight: '10px' }}
                  >
                    Add New Case for {selectedBeneficiary.name}
                  </button>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
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
