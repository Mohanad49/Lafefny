/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('Pending');
  const [adminReply, setAdminReply] = useState('');

  useEffect(() => {
    fetchComplaint();
  }, []);

  const fetchComplaint = async () => {
    try {
      const response = await fetch(`http://localhost:8000/complaints/${id}`);
      const data = await response.json();
      setComplaint(data);
      setStatus(data.status);
      setAdminReply(data.adminReply || '');
    } catch (error) {
      console.error('Error fetching complaint:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminReply }),
      });
      if (response.ok) {
        alert('Complaint updated successfully');
        navigate('/admin/complaints');
      } else {
        alert('Error updating complaint');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  if (!complaint) return <p>Loading...</p>;

  return (
    <div>
      <h2>Complaint Details</h2>
      <p><strong>Title:</strong> {complaint.title}</p>
      <p><strong>Body:</strong> {complaint.body}</p>
      <p><strong>Status:</strong> {complaint.status}</p>
      <p><strong>Admin Reply:</strong> {complaint.adminReply || 'No reply yet'}</p>
      <p><strong>Date:</strong> {new Date(complaint.date).toLocaleString()}</p>

      <h3>Update Complaint</h3>
      <label>Status: </label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Pending">Pending</option>
        <option value="Resolved">Resolved</option>
      </select>

      <label>Admin Reply:</label>
      <textarea
        value={adminReply}
        onChange={(e) => setAdminReply(e.target.value)}
      />

      <button onClick={handleUpdate}>Update Complaint</button>
    </div>
  );
};

export default AdminComplaintDetail;