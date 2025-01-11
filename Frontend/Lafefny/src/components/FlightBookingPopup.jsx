/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/flightBookingPopup.css';
import { X, Plane, BookOpen } from 'lucide-react';

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

  const handleSubmit = async (e) => {
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
      const priceResponse = await axios.get(`${import.meta.env.VITE_API_URL}/amadeus/flight-price-offers`, {
        params: { flightOfferId: JSON.stringify(flight) }
      });

      // Then book the flight with the complete flight offer and traveler details
      const bookingResponse = await axios.post(`${import.meta.env.VITE_API_URL}/amadeus/book-flight`, {
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Flight Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Plane className="text-primary h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-800">Flight Details</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">{flight.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">{flight.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{flight.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">{flight.price}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={credentials.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={credentials.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="countryCallingCode"
                    value={credentials.countryCallingCode}
                    onChange={handleChange}
                    placeholder="+1"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={credentials.phone}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="text-primary h-5 w-5" />
                <h3 className="text-lg font-semibold text-gray-800">Passport Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={credentials.passportNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={credentials.nationality}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={credentials.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={credentials.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Book Flight
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingPopup;
