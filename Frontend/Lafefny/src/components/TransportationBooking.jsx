/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, DollarSign, Bus, Building, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation'; // Import Navigation component

const TransportationBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    providerName: '',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: '',
    arrivalDate: '',
    numberOfPassengers: 1,
    price: 0
  });
  const [providers, setProviders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tourist/advertisers`);
        setProviders(response.data);
      } catch (err) {
        setError('Failed to fetch transportation providers');
      }
    };
    fetchProviders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userID');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/tourist/${userId}/transportation-booking`, formData);
      setSuccess('Transportation booked successfully!');
      setError('');
      setFormData({
        type: '',
        providerName: '',
        departureLocation: '',
        arrivalLocation: '',
        departureDate: '',
        arrivalDate: '',
        numberOfPassengers: 1,
        price: 0
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book transportation');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation /> {/* Add Navigation component */}
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-primary mb-6">Book Transportation</h2>
            
            {error && <div className="bg-destructive/15 text-destructive rounded-lg p-4 mb-6">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 rounded-lg p-4 mb-6">{success}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Bus className="h-4 w-4" />
                      <span>Transportation Type</span>
                    </div>
                    <select 
                      name="type" 
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Car">Car</option>
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4" />
                      <span>Provider</span>
                    </div>
                    <select 
                      name="providerName" 
                      value={formData.providerName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Select Provider</option>
                      {providers.map(provider => (
                        <option key={provider._id} value={provider.company}>
                          {provider.company}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Departure Location</span>
                    </div>
                    <input
                      type="text"
                      name="departureLocation"
                      value={formData.departureLocation}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Arrival Location</span>
                    </div>
                    <input
                      type="text"
                      name="arrivalLocation"
                      value={formData.arrivalLocation}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Departure Date</span>
                    </div>
                    <input
                      type="datetime-local"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Arrival Date</span>
                    </div>
                    <input
                      type="datetime-local"
                      name="arrivalDate"
                      value={formData.arrivalDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4" />
                      <span>Number of Passengers</span>
                    </div>
                    <input
                      type="number"
                      name="numberOfPassengers"
                      value={formData.numberOfPassengers}
                      onChange={handleChange}
                      min="1"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span>Price (EGP)</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Book Transportation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportationBooking;