/* eslint-disable no-unused-vars */
// Frontend: src/components/DeleteAccount.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const DeleteAccount = () => {
  const [message, setMessage] = useState('');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuth();

  useEffect(() => {
    const checkExistingRequest = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${auth.userID}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        if (userData.deletionRequested) {
          setIsRequestPending(true);
          setMessage('Your account deletion request is already being processed by an admin.');
        }
      } catch (error) {
        console.error('Error checking deletion status:', error);
        setMessage('Error checking deletion status.');
      }
    };

    if (auth.token && auth.userID) {
      checkExistingRequest();
    }
  }, [auth.userID, auth.token]);

  const handleDeleteRequest = async () => {
    if (isRequestPending) {
      return; // Prevent new request if one is pending
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to request account deletion? This request will be reviewed by an admin.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/request-deletion/${auth.userID}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit deletion request');
      }

      setIsRequestPending(true);
      
      await Swal.fire({
        icon: 'success',
        title: 'Request Submitted',
        text: 'Your account deletion request has been submitted successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error requesting deletion:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to submit account deletion request. Please try again.',
      });
    }
  };

  const handleCancelRequest = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/cancel-deletion/${auth.userID}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel deletion request');
      }

      setIsRequestPending(false);
      setMessage('');
      
      await Swal.fire({
        icon: 'success',
        title: 'Request Cancelled',
        text: 'Your account deletion request has been cancelled.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error cancelling request:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to cancel deletion request. Please try again.',
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">Account Deletion</h2>
          
          {message && (
            <div className="alert alert-info" role="alert">
              {message}
            </div>
          )}
          
          {isRequestPending ? (
            <button 
              onClick={handleCancelRequest}
              className="btn btn-secondary btn-block"
            >
              Cancel Deletion Request
            </button>
          ) : (
            <button 
              onClick={handleDeleteRequest}
              className="btn btn-danger btn-block"
            >
              Request Account Deletion
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;