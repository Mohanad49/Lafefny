// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMuseums, deleteMuseum } from '../services/museumService';
import '../styles/museumList.css'

const MuseumList = () => {
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

  const handleDelete = async (id) => {
    try {
      await deleteMuseum(id);
      fetchMuseums();
    } catch (error) {
      console.error('Error deleting museum:', error);
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
      <Link to="/add-museum" className="add-museum-button">Add New Museum</Link>

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
              <Link to={`/view-museum/${museum._id}`} className="view-button">View</Link>
              <Link to={`/edit-museum/${museum._id}`} className="museum-edit-button">Edit</Link>
              <button className="delete-button" onClick={() => handleDelete(museum._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MuseumList;