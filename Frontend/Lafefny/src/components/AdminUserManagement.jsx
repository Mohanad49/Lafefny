/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser } from '../services/adminService';
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

  const renderUserList = () => {
    return users.map(user => (
      <tr key={user._id}>
        <td>{user.username}</td>
        <td>{user.email}</td>
        <td>{user.role}</td>
        <td>
          <button className="delete-button" onClick={() => handleDelete(user._id)}>Delete</button>
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
