/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser, acceptUser, rejectUser, viewadvertiser_pdf, viewseller_pdf, viewtg_pdf  } from '../services/adminService';
import { useNavigate } from 'react-router-dom';

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteUser(userId);
        alert('User deleted successfully');
        setUsers(users.filter(user => user._id !== userId)); // Remove user from UI
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };


  const handleAccept = async (userId) => {
    if (window.confirm('Are you sure you want to accept this account?')) {
      try {
        await acceptUser(userId);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAccepted: true } : user
        ));
        alert('User Accepted');
      } catch (error) {
        alert('Failed to accept user');
      }
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this account?')) {
      try {
        await rejectUser(userId);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAccepted: false } : user
        ));
        alert('User Rejected');
      } catch (error) {
        alert('Failed to reject user');
      }
    }
  };

  // Function to handle viewing the PDF
  const handleViewPdf = async (userId, userType) => {
    if (window.confirm('Are you sure you want to view this PDF?')) {
      try {
        let pdfUrl;
        switch (userType) {
          case 'advertiser':
            pdfUrl = await viewadvertiser_pdf(userId);
            break;
          case 'seller':
            pdfUrl = await viewseller_pdf(userId);
            break;
          case 'tourGuide':
            pdfUrl = await viewtg_pdf(userId);
            break;
          default:
            throw new Error('Invalid user type');
        }
        console.log('PDF URL:', pdfUrl); // Check the PDF URL returned
        window.open(pdfUrl, '_blank');
      } catch (error) {
        console.error('Error viewing PDF:', error); // Log the error for debugging
        alert('Failed to view PDF');
      }
    }
  };

  const renderUserList = () => {
    return users.map(user => (
      <tr key={user._id}>
        <td>{user.username}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>
        <button className="delete-button" onClick={() => handleDelete(user._id)}>Delete</button>
          <button onClick={() => handleAccept(user._id)}>Accept</button>
          <button className="delete-button" onClick={() => handleReject(user._id)}>Reject</button>
          {/* Add the PDF view button */}
          <button onClick={() => handleViewPdf(user._id, user.role)}>View PDF</button>
        </td>
      </tr>
    ));
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-user-management">
      <h1>Manage User Accounts</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {renderUserList()}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserManagement;
