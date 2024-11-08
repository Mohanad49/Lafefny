/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser,
    acceptUser, rejectUser,
    viewAdvertiser_pdf, viewSeller_pdf, viewTourGuide_pdf  } from '../services/adminService';
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
    const user = users.find(u => u._id === userId);
    
    if (user.isAccepted) {
      alert('User is already accepted');
      return;
    }

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
    const user = users.find(u => u._id === userId);
    
    if (user.isAccepted === false) {
      alert('User is already rejected');
      return;
    }

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

  const handleViewDocument = async (userId, role) => {
    try {
      switch(role.toLowerCase()) {
        case 'advertiser':
          {
            const advertiserPdfUrl = viewAdvertiser_pdf(userId);
            window.open(advertiserPdfUrl, '_blank');
            break;
          }
        case 'seller':
          {
            const sellerPdfUrl = await viewSeller_pdf(userId);
            window.open(sellerPdfUrl, '_blank');
            break;
          }
        case 'tourguide':
          { 
            const tourGuidePdfUrl = await viewTourGuide_pdf(userId);
            window.open(tourGuidePdfUrl, '_blank');
            break;
         }
        default:
          console.log('Invalid role for document viewing');
      }
    } catch (error) {
      alert('Failed to load document');
      console.error('Error:', error);
    }
  };

  const isRoleNeedingApproval = (role) => {
    const rolesNeedingApproval = ['tourguide', 'advertiser', 'seller'];
    return rolesNeedingApproval.includes(role.toLowerCase());
  };

  const renderUserList = () => {
    return users.map(user => (
      <tr key={user._id} className={user.deletionRequested ? 'deletion-requested' : ''}>
        <td>{user.username}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>
          {user.deletionRequested ? (
            <span className="deletion-badge">Deletion Requested</span>
          ) : (
            <span className="active-badge">Active</span>
          )}
        </td>
        <td>
          <button className="delete-button" onClick={() => handleDelete(user._id)}>Delete</button>
        </td>
        <td>
          {isRoleNeedingApproval(user.role) && (
            <>
              <button className="action-button accept-button" onClick={() => handleAccept(user._id)}>
                Accept
              </button>
              <button className="action-button reject-button" onClick={() => handleReject(user._id)}>
                Reject
              </button>
            </>
          )}
        </td>
        <td>
          {(user.role?.toLowerCase() === 'advertiser' || 
            user.role?.toLowerCase() === 'seller' || 
            user.role?.toLowerCase() === 'tourguide') && (
            <button onClick={() => handleViewDocument(user._id, user.role)}>
              View Documents
            </button>
          )}
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
            <th>Status</th>
            <th>Delete Users</th>
            <th>Approve Users</th>
            <th>Documents</th>
          </tr>
        </thead>
        <tbody>
          {renderUserList()}
        </tbody>
      </table>
      <style>
        {`
          .deletion-requested {
            background-color: #fff3f3;
          }
          
          .deletion-badge {
            background-color: #ff4444;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
          }

          .active-badge {
            background-color: #4CAF50;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
          }

          .action-button {
            width: 80px;
            padding: 5px;
            margin: 0 5px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
          }

          .accept-button {
            background-color: #4CAF50;
            color: white;
          }

          .reject-button {
            background-color: #ff4444;
            color: white;
          }
        `}
      </style>
    </div>
  );
}

export default AdminUserManagement;
