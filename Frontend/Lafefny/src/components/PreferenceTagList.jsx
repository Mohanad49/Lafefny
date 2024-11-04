/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getAllPreferenceTags, deletePreferenceTag } from '../services/preferenceTagService';
import { useNavigate, Link } from 'react-router-dom';

function PreferenceTagList() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getTags = async () => {
      try {
        const tagsData = await getAllPreferenceTags();
        setTags(tagsData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch Preference tags');
        setLoading(false);
      }
    };

    getTags();
  }, []);

  const handleDelete = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deletePreferenceTag(tagId);
        alert('tag deleted successfully');
        setTags(tags.filter(tag => tag._id !== tagId)); // Remove user from UI
      } catch (error) {
        alert('Failed to delete tag');
      }
    }
  };

  const renderTagList = () => {
    return tags.map(tag => (
      <tr key={tag._id}>
        <td>{tag.name}</td>
        <td>{tag.description}</td>
        <td>
            <Link to={`/edit-tag/${tag._id}`} className="button">
                Edit
            </Link>
          <button className="delete-button" onClick={() => handleDelete(tag._id)}>Delete</button>
        </td>
      </tr>
    ));
  };

  if (loading) return <p>Loading Tags...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="preference-tag-list">
      <h1>Manage Preference tags</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {renderTagList()}
        </tbody>
      </table>
    </div>
  );
}

export default PreferenceTagList;
