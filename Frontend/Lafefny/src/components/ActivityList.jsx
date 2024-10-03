/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActivities, deleteActivity } from '../services/activityService';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getActivities().then((response) => setActivities(response.data));
  }, []);

  const handleDelete = (id) => {
    deleteActivity(id)
      .then(() => {
        setActivities(activities.filter((activity) => activity._id !== id));
      })
      .catch((error) => console.error('Error deleting activity:', error));
  };

  return (
    <div>
      <h2>Activity List</h2>
      <Link to="/add-activity">Add New Activity</Link> {/* Link to the add activity page */}
      <ul>
        {activities.map((activity) => (
          <li key={activity._id}>
            <h3>{activity.name}</h3>
            <p>Location: {activity.location}</p>
            <p>Date: {activity.date}</p>
            <p>Time: {activity.time}</p>
            <p>Price: {activity.price}</p>
            <p>Category: {activity.category}</p>
            <Link to={`/edit-activity/${activity._id}`} className="button">
                Edit
            </Link>
            <button className="button" onClick={() => handleDelete(activity._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
