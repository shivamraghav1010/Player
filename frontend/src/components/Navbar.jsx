import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, Upload, MessageCircle, Bell, LogOut } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      const notifications = response.data;
      const hasUnread = notifications.some(notification => !notification.isRead);
      setHasUnreadNotifications(hasUnread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, location.pathname]);

  const handleNotificationsClick = async () => {
    // Mark notifications as read when opening notifications
    try {
      await axios.put('http://localhost:5000/api/notifications/mark-read');
      setHasUnreadNotifications(false);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
    navigate('/notifications');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="logo">
        Athlete Platform
      </Link>

      <div className="nav-links">
        <Link to="/dashboard" title="Home">
          <Home size={24} />
        </Link>
        <Link to="/upload" title="Upload">
          <Upload size={24} />
        </Link>
        <Link to="/chat" title="AI Chat">
          <MessageCircle size={24} />
        </Link>
        <div className="notification-container" title="Notifications">
          <button onClick={handleNotificationsClick} className="notification-btn">
            <Bell size={24} />
            {hasUnreadNotifications && <span className="notification-dot"></span>}
          </button>
        </div>
        <Link to={`/profile/${user.id}`} title="Profile">
          <User size={24} />
        </Link>
        {user.role === 'admin' && (
          <Link to="/admin/sports" title="Manage Sports">
            ⚙️
          </Link>
        )}
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;