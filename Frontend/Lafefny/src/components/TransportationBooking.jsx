/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/transportationBooking.css';

const TransportationBooking = () => {
  const [formData, setFormData] = useState({
    type: '',
    providerName: '',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: '',
    arrivalDate: '',
    numberOfPassengers: 1,
    price: 0
  });
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get('http://localhost:8000/tourist/advertisers');
        
        setProviders(response.data);
      } catch (err) {
        setError('Failed to fetch transportation providers');
      }
    };
    fetchProviders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userID');

    try {
      await axios.post(`http://localhost:8000/tourist/${userId}/transportation-booking`, formData);
      setSuccess('Transportation booked successfully!');
      setError('');
      // Reset form
      setFormData({
        type: '',
        providerName: '',
        departureLocation: '',
        arrivalLocation: '',
        departureDate: '',
        arrivalDate: '',
        numberOfPassengers: 1,
        price: 0
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book transportation');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="transportation-booking-container">
      <h2>Book Transportation</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="transportation-booking-form">
        <div className="transportation-form-group">
          <label>Transportation Type:</label>
          <select 
            name="type" 
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Car">Car</option>
            <option value="Bus">Bus</option>
            <option value="Train">Train</option>
          </select>
        </div>

        <div className="transportation-form-group">
          <label>Provider:</label>
          <select 
            name="providerName" 
            value={formData.providerName}
            onChange={handleChange}
            required
          >
            <option value="">Select Provider</option>
            {providers.map(provider => (
              <option key={provider._id} value={provider.company}>
                {provider.company}
              </option>
            ))}
          </select>
        </div>

        <div className="transportation-form-group">
          <label>Departure Location:</label>
          <input
            type="text"
            name="departureLocation"
            value={formData.departureLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="transportation-form-group">
          <label>Arrival Location:</label>
          <input
            type="text"
            name="arrivalLocation"
            value={formData.arrivalLocation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="transportation-form-group">
          <label>Departure Date:</label>
          <input
            type="datetime-local"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="transportation-form-group">
          <label>Arrival Date:</label>
          <input
            type="datetime-local"
            name="arrivalDate"
            value={formData.arrivalDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="transportation-form-group">
          <label>Number of Passengers:</label>
          <input
            type="number"
            name="numberOfPassengers"
            value={formData.numberOfPassengers}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="transportation-form-group">
          <label>Price (EGP):</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        <button type="submit">Book Transportation</button>
      </form>
    </div>
  );
};

export default TransportationBooking; 