/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllPreferenceTags, updatePreferenceTag } from '../services/preferenceTagService';

const EditPreferenceTag = () => {
  const { id } = useParams();
  const [tag, setTag] = useState({
    name: '',
    description: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    getAllPreferenceTags().then((response) => {
      const foundTag = response.find((tag) => tag._id === id);
      setTag(foundTag);
    });
  }, [id]);

  const handleChange = (e) => {
    setTag({
      ...tag,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePreferenceTag(id, tag)
      .then(() => {
        alert('Preference Tag updated successfully');
        navigate('/preferenceTags'); // Redirect to the tag list after editing
      })
      .catch((error) => console.error('Error updating Preference Tag:', error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Preference Tag</h2>
      <div>
        <label htmlFor="name">Tag Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={tag.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={tag.description}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Update Tag</button>
    </form>
  );
};

export default EditPreferenceTag;
