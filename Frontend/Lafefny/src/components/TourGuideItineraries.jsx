/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllTouristItineraries, deleteTouristItinerary } from '../services/touristItineraryService';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import Navigation from '../components/Navigation';
import '../styles/itineraryList.css';

const TourGuideItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, filterType, filterValue, sortBy]);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await getAllTouristItineraries({
        search: searchTerm,
        filterType,
        filterValue,
        sortBy,
      });
      console.log('Fetched itineraries:', response);
      setItineraries(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      alert('Failed to fetch itineraries');
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        await deleteTouristItinerary(id);
        fetchItineraries(); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting itinerary:', error);
        alert('Failed to delete itinerary. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  const filteredItineraries = itineraries
    .filter(itinerary => 
      itinerary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itinerary.activities.some(activity => activity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      itinerary.locations.some(location => location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(itinerary => {
      if (filterType === 'price' && filterValue) {
        return itinerary.price <= parseFloat(filterValue);
      }
      if (filterType === 'ratings' && filterValue) {
        return itinerary.ratings.averageRating >= parseFloat(filterValue);
      }
      if (filterType === 'language' && filterValue) {
        return itinerary.language.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType === 'date' && filterValue) {
        const filterDate = new Date(filterValue);
        return itinerary.availableDates.some(date => new Date(date).toDateString() === filterDate.toDateString());
      }
      if (filterType === 'preferences' && filterValue) {
        return itinerary.preferences.toLowerCase().includes(filterValue.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'ratings') return b.ratings.averageRating - a.ratings.averageRating;
      if (sortBy === 'date') return new Date(a.startDate) - new Date(b.startDate);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Itineraries</h1>
          <Link
            to="/add-tourist-itinerary"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Itinerary
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by name, activity, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Filter</option>
              <option value="price">Filter by Max Price</option>
              <option value="ratings">Filter by Min Ratings</option>
              <option value="language">Filter by Language</option>
              <option value="date">Filter by Date</option>
              <option value="preferences">Filter by Preferences</option>
            </select>
            {filterType && (
              <input
                type={filterType === 'price' || filterType === 'ratings' ? 'number' : 'text'}
                placeholder={`Enter ${filterType} value`}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="ratings">Sort by Ratings</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ratings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItineraries.map((itinerary) => (
                  <tr key={itinerary._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{itinerary.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${itinerary.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {itinerary.ratings?.averageRating?.toFixed(1) || 'No ratings'} ★ ({itinerary.ratings?.totalRatings || 0})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(itinerary.startDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(itinerary.endDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link
                          to={`/edit-tourist-itinerary/${itinerary._id}`}
                          className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(itinerary._id)}
                          className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuideItineraries;