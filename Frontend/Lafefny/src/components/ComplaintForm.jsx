/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import '../styles/complaintForm.css';

const ComplaintForm = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // Retrieve userId from localStorage when component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem('userID');
    setUserId(storedUserId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if userId is available
    if (!userId) {
      setMessage('User ID not found. Please sign in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, body }), // Include userId in the request
      });
      if (response.ok) {
        setMessage('Complaint submitted successfully!');
        setTitle('');
        setBody('');
      } else {
        setMessage('Error submitting complaint');
      }
    } catch (error) {
      setMessage('Error submitting complaint');
      console.error('Complaint submission error:', error);
    }
  };

  return (
    <div className="complaint-form-container">
      <h2>Submit a Complaint</h2>
      <form className="complaint-form" onSubmit={handleSubmit}>
        <label className ="complaint-label">
          Title:
          <input className="complaint-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className ="complaint-form">
          Complaint:
          <textarea className="complaint-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </label>
        <button className="complaint-button" type="submit">Submit</button>
        {message && <p className="complaint-message">{message}</p>}
      </form>
    </div>
  );
};

export default ComplaintForm;