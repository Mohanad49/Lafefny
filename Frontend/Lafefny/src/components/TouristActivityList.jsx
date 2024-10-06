/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActivities, deleteActivity } from '../services/activityService';
import '../styles/ActivityList.css';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBudget, setFilterBudget] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterType, setFilterType] = useState(''); // New state for filter type

  useEffect(() => {
    fetchActivities();
  }, [searchTerm, filterCategory, sortBy, filterBudget, filterDate, filterRating]);

  const fetchActivities = async () => {
    try {
      const response = await getActivities({
        search: searchTerm,
        category: filterCategory,
        sortBy,
        budget: filterBudget,
        date: filterDate,
        rating: filterRating,
      });
      console.log('Fetched activities:', response.data);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteActivity(id);
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter activities locally after fetching
  const filteredActivities = activities
    .filter(activity => 
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter(activity => {
      // Apply filters based on selected filter type
      if (filterType === 'budget' && filterBudget && activity.price > filterBudget) return false;
      if (filterType === 'date' && filterDate && new Date(activity.date) > new Date(filterDate)) return false;
      if (filterType === 'rating' && filterRating && activity.rating < filterRating) return false;
      if (filterCategory && !activity.category.toLowerCase().includes(filterCategory.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      // Apply sorting based on `sortBy` value
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating; // Descending order
      return 0;
    });

  return (
    <div className="activity-list-container">
      <h1>Activity List</h1>
      <div className="controls">
        <input
          type="text"
          placeholder="Search by name, category, or tag..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">Select Filter</option>
          <option value="budget">Filter by Budget</option>
          <option value="date">Filter by Date</option>
          <option value="category">Filter by Category</option>
          <option value="rating">Filter by Rating</option>
        </select>
        {filterType === 'budget' && (
          <input
            type="number"
            placeholder="Max budget"
            value={filterBudget}
            onChange={(e) => setFilterBudget(e.target.value)}
            className="budget-input"
          />
        )}
        {filterType === 'date' && (
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-input"
          />
        )}
        {filterType === 'category' && (
          <input
            type="text"
            placeholder="Filter by category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="category-input"
          />
        )}
        {filterType === 'rating' && (
          <input
            type="number"
            placeholder="Min rating"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="rating-input"
          />
        )}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>
      <ul className="activity-list">
        {filteredActivities.map((activity) => (
          <li key={activity._id} className="activity-item">
            <h3>{activity.name}</h3>
            <p className="yellow-text">Category: {activity.category}</p>
            <p className="yellow-text">Date: {new Date(activity.date).toLocaleDateString()}</p>
            <p className="yellow-text">Time: {activity.time}</p>
            <p className="yellow-text">Location: {activity.location}</p>
            <p className="yellow-text">Price: ${activity.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;