/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/complaintList.css'; // Import the CSS file for styling

const AdminComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter state

  useEffect(() => {
    fetchComplaints();
  }, [sortOrder]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`http://localhost:8000/complaints?sort=${sortOrder}`);
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="complaints-container">
      <h2>All Complaints</h2>
      <div className="controls">
        <button className="sort-button" onClick={handleSortChange}>
          Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})
        </button>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
      <ul className="complaint-list">
        {complaints
          .filter(complaint => 
            statusFilter === 'all' || complaint.status === statusFilter
          )
          .map((complaint) => (
            <li key={complaint._id} className="complaint-item">
              <Link to={`/admin/complaints/${complaint._id}`} className="complaint-link">
                <div className="complaint-title">{complaint.title}</div>
                <div className="complaint-status">Status: {complaint.status}</div>
                <div className="complaint-date">
                  Date: {new Date(complaint.date).toLocaleDateString()}
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default AdminComplaintList;