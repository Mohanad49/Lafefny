/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllActivityCategories, updateActivityCategory } from '../services/activityCategoryService';

const EditActivityCategory = () => {
  const { id } = useParams();
  const [category, setCategory] = useState({
    name: '',
    description: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    getAllActivityCategories().then((response) => {
      const foundCategory = response.find((category) => category._id === id);
      setCategory(foundCategory);
    });
  }, [id]);

  const handleChange = (e) => {
    setCategory({
      ...category,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateActivityCategory(id, category)
      .then(() => {
        alert('Activity Category updated successfully');
        navigate('/activityCategories'); // Redirect to the category list after editing
      })
      .catch((error) => console.error('Error updating Activity Category:', error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Activity Category</h2>
      <div>
        <label htmlFor="name">Category Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={category.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={category.description}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Update Category</button>
    </form>
  );
};

export default EditActivityCategory;
