/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivityById, updateActivity } from '../services/activityService';
import Map from './Map';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoieW91c3NlZm1lZGhhdGFzbHkiLCJhIjoiY2x3MmpyZzYzMHAxbDJxbXF0dDN1MGY2NSJ9.vrWqL8FrrRzm0yAfUNpu6g';

const EditActivity = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await getActivityById(id);
        console.log('Fetched activity data:', response); // For debugging
        const activityData = response.data;
        // Format the time properly
        if (activityData.time) {
          const [hours, minutes] = activityData.time.split(':');
          activityData.time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        setActivity(activityData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError('Failed to fetch activity data');
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setActivity(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateActivity(id, activity);
      alert('Activity updated successfully');
      navigate('/activities');
    } catch (error) {
      console.error('Error updating Activity:', error);
      alert('Failed to update activity');
    }
  };

  const handleLocationSelect = async (lng, lat) => {
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`);
      const data = await response.json();
      const address = data.features[0].place_name;
      setActivity(prevState => ({ ...prevState, location: address }));
    } catch (error) {
      console.error('Error fetching address:', error);
      setActivity(prevState => ({ ...prevState, location: `${lng},${lat}` }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!activity) return null;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Activity</h2>
      
      <div>
        <label htmlFor="name">Activity Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={activity.name || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={activity.date ? activity.date.split('T')[0] : ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="time">Time:</label>
        <input
          type="time"
          id="time"
          name="time"
          value={activity.time || ''}
          onChange={handleChange}
          required
        />
      </div>

      <Map onLocationSelect={handleLocationSelect} />
      <div>
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={activity.location || ''}
          onChange={handleChange}
          readOnly
        />
      </div>

      <div>
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={activity.price || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="category">Category:</label>
        <input
          type="text"
          id="category"
          name="category"
          value={activity.category || ''}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="tags">Tags (comma-separated):</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={activity.tags ? activity.tags.join(', ') : ''}
          onChange={(e) => setActivity({...activity, tags: e.target.value.split(',').map(tag => tag.trim())})}
        />
      </div>

      <div>
        <label htmlFor="specialDiscounts">Special Discounts:</label>
        <input
          type="text"
          id="specialDiscounts"
          name="specialDiscounts"
          value={activity.specialDiscounts || ''}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="bookingOpen">Booking Open:</label>
        <input
          type="checkbox"
          id="bookingOpen"
          name="bookingOpen"
          checked={activity.bookingOpen || false}
          onChange={handleCheckboxChange}
        />
      </div>

      <button type="submit">Update Activity</button>
    </form>
  );
};

export default EditActivity;