import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from './Navigation';
import { ArrowLeft, MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
                Manage Addresses
              </h1>
            <p className="text-muted-foreground">
              Add and manage your delivery addresses
            </p>
          </div>

          {/* Add New Address Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Address
          </button>
        </div>
          {/* Addresses Grid */}
          <div className="grid gap-6">
            {addresses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                No addresses added yet
              </div>
            ) : (
              addresses.map((address, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="space-y-1">
                          <p className="font-medium">{address.street}</p>
                          <p className="text-sm text-muted-foreground">{address.city}, {address.state}</p>
                          <p className="text-sm text-muted-foreground">{address.country}, {address.postalCode}</p>
                        </div>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                            Default Address
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditIndex(index);
                          setNewAddress(address);
                        }}
                        className="p-2 rounded-lg hover:bg-accent"
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(index)}
                        className="p-2 rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add/Edit Modal */}
          {(showAddModal || editIndex !== null) && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
              <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
                <div className="bg-card rounded-xl shadow-lg border border-border p-6">
                  <h2 className="text-2xl font-semibold mb-6">
                    {editIndex !== null ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  
                  <div className="space-y-4">
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      placeholder="Street"
                    />
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      placeholder="City"
                    />
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                      placeholder="State"
                    />
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                      placeholder="Country"
                    />
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                      placeholder="Postal Code"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-border text-primary focus:ring-primary"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                      />
                      <span className="text-sm">Set as default address</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditIndex(null);
                        setNewAddress({
                          street: '',
                          city: '',
                          state: '',
                          country: '',
                          postalCode: '',
                          isDefault: false
                        });
                      }}
                      className="px-4 py-2 rounded-lg hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editIndex !== null ? () => handleEditAddress(editIndex) : handleAddAddress}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {editIndex !== null ? 'Save Changes' : 'Add Address'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageAddresses;