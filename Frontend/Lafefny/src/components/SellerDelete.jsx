/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const SellerDelete = () => {
  const { id: sellerId } = useParams();  // Get seller ID from URL
  const [message, setMessage] = useState('');

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your seller account? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seller-delete/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage('Seller account deleted successfully.');
        window.location.href = '/';  // Redirect after deletion
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to delete seller account.');
      }
    } catch (err) {
      setMessage('An error occurred while deleting the seller account.');
    }
  };

  return (
    <div>
      <button onClick={handleDeleteAccount}>Delete Seller Account</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SellerDelete;
