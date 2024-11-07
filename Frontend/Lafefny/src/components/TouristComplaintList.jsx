/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../styles/complaintList.css';

const TouristComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    fetchUserComplaints(userId);
  }, []);

  const fetchUserComplaints = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/complaints/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="complaints-container">
      <h2>My Complaints</h2>
      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        <ul className="complaint-list">
          {complaints.map((complaint) => (
            <li key={complaint._id} className="complaint-item">
              <div className="complaint-title">{complaint.title}</div>
              <div className="complaint-body">{complaint.body}</div>
              <div className={`complaint-status ${complaint.status.toLowerCase()}`}>
                Status: {complaint.status}
              </div>
              {complaint.adminReply && (
                <div className="complaint-reply">
                  <strong>Admin Reply:</strong> {complaint.adminReply}
                </div>
              )}
              <div className="complaint-date">
                Submitted: {new Date(complaint.date).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TouristComplaintList;