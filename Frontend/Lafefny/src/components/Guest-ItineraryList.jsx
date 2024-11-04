/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItineraries } from '../services/itineraryService';
import '../styles/ItineraryList.css';

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, filterType, filterValue, sortBy]);

  const fetchItineraries = async () => {
    try {
      const response = await getItineraries({
        search: searchTerm,
        filterType,
        filterValue,
        sortBy,
      });
      console.log('Fetched itineraries:', response.data);
      setItineraries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setItineraries([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  // Filter itineraries locally after fetching
  const filteredItineraries = itineraries
    .filter(itinerary => {
      if (!itinerary) return false;
      const nameMatch = itinerary.name && itinerary.name.toLowerCase().includes(searchTerm.toLowerCase());
      const activityMatch = itinerary.activities && itinerary.activities.some(activity => 
        activity && activity.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const locationMatch = itinerary.locations && itinerary.locations.some(location => 
        location && location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return nameMatch || activityMatch || locationMatch;
    })
    .filter(itinerary => {
      if (!itinerary) return false;
      if (filterType === 'price' && filterValue && itinerary.price > Number(filterValue)) return false;
      if (filterType === 'date' && filterValue) {
        const filterDate = new Date(filterValue);
        return itinerary.availableDates.some(date => new Date(date).toDateString() === filterDate.toDateString());
      }
      if (filterType === 'language' && filterValue && itinerary.language && 
          !itinerary.language.toLowerCase().includes(filterValue.toLowerCase())) return false;
      if (filterType === 'preference' && filterValue && itinerary.preferences && 
          !itinerary.preferences.toLowerCase().includes(filterValue.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'ratings') return (b.ratings.averageRating || 0) - (a.ratings.averageRating || 0); // Descending order
      return 0;
    });

  return (
    <div className="itinerary-list-container">
      <h2>Itinerary List</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name, activity, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFilterValue('');
          }}
          className="filter-select"
        >
          <option value="">Select Filter</option>
          <option value="price">Filter by Price</option>
          <option value="date">Filter by Date</option>
          <option value="language">Filter by Language</option>
          <option value="preference">Filter by Preference</option>
        </select>
        {filterType && (
          filterType === 'date' ? (
            <input
              type="date"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="filter-input"
            />
          ) : (
            <input
              type={filterType === 'price' ? 'number' : 'text'}
              placeholder={`Enter ${filterType}`}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="filter-input"
            />
          )
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="ratings">Sort by Ratings</option>
        </select>
      </div>
      <ul className="itinerary-list">
        {filteredItineraries.map((itinerary) => (
          <li key={itinerary._id} className="itinerary-item">
            <div className="itinerary-card">
              <h3>{itinerary.name}</h3>
              <p className="yellow-text">Language: {itinerary.language}</p>
              <p className="yellow-text">Price: ${itinerary.price}</p>
              <p className="yellow-text">Pick Up Location: {itinerary.pickUpLocation}</p>
              <p className="yellow-text">Drop Off Location: {itinerary.dropOffLocation}</p>
              <p className="yellow-text">Rating: {itinerary.ratings.averageRating || 'Not rated'}</p>
              <p className="yellow-text">Preferences: {itinerary.preferences || 'None specified'}</p>
              
              <h4 className="yellow-text">Activities:</h4>
              <ul>
                {itinerary.activities.map((activity, index) => (
                  <li key={index} className="yellow-text">{activity}</li>
                ))}
              </ul>

              <h4 className="yellow-text">Locations:</h4>
              <ul>
                {itinerary.locations.map((location, index) => (
                  <li key={index} className="yellow-text">{location}</li>
                ))}
              </ul>

              <h4 className="yellow-text">Timeline:</h4>
              <ul>
                {itinerary.timeline.map((event, index) => (
                  <li key={index} className="yellow-text">{event}</li>
                ))}
              </ul>

              <h4 className="yellow-text">Available Dates:</h4>
              <ul>
                {itinerary.availableDates.map((date, index) => (
                  <li key={index} className="yellow-text">{formatDate(date)}</li>
                ))}
              </ul>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItineraryList;