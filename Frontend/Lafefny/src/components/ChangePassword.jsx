import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../styles/changePassword.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      Swal.fire({
        title: 'Error',
        text: "New passwords don't match.",
        icon: 'error'
      });
      return;
    }

    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          title: 'Error',
          text: 'You must be logged in to change your password.',
          icon: 'error'
        });
        return;
      }

      // Send request to backend with authorization header
      const response = await fetch(`http://localhost:8000/change-password/${localStorage.getItem("userID")}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the authorization header
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          title: 'Success',
          text: 'Password changed successfully.',
          icon: 'success'
        });
        // Clear the form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: data.message || 'Failed to change password.',
          icon: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while changing the password.',
        icon: 'error'
      });
    }
  };

  return (
    <div>
      <div className="form-container">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label>Current Password:</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="submit-button">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
