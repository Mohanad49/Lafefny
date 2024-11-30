import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/manageAddresses.css';

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false
  });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.get(`http://localhost:8000/tourist/${userId}/addresses`);
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async () => {
    try {
      if (!newAddress.street || !newAddress.city || !newAddress.state || 
          !newAddress.country || !newAddress.postalCode) {
        alert('Please fill in all fields');
        return;
      }

      const userId = localStorage.getItem('userID');
      if (!userId) {
        alert('User ID not found. Please try logging in again.');
        return;
      }

      console.log('Attempting to add address:', {
        userId,
        address: newAddress,
        url: `http://localhost:8000/tourist/${userId}/addresses`
      });

      const response = await axios({
        method: 'post',
        url: `http://localhost:8000/tourist/${userId}/addresses`,
        data: newAddress,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      });

      console.log('Server response:', response.data);
      
      if (response.data) {
        fetchAddresses();
        setShowAddModal(false);
        setNewAddress({
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
          isDefault: false
        });
        alert('Address added successfully!');
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      let errorMessage = 'Failed to add address: ';
      if (error.response) {
        errorMessage += error.response.data?.error || error.response.data?.message || error.message;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your connection.';
      } else {
        errorMessage += 'Error setting up the request: ' + error.message;
      }
      alert(errorMessage);
    }
  };

  const handleEditAddress = async (index) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.put(`http://localhost:8000/tourist/${userId}/addresses/${index}`, newAddress);
      fetchAddresses();
      setEditIndex(null);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        isDefault: false
      });
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address: ' + error.message);
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.delete(`http://localhost:8000/tourist/${userId}/addresses/${index}`);
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address: ' + error.message);
    }
  };

  return (
    <div className="manage-addresses">
      <h2>Manage Addresses</h2>
      
      <button className="add-address-btn" onClick={() => setShowAddModal(true)}>
        Add New Address
      </button>

      <div className="addresses-list">
        {addresses.map((address, index) => (
          <div key={index} className="address-card">
            {editIndex === index ? (
              <div className="edit-form">
                <input
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  placeholder="Street"
                />
                <input
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                  placeholder="City"
                />
                <input
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                  placeholder="State"
                />
                <input
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                  placeholder="Country"
                />
                <input
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                  placeholder="Postal Code"
                />
                <label>
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                  />
                  Set as default
                </label>
                <button onClick={() => handleEditAddress(index)}>Save</button>
                <button onClick={() => setEditIndex(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <p><strong>Street:</strong> {address.street}</p>
                <p><strong>City:</strong> {address.city}</p>
                <p><strong>State:</strong> {address.state}</p>
                <p><strong>Country:</strong> {address.country}</p>
                <p><strong>Postal Code:</strong> {address.postalCode}</p>
                {address.isDefault && <p className="default-badge">Default Address</p>}
                <div className="address-actions">
                  <button onClick={() => {
                    setEditIndex(index);
                    setNewAddress(address);
                  }}>Edit</button>
                  <button onClick={() => handleDeleteAddress(index)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Address</h3>
            <input
              value={newAddress.street}
              onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
              placeholder="Street"
            />
            <input
              value={newAddress.city}
              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
              placeholder="City"
            />
            <input
              value={newAddress.state}
              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
              placeholder="State"
            />
            <input
              value={newAddress.country}
              onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
              placeholder="Country"
            />
            <input
              value={newAddress.postalCode}
              onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
              placeholder="Postal Code"
            />
            <label>
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
              />
              Set as default
            </label>
            <div className="modal-actions">
              <button onClick={handleAddAddress}>Add</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAddresses; 