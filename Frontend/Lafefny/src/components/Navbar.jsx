import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Swal from 'sweetalert2';
import '../styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const userRole = localStorage.getItem('userRole');

  const handleLogout = async () => {
    try {
      await Swal.fire({
        title: 'Logging Out',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          authService.logout();
          Swal.fire({
            title: 'Logged Out!',
            text: 'You have been successfully logged out.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            navigate('/');
          });
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while logging out.',
        icon: 'error'
      });
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <span className="welcome-text">Welcome, {username}</span>
        <span className="role-badge">{userRole}</span>
      </div>
      <div className="navbar-right">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
