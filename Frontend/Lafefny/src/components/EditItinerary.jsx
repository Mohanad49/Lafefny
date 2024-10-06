/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItinerary, editItinerary } from '../services/itineraryService';
import '../styles/edit-Itinerary.css'; 

const EditItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState({
    name: '',
    activities: [],
    locations: [],
    timeline: [],
    duration: [],
    language: '',
    price: 0,
    availableDates: [],
    accessibility: '',
    pickUpLocation: '',
    dropOffLocation: '',
    ratings: 0,
    preferences: '',
  });

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await getItinerary(id);
        setItinerary(response.data);
      } catch (error) {
        console.error('Error fetching itinerary:', error);
      }
    };
    fetchItinerary();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, index, field) => {
    const newArray = [...itinerary[field]];
    newArray[index] = e.target.value;
    setItinerary(prev => ({ ...prev, [field]: newArray }));
  };

  const handleDateChange = (e, index) => {
    const newDates = [...itinerary.availableDates];
    newDates[index] = e.target.value;
    setItinerary(prev => ({ ...prev, availableDates: newDates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await editItinerary(id, itinerary);
      alert('Itinerary updated successfully');
      navigate('/itineraries');
    } catch (error) {
      console.error('Error updating itinerary:', error);
    }
  };

  return (
    <div className="edit-itinerary-container">
      <h2>Edit Itinerary</h2>
      <form onSubmit={handleSubmit} className="edit-itinerary-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Itinerary Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={itinerary.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              value={itinerary.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <input
              id="language"
              type="text"
              name="language"
              value={itinerary.language}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="accessibility">Accessibility</label>
            <input
              id="accessibility"
              type="text"
              name="accessibility"
              value={itinerary.accessibility}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pickUpLocation">Pick Up Location</label>
            <input
              id="pickUpLocation"
              type="text"
              name="pickUpLocation"
              value={itinerary.pickUpLocation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dropOffLocation">Drop Off Location</label>
            <input
              id="dropOffLocation"
              type="text"
              name="dropOffLocation"
              value={itinerary.dropOffLocation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ratings">Ratings</label>
            <input
              id="ratings"
              type="number"
              name="ratings"
              value={itinerary.ratings}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="preferences">Preferences</label>
            <input
              id="preferences"
              type="text"
              name="preferences"
              value={itinerary.preferences}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="array-inputs">
          {['activities', 'locations', 'timeline'].map((field) => (
            <div key={field} className="array-group">
              <h3>{field.charAt(0).toUpperCase() + field.slice(1)}</h3>
              {itinerary[field].map((item, index) => (
                <input
                  key={index}
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(e, index, field)}
                  placeholder={`${field.slice(0, -1)} ${index + 1}`}
                />
              ))}
            </div>
          ))}

          <div className="array-group">
            <h3>Duration (hours)</h3>
            {itinerary.duration.map((hours, index) => (
              <input
                key={index}
                type="number"
                value={hours}
                onChange={(e) => handleArrayChange(e, index, 'duration')}
                placeholder={`Duration ${index + 1}`}
              />
            ))}
          </div>

          <div className="array-group">
            <h3>Available Dates</h3>
            {itinerary.availableDates.map((date, index) => (
              <input
                key={index}
                type="date"
                value={date.split('T')[0]}
                onChange={(e) => handleDateChange(e, index)}
              />
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">Update Itinerary</button>
      </form>
    </div>
  );
};

export default EditItinerary;