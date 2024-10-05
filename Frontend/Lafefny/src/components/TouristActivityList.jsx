/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActivities } from '../services/activityService';

const TouristActivityList = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getActivities().then((response) => setActivities(response.data));
  }, []);

  return (
    <div>
      <h2>Activity List</h2>
      <ul>
        {activities.map((activity) => (
          <li key={activity._id}>
            <h3>{activity.name}</h3>
            <p>Location: {activity.location}</p>
            <p>Date: {new Date(activity.date).toLocaleDateString()}</p>
            <p>Time: {activity.time}</p>
            <p>Price: {activity.price}</p>
            <p>Category: {activity.category}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TouristActivityList;
