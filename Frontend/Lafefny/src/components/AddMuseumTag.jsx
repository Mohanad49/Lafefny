/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { addMuseumTag } from '../services/museumTagService';

const AddMuseumTag = () => {
  const [tag, setTag] = useState({
    name: '',
    historicalPeriod: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTag(prevTag => ({
      ...prevTag,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const newTag = await addMuseumTag(tag);
      setSuccess('Museum tag added successfully!');
      setTag({ name: '', historicalPeriod: '' }); // Reset form
    } catch (err) {
      setError(err.error || 'An error occurred while adding the tag.');
    }
  };

  return (
    <div className="add-museum-tag">
      <h2>Add New Museum Tag</h2>
      {error && <p className="add-museum-tag-error">{error}</p>}
      {success && <p className="add-museum-tag-success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Tag Name:</label>
          <select
            id="name"
            name="name"
            value={tag.name}
            onChange={handleChange}
            required
          >
            <option value="">Select a tag</option>
            <option value="Monuments">Monuments</option>
            <option value="Museums">Museums</option>
            <option value="Religious Sites">Religious Sites</option>
            <option value="Palaces/Castles">Palaces/Castles</option>
          </select>
        </div>
        <div>
          <label htmlFor="historicalPeriod">Historical Period:</label>
          <input
            type="text"
            id="historicalPeriod"
            name="historicalPeriod"
            value={tag.historicalPeriod}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Add Tag</button>
      </form>
    </div>
  );
};

export default AddMuseumTag;
