import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:8000/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-bell">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        🔔 {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.read ? 'unread' : ''} ${
                  notification.type === 'OUT_OF_STOCK' ? 'out-of-stock' : 
                  notification.type === 'EVENT_REMINDER' ? 'event-reminder' : ''
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;