import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
    markNotificationsAsRead();
  }, []);

  const markNotificationsAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/mark-read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/notifications', formData);
      setFormData({
        title: '',
        message: '',
        type: 'general',
        targetAudience: 'all',
      });
      setShowCreateForm(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`http://localhost:5000/api/notifications/${id}`);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading notifications...</div>
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
              <h2>Notifications</h2>
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px' }}
                >
                  {showCreateForm ? 'Cancel' : 'Create Notification'}
                </button>
              )}
            </div>
          </div>
          <div className="card-content">
            {user.role === 'admin' && showCreateForm && (
              <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', background: '#f8f8f8', borderRadius: '3px' }}>
                <h3 style={{ marginBottom: '16px' }}>Create New Notification</h3>

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Notification title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Notification message"
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="general">General</option>
                    <option value="tournament">Tournament</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Audience</label>
                  <select name="targetAudience" value={formData.targetAudience} onChange={handleInputChange}>
                    <option value="all">All Users</option>
                    <option value="athletes">Athletes Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Creating...' : 'Create Notification'}
                </button>
              </form>
            )}

            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8e8e8e', margin: '40px 0' }}>
                No notifications yet.
              </p>
            ) : (
              <div>
                {notifications.map(notification => (
                  <div key={notification._id} style={{
                    borderBottom: '1px solid #dbdbdb',
                    padding: '16px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>{notification.title}</h3>
                        <span style={{
                          background: notification.type === 'tournament' ? '#e3f2fd' : '#f3e5f5',
                          color: notification.type === 'tournament' ? '#1976d2' : '#7b1fa2',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {notification.type}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', color: '#262626' }}>{notification.message}</p>
                      <p style={{
                        margin: 0,
                        color: '#8e8e8e',
                        fontSize: '12px'
                      }}>
                        {new Date(notification.createdAt).toLocaleDateString()} •
                        By {notification.createdBy.username}
                      </p>
                    </div>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="btn-danger"
                        style={{ fontSize: '12px', padding: '4px 8px', marginLeft: '16px' }}
                      >
                        Delete
                      </button>
                    )}
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

export default Notifications;