/* eslint-disable no-unused-vars */
import React, { useState, useEffect} from 'react';
import { getMuseums } from '../services/museumService';
import '../styles/museumList.css'

const TouristMuseumList = () => {
  const [museums, setMuseums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('name');

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

  return (
    <div className="museum-list-container">
      <h2>Museum List</h2>
      <div className="controls">
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
              <li>Foreigner: ${museum.ticketPrices?.foreigner || 'N/A'}</li>
              <li>Native: ${museum.ticketPrices?.native || 'N/A'}</li>
              <li>Student: ${museum.ticketPrices?.student || 'N/A'}</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TouristMuseumList;