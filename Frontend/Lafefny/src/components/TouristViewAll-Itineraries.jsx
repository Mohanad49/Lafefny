/* eslint-disable no-unused-vars */
import React, { useState, useEffect,  useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getItineraries } from '../services/itineraryService';
import { fetchExchangeRates } from '../services/currencyService';
import '../styles/ItineraryList.css';

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [currency, setCurrency] = useState('EGP');
  const [conversionRates, setConversionRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, filterType, filterValue, sortBy, currency]);

  useEffect(() => {
    const getRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setConversionRates(rates);
      } catch (error) {
        setRatesError('Failed to load currency rates');
      } finally {
        setRatesLoading(false);
      }
    };
    getRates();
  }, []);

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

  const convertPrice = (price) => {
    if (!conversionRates || !price) return price;
    // Convert from EGP to USD first
    const priceInUSD = price / conversionRates.EGP;
    // Then convert to target currency
    return (priceInUSD * conversionRates[currency]).toFixed(2);
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const handleShare = useCallback((itinerary) => {
    setCurrentItinerary(itinerary);
    setIsModalOpen(true);
  }, []);

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/Itineraries/${currentItinerary._id}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Link copied to clipboard!');
      setIsModalOpen(false);
    });
  };

  const handleEmailShare = () => {
    const shareableLink = `${window.location.origin}/Itineraries/${currentItinerary._id}`;
    const subject = 'Check out this itinerary!';
    const body = `I found this itinerary that you might like: ${shareableLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsModalOpen(false);
  };

  return (
    <div className="itinerary-list-container">
      <h2>Itinerary List</h2>
      <div className="controls">
        {ratesLoading ? (
          <p>Loading currencies...</p>
        ) : ratesError ? (
          <p>Error loading currencies</p>
        ) : (
          <select 
            value={currency} 
            onChange={handleCurrencyChange}
            className="currency-select"
          >
            {Object.keys(conversionRates).map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        )}
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
              placeholder={`Enter Max Budget`}
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
              <p className="yellow-text">
                Price: {!ratesLoading && convertPrice(itinerary.price)} {currency}
              </p>
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

              <div className="activity-actions">
                  <button className="share-button" onClick={() => handleShare(itinerary)}>Share</button>
                </div>

            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className="share-modal">
          <div className="share-modal-content">
            <h2 style={{ color: "blue" }}> Share Itinerary</h2>
            <div className="share-link-container">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/Itineraries/${currentItinerary._id}`}
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