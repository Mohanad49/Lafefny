/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTouristItineraries, deleteTouristItinerary } from '../services/touristItineraryService';
import '../styles/ItineraryList.css';

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterDate, setFilterDate] = useState('');
  const [filterPreferences, setFilterPreferences] = useState('');

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, filterType, filterValue, sortBy]);

  const fetchItineraries = async () => {
    try {
      const response = await getAllTouristItineraries({
        search: searchTerm,
        filterType,
        filterValue,
        sortBy,
      });
      console.log('Full response:', response);
      if (Array.isArray(response)) {
        console.log('Fetched itineraries:', response);
        setItineraries(response);
      } else {
        console.error('Response is not an array:', response);
        setItineraries([]);
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setItineraries([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTouristItinerary(id);
      fetchItineraries();
    } catch (error) {
      console.error('Error deleting itinerary:', error);
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
      const tagMatch = itinerary.tags && itinerary.tags.some(tag => 
        tag && tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const preferenceMatch = itinerary.preferences && itinerary.preferences.toLowerCase().includes(searchTerm.toLowerCase());
      const languageMatch = itinerary.language && itinerary.language.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || activityMatch || locationMatch || tagMatch || preferenceMatch || languageMatch;
    })
    .filter(itinerary => {
      if (!itinerary) return false;
      if (filterType === 'price' && filterValue && itinerary.price > Number(filterValue)) return false;
      if (filterType === 'ratings' && filterValue && itinerary.ratings < Number(filterValue)) return false;
      if (filterType === 'language' && filterValue && itinerary.language && 
          !itinerary.language.toLowerCase().includes(filterValue.toLowerCase())) return false;
      if (filterType === 'date' && filterDate) {
        const filterDateObj = new Date(filterDate);
        const startDateObj = new Date(itinerary.startDate);
        const endDateObj = new Date(itinerary.endDate);
        if (filterDateObj < startDateObj || filterDateObj > endDateObj) return false;
      }
      if (filterType === 'preferences' && filterPreferences && itinerary.preferences &&
          !itinerary.preferences.toLowerCase().includes(filterPreferences.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'ratings') return (b.ratings || 0) - (a.ratings || 0); // Descending order
      if (sortBy === 'date') return new Date(a.startDate) - new Date(b.startDate);
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
            setFilterDate('');
            setFilterPreferences('');
          }}
          className="filter-select"
        >
          <option value="">Select Filter</option>
          <option value="price">Filter by Price</option>
          <option value="date">Filter by Date</option>
          <option value="language">Filter by Language</option>
          <option value="ratings">Filter by Ratings</option>
          <option value="preferences">Filter by Preferences</option>
        </select>
        {filterType === 'date' ? (
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-input"
          />
        ) : filterType === 'preferences' ? (
          <input
            type="text"
            placeholder="Enter preferences"
            value={filterPreferences}
            onChange={(e) => setFilterPreferences(e.target.value)}
            className="filter-input"
          />
        ) : filterType && (
          <input
            type={filterType === 'price' || filterType === 'ratings' ? 'number' : 'text'}
            placeholder={`Enter ${filterType}`}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="filter-input"
          />
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="date">Sort by Date</option>
          <option value="ratings">Sort by Ratings</option>
        </select>
      </div>
      {filteredItineraries.length > 0 ? (
        <ul className="itinerary-list">
          {filteredItineraries.map((itinerary) => (
            <li key={itinerary._id} className="itinerary-item">
              <div className="itinerary-card">
                <h3>{itinerary.name}</h3>
                <p className="yellow-text">Price: ${itinerary.price}</p>
                {itinerary.touristName && <p className="yellow-text">Tourist Name: {itinerary.touristName}</p>}
                {itinerary.startDate && <p className="yellow-text">Start Date: {formatDate(itinerary.startDate)}</p>}
                {itinerary.endDate && <p className="yellow-text">End Date: {formatDate(itinerary.endDate)}</p>}
                
                {/* New fields */}
                {itinerary.ratings !== undefined && <p className="yellow-text">Ratings: {itinerary.ratings}</p>}
                {itinerary.preferences && <p className="yellow-text">Preferences: {itinerary.preferences}</p>}
                {itinerary.language && <p className="yellow-text">Language: {itinerary.language}</p>}
                
                {itinerary.activities && itinerary.activities.length > 0 && (
                  <>
                    <h4 className="yellow-text">Activities:</h4>
                    <ul>
                      {itinerary.activities.map((activity, index) => (
                        <li key={index} className="yellow-text">{activity}</li>
                      ))}
                    </ul>
                  </>
                )}

                {itinerary.locations && itinerary.locations.length > 0 && (
                  <>
                    <h4 className="yellow-text">Locations:</h4>
                    <ul>
                      {itinerary.locations.map((location, index) => (
                        <li key={index} className="yellow-text">{location}</li>
                      ))}
                    </ul>
                  </>
                )}

                {itinerary.tags && itinerary.tags.length > 0 && (
                  <>
                    <h4 className="yellow-text">Tags:</h4>
                    <ul>
                      {itinerary.tags.map((tag, index) => (
                        <li key={index} className="yellow-text">{tag}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-itineraries-message">
          <p>No Current Itineraries Available</p>
        </div>
      )}
    </div>
  );
};

export default ItineraryList;