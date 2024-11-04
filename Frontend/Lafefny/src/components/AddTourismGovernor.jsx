/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {addTourismGovernor} from '../services/adminService';

const AddTourismGovernor = () => {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
  });

  const handleAddTourismGovernor = async () => {
    try {
      await addTourismGovernor(userData);
      alert('Tourism Governor added successfully');
    } catch (error) {
      console.error('Error adding Tourism Governor:', error);
      alert('Failed to add Tourism Governor');
    }
  };
  return (
    <div>
      <h2>Admin Panel</h2>
      
      {/* Add Tourism Governor */}
      <div>
        <h3>Add Tourism Governor</h3>
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
        <button onClick={handleAddTourismGovernor}>Add Tourism Governor</button>
      </div>
    
    </div>
  );
};

export default AddTourismGovernor;