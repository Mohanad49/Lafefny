/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/flightBookingPopup.css';

const FlightBookingPopup = ({ flight, onClose, onBookingSuccess, userData }) => {
  const [credentials, setCredentials] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passportNumber: '',
    dateOfBirth: '',
    gender: '',
    countryCallingCode: '',
    issuanceCountry: '',
    nationality: '',
    expiryDate: '',
    birthPlace: '',
    issuanceLocation: '',
    issuanceDate: ''
  });
  
  const [errors, setErrors] = useState({});
  const [iataCodes, setIataCodes] = useState({
    issuanceCountry: '',
    birthPlace: '',
    issuanceLocation: '',
    nationality: ''
  });
  
  useEffect(() => {
    if (userData) {
      setCredentials(prev => ({
        ...prev,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        passportNumber: userData.passportNumber || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || '',
        countryCallingCode: userData.countryCallingCode || '',
        issuanceCountry: userData.issuanceCountry || '',
        nationality: userData.nationality || '',
        expiryDate: userData.expiryDate || '',
        birthPlace: userData.birthPlace || '',
        issuanceLocation: userData.issuanceLocation || '',
        issuanceDate: userData.issuanceDate || ''
      }));
    }
  }, [userData]);

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const expiryDate = new Date(credentials.expiryDate);
    const issuanceDate = new Date(credentials.issuanceDate);

    if (!credentials.expiryDate) {
      newErrors.expiryDate = 'Passport expiry date is required';
    } else if (expiryDate <= today) {
      newErrors.expiryDate = 'Passport must not be expired';
    }

    if (!credentials.birthPlace) {
      newErrors.birthPlace = 'Birth place is required';
    }

    if (!credentials.issuanceLocation) {
      newErrors.issuanceLocation = 'Passport issuance location is required';
    }

    if (!credentials.issuanceDate) {
      newErrors.issuanceDate = 'Passport issuance date is required';
    } else if (issuanceDate >= expiryDate) {
      newErrors.issuanceDate = 'Issuance date must be before expiry date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      if (!userData?.touristData?.[0]?.userID) {
        throw new Error('Tourist data not found');
      }
      const formattedData = {
        ...credentials,
        touristId: userData.touristData[0].userID,
        dateOfBirth: new Date(credentials.dateOfBirth).toISOString().split('T')[0],
      expiryDate: new Date(credentials.expiryDate).toISOString().split('T')[0],
      issuanceDate: new Date(credentials.issuanceDate).toISOString().split('T')[0]
      };

      // First, get the price offer
      const priceResponse = await axios.get('http://localhost:8000/amadeus/flight-price-offers', {
        params: { flightOfferId: JSON.stringify(flight) }
      });

      // Then book the flight with the complete flight offer and traveler details
      const bookingResponse = await axios.post('http://localhost:8000/amadeus/book-flight', {
        flightOffer: flight,
        traveler: formattedData
      });

      alert('Flight booked successfully');
      onBookingSuccess(bookingResponse.data);
      onClose();
    } catch (error) {
      console.error('Error booking flight:', error);
      alert(error.response?.data?.error || 'Failed to book flight');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Enter Your Details</h2>
        <form onSubmit={handleBooking} data-testid="booking-form">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstName" value={credentials.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" name="lastName" value={credentials.lastName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={credentials.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={credentials.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Passport Number</label>
            <input type="text" name="passportNumber" value={credentials.passportNumber} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={credentials.dateOfBirth} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={credentials.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Country Calling Code</label>
            <input type="text" name="countryCallingCode" value={credentials.countryCallingCode} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Issuance Country (two letter code) </label>
            <input type="text" name="issuanceCountry" value={credentials.issuanceCountry} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nationality (two letter code) </label>
            <input type="text" name="nationality" value={credentials.nationality} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Passport Expiry Date</label>
            <input 
              type="date" 
              name="expiryDate" 
              value={credentials.expiryDate} 
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required 
            />
            {errors.expiryDate && (
              <span className="error-message">{errors.expiryDate}</span>
            )}
          </div>
          <div className="form-group">
            <label>Birth City</label>
            <input 
              type="text" 
              name="birthPlace" 
              value={credentials.birthPlace} 
              onChange={handleChange} 
              required 
            />
            {errors.birthPlace && (
              <span className="error-message">{errors.birthPlace}</span>
            )}
          </div>
          <div className="form-group">
            <label>Passport Issuance City</label>
            <input 
              type="text" 
              name="issuanceLocation" 
              value={credentials.issuanceLocation} 
              onChange={handleChange} 
              required 
            />
            {errors.issuanceLocation && (
              <span className="error-message">{errors.issuanceLocation}</span>
            )}
          </div>
          <div className="form-group">
            <label>Passport Issuance Date</label>
            <input 
              type="date" 
              name="issuanceDate" 
              value={credentials.issuanceDate} 
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required 
            />
            {errors.issuanceDate && (
              <span className="error-message">{errors.issuanceDate}</span>
            )}
          </div>
          <div className="button-group">
            <button type="submit">Book Flight</button>
            <button type="button" className="close-button" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlightBookingPopup;
