/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAllTouristItineraries, deleteTouristItinerary } from '../services/touristItineraryService';
import '../styles/ItineraryList.css';

const EXCHANGE_API_KEY = 'a6ef7b85eab930c5bf44ae65'; // Store this in .env file in practice

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterDate, setFilterDate] = useState('');
  const [filterPreferences, setFilterPreferences] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [currency, setCurrency] = useState('EGP');
  const [conversionRates, setConversionRates] = useState(null);
  const [ratesError, setRatesError] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  const currentUserName = localStorage.getItem('currentUserName');
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in local storage after login

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, filterType, filterValue, sortBy, currency]);

  useEffect(() => {
    const fetchConversionRates = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`
        );
        const data = await response.json();
        if (data.result === "success") {
          setConversionRates(data.conversion_rates);
        } else {
          setRatesError("Failed to fetch conversion rates");
        }
      } catch (error) {
        setRatesError("Error fetching conversion rates");
        console.error(error);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchConversionRates();
  }, []); // Run once on mount

  const fetchItineraries = async () => {
    try {
      const response = await getAllTouristItineraries({
        search: searchTerm,
        filterType,
        filterValue,
        sortBy,
      });
      if (Array.isArray(response)) {
        const userItineraries = response.filter(itinerary => itinerary.touristName === currentUserName);
        setItineraries(userItineraries);
      } else {
        setItineraries([]);
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setItineraries([]);
    }
  };

  const handleBookItinerary = async (itineraryId) => {
    console.log("Booking User ID:", userId); // Debug: check if userId is defined
    
    if (!userId) {
      alert("User ID not found. Please log in.");
      return;
    }
    
    try {
      await axios.post(`http://localhost:8000/itineraries/${itineraryId}/book`, { userId });
      alert("Itinerary booked successfully!");
      fetchItineraries(); // Refresh the list to reflect the booking
    } catch (error) {
      console.error("Error booking itinerary:", error);
      alert("Failed to book the itinerary.");
    }
  };

  const handleCancelBooking = async (itineraryId) => {
    try {
      await axios.post(`http://localhost:8000/itineraries/${itineraryId}/cancel`, { userId });
      alert("Booking canceled successfully!");
      fetchItineraries();
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Failed to cancel the booking.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

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
      if (sortBy === 'ratings') return (b.ratings.averageRating || 0) - (a.ratings.averageRating || 0); // Descending order
      if (sortBy === 'date') return new Date(a.startDate) - new Date(b.startDate);
      return 0;
    });

  const convertPrice = (price) => {
    if (!conversionRates) return price;
    const priceInUSD = price / conversionRates.EGP;
    const convertedPrice = priceInUSD * conversionRates[currency];
    return convertedPrice.toFixed(2);
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const handleShare = useCallback((itinerary) => {
    setCurrentItinerary(itinerary);
    setIsModalOpen(true);
  }, []);

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/tourist-Itineraries/${currentItinerary._id}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Link copied to clipboard!');
      setIsModalOpen(false);
    });
  };

  const handleEmailShare = () => {
    const shareableLink = `${window.location.origin}/tourist-Itineraries/${currentItinerary._id}`;
    const subject = 'Check out this itinerary!';
    const body = `I found this itinerary that you might like: ${shareableLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsModalOpen(false);
  };

  return (
    <div className="itinerary-list-container">
      <h2>My Itineraries</h2>
      <div className="controls">
      <select value={currency} onChange={handleCurrencyChange} className="currency-select">
          {conversionRates && Object.keys(conversionRates).map(code => (
            <option key={code} value={code}>{code}</option>
          ))}
        </select>
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
            placeholder={`Enter Max Budget`}
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
      {ratesLoading && <p>Loading currency rates...</p>}
      {ratesError && <p>Error: {ratesError}</p>}
      {filteredItineraries.length > 0 ? (
        <ul className="itinerary-list">
          {filteredItineraries.map((itinerary) => (
            <li key={itinerary._id} className="itinerary-item">
              <div className="itinerary-card">
                <h3>{itinerary.name}</h3>
                <p className="yellow-text">Price: {convertPrice(itinerary.price)} {currency}</p>
                {itinerary.touristName && <p className="yellow-text">Tourist Name: {itinerary.touristName}</p>}
                {itinerary.startDate && <p className="yellow-text">Start Date: {formatDate(itinerary.startDate)}</p>}
                {itinerary.endDate && <p className="yellow-text">End Date: {formatDate(itinerary.endDate)}</p>}
                
                {itinerary.ratings !== undefined && <p className="yellow-text">Ratings: {itinerary.ratings.averageRating}</p>}
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
                <div className="activity-actions">
                  <button className="share-button" onClick={() => handleShare(itinerary)}>Share</button>
                  {itinerary.booked ? (
                    <button className="cancel-button" onClick={() => handleCancelBooking(itinerary._id)}>Cancel Booking</button>
                  ) : (
                    <button className="book-button" onClick={() => handleBookItinerary(itinerary._id)}>Book Itinerary</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-itineraries-message">
          <p>No Current Itineraries Available</p>
        </div>
      )}

      {isModalOpen && (
        <div className="share-modal">
          <div className="share-modal-content">
            <h2 style={{ color: "blue" }}> Share Itinerary</h2>
            <div className="share-link-container">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/tourist-Itineraries/${currentItinerary._id}`}
                className="share-link-input"
              />
              <button onClick={handleCopyLink} className="copy-link-button">Copy Link</button>
            </div>
            <button onClick={handleEmailShare}>Send via Email</button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryList;
