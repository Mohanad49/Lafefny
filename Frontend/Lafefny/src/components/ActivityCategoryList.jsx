/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getAllActivityCategories, deleteActivityCategory } from '../services/activityCategoryService';
import { useNavigate, Link } from 'react-router-dom';

function ActivityCategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoriesData = await getAllActivityCategories();
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch Activity Categories');
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteActivityCategory(categoryId);
        alert('Category deleted successfully');
        setCategories(categories.filter(category => category._id !== categoryId)); // Remove user from UI
      } catch (error) {
        alert('Failed to delete category');
      }
    }
  };

  const renderCategoryList = () => {
    return categories.map(category => (
      <tr key={category._id}>
        <td>{category.name}</td>
        <td>{category.description}</td>
        <td>
            <Link to={`/edit-category/${category._id}`} className="button">
                Edit
            </Link>
          <button className="delete-button" onClick={() => handleDelete(category._id)}>Delete</button>
        </td>
      </tr>
    ));
  };

  if (loading) return <p>Loading Categories...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="activity-category-list">
      <h1>Manage Activity Categories</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {renderCategoryList()}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityCategoryList;
