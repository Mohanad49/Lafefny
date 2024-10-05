/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { addAdmin } from '../services/adminService';

const AddAdmin = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
  });

  const handleAddAdmin = async () => {
    try {
      await addAdmin(userData);
      alert('Admin added successfully');
    } catch (error) {
      
      alert('Failed to add Admin');
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      {/* Add Admin */}
      <div>
        <h3>Add Admin</h3>
        <input
          type="text"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
        />
        <button onClick={handleAddAdmin}>Add Admin</button>
      </div>
    </div>
  );
};

export default AddAdmin;