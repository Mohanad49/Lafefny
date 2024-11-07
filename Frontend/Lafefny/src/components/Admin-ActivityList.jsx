import React, { useState, useEffect } from 'react';
import { getActivities, updateActivityInappropriateFlag } from '../services/activityService';
import '../styles/ActivityList.css';

const AdminActivityList = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await getActivities();
      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  const toggleInappropriateFlag = async (id, currentFlag) => {
    try {
      await updateActivityInappropriateFlag(id, !currentFlag);
      fetchActivities();
    } catch (error) {
      console.error('Error toggling inappropriate flag:', error);
    }
  };

  return (
    <div className="activity-list-container">
      <h2>Admin Activity List</h2>
      <ul className="activity-list">
        {activities.map((activity) => (
          <li key={activity._id} className="activity-item">
            <div className="activity-card">
              <h3>{activity.name}</h3>
              <p>Location: {activity.location}</p>
              <p>Price: ${activity.price}</p>
              <div className="activity-actions">
                <button
                  className="toggle-inappropriate-button"
                  onClick={() => toggleInappropriateFlag(activity._id, activity.inappropriateFlag)}
                >
                  {activity.inappropriateFlag ? 'Appropriate' : 'Inappropriate'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminActivityList; 