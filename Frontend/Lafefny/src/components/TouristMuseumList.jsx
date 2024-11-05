/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { getMuseums } from '../services/museumService';
import '../styles/museumList.css'
import { fetchExchangeRates } from '../services/currencyService';

const TouristMuseumList = () => {
  const [museums, setMuseums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMuseum, setCurrentMuseum] = useState(null);
  const [currency, setCurrency] = useState('EGP');
  const [conversionRates, setConversionRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);

  useEffect(() => {
    fetchMuseums();
  }, []);

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

  const fetchMuseums = async () => {
    try {
      const response = await getMuseums();
      setMuseums(response.data);
    } catch (error) {
      console.error('Error fetching museums:', error);
      setMuseums([]);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAndSortedMuseums = museums
    .filter(museum =>
      museum.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterTag === '' || (museum.tags && museum.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))))
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
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

  const handleShare = useCallback((museum) => {
    setCurrentMuseum(museum);
    setIsModalOpen(true);
  }, []);

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/museums/${currentMuseum._id}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Link copied to clipboard!');
      setIsModalOpen(false);
    });
  };

  const handleEmailShare = () => {
    const shareableLink = `${window.location.origin}/museums/${currentMuseum._id}`;
    const subject = 'Check out this museum!';
    const body = `I found this museum that you might like: ${shareableLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsModalOpen(false);
  };

  return (
    <div className="museum-list-container">
      <h2>Museum List</h2>
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
          placeholder="Search museums..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Filter by tag..."
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="filter-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      <ul className="museum-list">
        {filteredAndSortedMuseums.map((museum) => (
          <li key={museum._id} className="museum-item">
            <h3>{museum.name}</h3>
            <p>Location: {museum.location || 'N/A'}</p>
            <p>Tags: {museum.tags && museum.tags.length > 0 ? museum.tags.join(', ') : 'No tags'}</p>
            <p>Rating: {museum.rating || 'Not rated'}</p>
            <p>Opening Hours: {museum.openingHours || 'N/A'}</p>
            <p>Ticket Prices:</p>
            <ul>
              <li>Foreigner: {!ratesLoading && convertPrice(museum.ticketPrices?.foreigner)} {currency}</li>
              <li>Native: {!ratesLoading && convertPrice(museum.ticketPrices?.native)} {currency}</li>
              <li>Student: {!ratesLoading && convertPrice(museum.ticketPrices?.student)} {currency}</li>
            </ul>
            <div className="museum-actions">
              <button className="share-button" onClick={() => handleShare(museum)}>Share</button>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div className="share-modal">
          <div className="share-modal-content">
            <h2 style={{ color: "blue" }}> Share Museum</h2>
            <div className="share-link-container">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/museums/${currentMuseum._id}`}
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

export default TouristMuseumList;