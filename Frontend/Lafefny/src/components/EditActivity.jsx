/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivities, editActivity } from '../services/activityService';

const EditActivity = () => {
  const { id } = useParams(); // Get the activity ID from the URL
  const [activity, setActivity] = useState({});
  const navigate = useNavigate(); // To redirect after editing

  useEffect(() => {
    getActivities().then((response) => {
      const foundActivity = response.data.find((activity) => activity._id === id);
      setActivity(foundActivity);
    });
  }, [id]);

  const handleChange = (e) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editActivity(id, activity)
      .then(() => {
        alert('Activity updated successfully');
        navigate('/activities'); // Redirect to the activity list after editing
      })
      .catch((error) => console.error('Error updating activity:', error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" value={activity.name || ''} onChange={handleChange} />
      <input type="date" name="date" onChange={handleChange} />
      <input type="time" name="time" onChange={handleChange} />
      <input type="text" name="location" placeholder="Location" onChange={handleChange} />
      <input type="number" name="price" placeholder="Price" onChange={handleChange} />
      <input type="text" name="category" placeholder="Category" onChange={handleChange} />
      <input type="text" name="tags" placeholder="Tags (comma-separated)" onChange={handleChange} />
      <input type="text" name="specialDiscounts" placeholder="Special Discounts" onChange={handleChange} />
      <label>
        Booking Open:
        <input type="checkbox" name="bookingOpen" onChange={() => setActivity({ ...activity, bookingOpen: !activity.bookingOpen })} />
      </label>
      <button type="submit">Update Activity</button>
    </form>
  );
};

export default EditActivity;