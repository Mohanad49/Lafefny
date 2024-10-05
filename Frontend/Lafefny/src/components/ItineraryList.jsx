/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItineraries, deleteItinerary } from '../services/itineraryService';
import '../styles/itineraryList.css';

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preference, setPreference] = useState('');
  const [language, setLanguage] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, minBudget, maxBudget, startDate, endDate, preference, language, sortBy]);

  const fetchItineraries = async () => {
    try {
      const response = await getItineraries(searchTerm, minBudget, maxBudget, startDate, endDate, preference, language, sortBy);
      setItineraries(response.data);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItinerary(id);
      fetchItineraries(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  return (
    <div className="itinerary-list-container">
      <h2>Itinerary List</h2>
      <Link to="/add-itinerary" className="add-itinerary-button">Add New Itinerary</Link>

      <div className="controls">
        <input
          type="text"
          placeholder="Search itineraries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <input
          type="number"
          placeholder="Min Budget"
          value={minBudget}
          onChange={(e) => setMinBudget(e.target.value)}
          className="budget-input"
        />
        <input
          type="number"
          placeholder="Max Budget"
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          className="budget-input"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-input"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-input"
        />
        <input
          type="text"
          placeholder="Preference"
          value={preference}
          onChange={(e) => setPreference(e.target.value)}
          className="preference-input"
        />
        <input
          type="text"
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      <ul className="itinerary-list">
        {itineraries.map((itinerary) => (
          <li key={itinerary._id} className="itinerary-item">
            <h3>{itinerary.name}</h3>
            <p>Start Date: {itinerary.startDate}</p>
            <p>End Date: {itinerary.endDate}</p>
            <p>Budget: ${itinerary.budget}</p>
            <p>Preference: {itinerary.preference}</p>
            <p>Language: {itinerary.language}</p>
            <div className="itinerary-actions">
              <Link to={`/view-itinerary/${itinerary._id}`} className="view-button">View</Link>
              <Link to={`/edit-itinerary/${itinerary._id}`} className="itinerary-edit-button">Edit</Link>
              <button className="delete-button" onClick={() => handleDelete(itinerary._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItineraryList;