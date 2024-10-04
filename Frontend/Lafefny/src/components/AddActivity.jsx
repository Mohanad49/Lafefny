// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { addActivity } from '../services/activityService';

const AddActivity = () => {
  const [activity, setActivity] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    price: '',
    category: '',
    tags: '',
    specialDiscounts: '',
    bookingOpen: false,
  });

  const handleChange = (e) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addActivity(activity)
      .then(() => alert('Activity added successfully'))
      .catch((error) => console.error('Error adding activity:', error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Activity</h2>
      <input type="text" name="name" placeholder="Name" onChange={handleChange} />
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
      <button type="submit">Add Activity</button>
    </form>
  );
};

export default AddActivity;
