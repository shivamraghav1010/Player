import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const AdminSports = () => {
  const { user } = useAuth();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sports/admin');
      setSports(response.data);
    } catch (error) {
      console.error('Error fetching sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingSport) {
        await axios.put(`http://localhost:5000/api/sports/${editingSport._id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/sports', formData);
      }

      setFormData({
        name: '',
        description: '',
        icon: '',
        order: 0,
        isActive: true,
      });
      setShowCreateForm(false);
      setEditingSport(null);
      fetchSports();
    } catch (error) {
      console.error('Error saving sport:', error);
      alert(error.response?.data?.message || 'Error saving sport');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      description: sport.description,
      icon: sport.icon,
      order: sport.order,
      isActive: sport.isActive,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sport?')) {
      try {
        await axios.delete(`http://localhost:5000/api/sports/${id}`);
        fetchSports();
      } catch (error) {
        console.error('Error deleting sport:', error);
        alert('Error deleting sport');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingSport(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      order: 0,
      isActive: true,
    });
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading sports...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Sports Management</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn btn-secondary"
                style={{ fontSize: '14px' }}
              >
                {showCreateForm ? 'Cancel' : (editingSport ? 'Cancel Edit' : 'Add Sport')}
              </button>
            </div>
          </div>
          <div className="card-content">
            {showCreateForm && (
              <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', background: '#f8f8f8', borderRadius: '3px' }}>
                <h3 style={{ marginBottom: '16px' }}>{editingSport ? 'Edit Sport' : 'Add New Sport'}</h3>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Sport name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Sport description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Icon (emoji or URL)</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="🏃‍♂️ or icon URL"
                  />
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActive"
                  />
                  <label htmlFor="isActive" style={{ margin: 0 }}>Active</label>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="submit"
                    className="btn"
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.6 : 1 }}
                  >
                    {submitting ? 'Saving...' : (editingSport ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {sports.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8e8e8e', margin: '40px 0' }}>
                No sports configured yet.
              </p>
            ) : (
              <div>
                {sports.map(sport => (
                  <div key={sport._id} style={{
                    borderBottom: '1px solid #dbdbdb',
                    padding: '16px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{sport.icon || '🏃‍♂️'}</span>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>{sport.name}</h3>
                        {!sport.isActive && (
                          <span style={{
                            background: '#ffebee',
                            color: '#c62828',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            Inactive
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#262626' }}>{sport.description}</p>
                      <p style={{
                        margin: 0,
                        color: '#8e8e8e',
                        fontSize: '12px'
                      }}>
                        Order: {sport.order} • Created: {new Date(sport.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(sport)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sport._id)}
                        className="btn-danger"
                        style={{ fontSize: '12px', padding: '4px 8px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSports;