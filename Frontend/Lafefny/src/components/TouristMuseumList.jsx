/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { getMuseums } from '../services/museumService';
import '../styles/museumList.css'

const TouristMuseumList = () => {
  const [museums, setMuseums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMuseum, setCurrentMuseum] = useState(null);
  const [currency, setCurrency] = useState('EGP');

  useEffect(() => {
    fetchMuseums();
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
    const conversionRates = {
      EGP: 1,
      USD:0.02,
      EUR: 0.019,
      GBP: 0.016,
    };
    return (price * conversionRates[currency]).toFixed(2);
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
      <select value={currency} onChange={handleCurrencyChange} className="currency-select">
          <option value="EGP">EGP</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
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
              <li>Foreigner: {convertPrice(museum.ticketPrices?.foreigner) || 'N/A'} {currency}</li>
              <li>Native: {convertPrice(museum.ticketPrices?.native) || 'N/A'} {currency}</li>
              <li>Student: {convertPrice(museum.ticketPrices?.student) || 'N/A'} {currency}</li>
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