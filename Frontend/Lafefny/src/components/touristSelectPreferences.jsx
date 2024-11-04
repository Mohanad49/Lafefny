/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getAllPreferenceTags } from '../services/preferenceTagService';
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom';
import '../styles/SelectPreference.css';

const SelectPreferences = () => {
  const [tags, setTags] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await getAllPreferenceTags();
        setTags(tagsData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch preference tags');
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTogglePreference = (tag) => {
    setSelectedPreferences((prev) => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userID = localStorage.getItem('userID'); // Get userID from local storage

    try {
      const response = await axios.put(`http://localhost:8000/tourist/updatePreferences/${userID}`, { preferences: selectedPreferences });
      alert('Preferences updated successfully!');
    } catch (error) {
      alert('Failed to update preferences');
    }
  };

  if (loading) return <p>Loading tags...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="select-preferences">
      <h1>Select Your Preferences</h1>
      <form onSubmit={handleSubmit}>
        {tags.map(tag => (
          <div key={tag._id} className="preference-tag">
            <label className="preference-label">
              <input
                type="checkbox"
                checked={selectedPreferences.includes(tag.name)}
                onChange={() => handleTogglePreference(tag.name)}
                className="preference-checkbox"
              />
              <span className="preference-text">{tag.name} - {tag.description}</span>
            </label>
          </div>
        ))}
        <button type="submit" className="save-button">Save Preferences</button>
      </form>
    </div>
  );
};

export default SelectPreferences; 