/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getActivityById } from '../services/activityService'; // Create this service function to fetch activity by ID
import '../styles/activityList.css';

const ActivityDetail = () => {
  const { id } = useParams(); // Get the activity ID from the URL
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await getActivityById(id); // Fetch activity by ID
        setActivity(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch activity details');
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  if (loading) return <p>Loading activity details...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="activity-detail">
      <h1 className="activity-item-title">{activity.name}</h1>
      <div className="activity-item">
        <p className="yellow-text">Category: {activity.category}</p>
        <p className="yellow-text">Date: {new Date(activity.date).toLocaleDateString()}</p>
        <p className="yellow-text">Time: {activity.time}</p>
        <p className="yellow-text">Location: {activity.location}</p>
        <p className="yellow-text">Price: {activity.price} EGP</p>
        <p className="yellow-text">Rating: {activity.ratings?.averageRating || 'Not rated'}</p>
        <p className="yellow-text">Tags: {activity.tags?.length ? activity.tags.join(', ') : 'No tags available'}</p>
        {activity.specialDiscounts && (
          <p className="yellow-text">Special Discounts: {activity.specialDiscounts}</p>
        )}
        <p className="yellow-text">Booking: {activity.bookingOpen ? 'Open' : 'Closed'}</p>
      </div>
    </div>
  );
};

export default ActivityDetail; 