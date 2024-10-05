// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { getMuseums } from '../services/museumService';
import '../styles/museumList.css'

const TouristMuseumList = () => {
  const [museums, setMuseums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchMuseums();
  }, [searchTerm, filterTag, sortBy]);

  const fetchMuseums = async () => {
    try {
      const response = await getMuseums(searchTerm, filterTag, sortBy);
      setMuseums(response.data);
    } catch (error) {
      console.error('Error fetching museums:', error);
      setMuseums([]); // Set to empty array if there's an error
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredMuseums = museums.filter(museum =>
    museum.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredMuseums.map((museum) => (
          <li key={museum._id} className="museum-item">
            <h3>{museum.name}</h3>
            <p>Location: {museum.location || 'N/A'}</p>
            <p>Tags: {museum.tags && museum.tags.length > 0 ? museum.tags.join(', ') : 'No tags'}</p>
            <p>Rating: {museum.rating || 'Not rated'}</p>
            <div className="museum-actions">
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TouristMuseumList;