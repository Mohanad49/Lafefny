/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getActivities , getUserActivities} from '../services/activityService';
import { getAllActivityCategories } from '../services/activityCategoryService';
import '../styles/ActivityList.css';
import { fetchExchangeRates } from '../services/currencyService';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBudget, setFilterBudget] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterType, setFilterType] = useState('');
  const [activityCategories, setActivityCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [currency, setCurrency] = useState('EGP');
  const [conversionRates, setConversionRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);

  useEffect(() => {
    fetchActivities();
    fetchActivityCategories();
  }, [searchTerm, filterCategory, sortBy, filterBudget, filterDate, filterRating, currency]);

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

  const fetchActivities = async () => {
    try {
      const response = await getActivities({
        search: searchTerm,
        category: filterCategory,
        sortBy,
        budget: filterBudget,
        date: filterDate,
        rating: filterRating,
      });
      
      // Filter out inappropriate activities
      const appropriateActivities = response.data.filter(activity => !activity.inappropriateFlag);
      console.log('Fetched appropriate activities:', appropriateActivities);
      
      setActivities(Array.isArray(appropriateActivities) ? appropriateActivities : []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  const fetchActivityCategories = async () => {
    try {
      const categories = await getAllActivityCategories();
      setActivityCategories(categories);
    } catch (error) {
      console.error('Error fetching activity categories:', error);
    }
  };

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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const openShareModal = (activity) => {
    setCurrentActivity(activity);
    setIsModalOpen(true);
  };

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/activities/${currentActivity._id}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Link copied to clipboard!');
      setIsModalOpen(false);
    });
  };

  const handleEmailShare = () => {
    const shareableLink = `${window.location.origin}/activities/${currentActivity._id}`;
    const subject = 'Check out this activity!';
    const body = `I found this activity that you might like: ${shareableLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsModalOpen(false);
  };

  const filteredActivities = activities
    .filter(activity => 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter(activity => {
      if (filterType === 'budget' && filterBudget && activity.price > filterBudget) return false;
      if (filterType === 'date' && filterDate && new Date(activity.date) > new Date(filterDate)) return false;
      if (filterType === 'rating' && filterRating && activity.rating < filterRating) return false;
      if (filterCategory && !activity.category.toLowerCase().includes(filterCategory.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.ratings.averageRating - a.ratings.averageRating;
      return 0;
    });

  return (
    <div className="activity-list-container">
      <h1>Activity List</h1>
      <div className="controls">
        {ratesLoading ? (
          <p>Loading currencies...</p>
        ) : ratesError ? (
          <p>Error loading currencies</p>
        ) : (
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="currency-select"
          >
            {Object.keys(conversionRates).map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder="Search by name, category, or tag..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">Select Filter</option>
          <option value="budget">Filter by Budget</option>
          <option value="date">Filter by Date</option>
          <option value="category">Filter by Category</option>
          <option value="rating">Filter by Rating</option>
        </select>
        {filterType === 'budget' && (
          <input
            type="number"
            placeholder="Max budget"
            value={filterBudget}
            onChange={(e) => setFilterBudget(e.target.value)}
            className="budget-input"
          />
        )}
        {filterType === 'date' && (
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-input"
          />
        )}
        {filterType === 'category' && (
          <input
            type="text"
            placeholder="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-input"
          />
        )}
        {filterType === 'rating' && (
          <input
            type="number"
            placeholder="Min rating"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="rating-input"
          />
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Select Activity Category</option>
          {activityCategories.map(category => (
            <option key={category._id} value={category.name}>{category.name}</option>
          ))}
        </select>
      </div>
      {filteredActivities.length > 0 ? (
        <ul className="activity-list">
          {filteredActivities.map((activity) => (
            <li key={activity._id} className="activity-item">
              <h3>{activity.name}</h3>
              <p className="yellow-text">Category: {activity.category}</p>
              <p className="yellow-text">Date: {new Date(activity.date).toLocaleDateString()}</p>
              <p className="yellow-text">Time: {activity.time}</p>
              <p className="yellow-text">Location: {activity.location}</p>
              <p className="yellow-text">
                Price: {!ratesLoading && convertPrice(activity.price)} {currency}
              </p>
              <p className="yellow-text">Rating: {activity.ratings.averageRating || 'Not rated'}</p>
              <p className="yellow-text">Tags: {activity.tags.join(', ')}</p>
              {activity.specialDiscounts && (
                <p className="yellow-text">Special Discounts: {activity.specialDiscounts}</p>
              )}
              <p className="yellow-text">Booking: {activity.bookingOpen ? 'Open' : 'Closed'}</p>
              <div className="activity-actions">
                <button className="share-button" onClick={() => openShareModal(activity)}>Share</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-activities-message">
          <p>No Activities Available</p>
        </div>
      )}

      {isModalOpen && (
        <div className="share-modal">
          <div className="share-modal-content">
            <h2 style={{ color: "blue" }}> Share Activity</h2>
            <div className="share-link-container">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/activities/${currentActivity._id}`}
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

export default ActivityList;