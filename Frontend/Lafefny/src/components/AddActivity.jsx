/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { addActivity } from '../services/activityService';
import Map from './Map';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoieW91c3NlZm1lZGhhdGFzbHkiLCJhIjoiY2x3MmpyZzYzMHAxbDJxbXF0dDN1MGY2NSJ9.vrWqL8FrrRzm0yAfUNpu6g';

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

  const handleLocationSelect = async (lng, lat) => {
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`);
      const data = await response.json();
      const address = data.features[0].place_name;
      setActivity({ ...activity, location: address });
    } catch (error) {
      console.error('Error fetching address:', error);
      setActivity({ ...activity, location: `${lng},${lat}` });
    }
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
      <input type="text" name="name" placeholder="Name" onChange={handleChange} value={activity.name} />
      <input type="date" name="date" onChange={handleChange} value={activity.date} />
      <input type="time" name="time" onChange={handleChange} value={activity.time} />
      <Map onLocationSelect={handleLocationSelect} />
      <input type="text" name="location" placeholder="Location" value={activity.location} readOnly />
      <input type="number" name="price" placeholder="Price" onChange={handleChange} value={activity.price} />
      <input type="text" name="category" placeholder="Category" onChange={handleChange} value={activity.category} />
      <input type="text" name="tags" placeholder="Tags (comma-separated)" onChange={handleChange} value={activity.tags} />
      <input type="text" name="specialDiscounts" placeholder="Special Discounts" onChange={handleChange} value={activity.specialDiscounts} />
      <label>
        Booking Open:
        <input type="checkbox" name="bookingOpen" onChange={() => setActivity({ ...activity, bookingOpen: !activity.bookingOpen })} checked={activity.bookingOpen} />
      </label>
      <button type="submit">Add Activity</button>
    </form>
  );
};

export default AddActivity;
