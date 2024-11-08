/* eslint-disable no-unused-vars */
// Frontend: src/components/DeleteAccount.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
  const [message, setMessage] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        const response = await fetch(`http://localhost:8000/users/${userId}`);
        const userData = await response.json();
        
        if (userData.deletionRequested) {
          setIsRequestPending(true);
          setMessage('Your account deletion request is already being processed by an admin.');
        }
      } catch (error) {
        setMessage('Error checking deletion status.');
      }
    };

    checkExistingRequest();
  }, [userId]);

  const handleDeleteRequest = async () => {
    if (isRequestPending) {
      return; // Prevent new request if one is pending
    }

    const confirmed = window.confirm(
      "Are you sure you want to request account deletion? This request will be reviewed by an admin."
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:8000/request-deletion/${userId}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsRequestPending(true);
        setMessage('Account deletion request submitted successfully. An admin will review your request.');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Error submitting deletion request. Please try again.');
    }
  };

  const handleCancelRequest = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/cancel-deletion/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsRequestPending(false);
        setMessage('Deletion request cancelled successfully.');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Error cancelling deletion request. Please try again.');
    }
  };

  return (
    <div className="delete-account">
      <h2>Request Account Deletion</h2>
      {isRequestPending ? (
        <div className="pending-request">
          <p className="warning">A deletion request for your account is already being processed.</p>
          <p>Please wait for an admin to review your request.</p>
          <button 
            onClick={handleCancelRequest}
            className="cancel-button"
          >
            Cancel Deletion Request
          </button>
        </div>
      ) : (
        <>
          <p>Warning: Your request will be reviewed by an admin before deletion is processed.</p>
          <button 
            onClick={handleDeleteRequest}
            className="delete-button"
          >
            Request Account Deletion
          </button>
        </>
      )}
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default DeleteAccount;