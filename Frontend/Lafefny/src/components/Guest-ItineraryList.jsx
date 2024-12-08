/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItineraries } from '../services/itineraryService';
import { ArrowLeft, Search, Filter, SortAsc, Calendar, DollarSign, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import Navigation from './Navigation';

const ItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchItineraries();
  }, [searchTerm, filterType, filterValue, sortBy]);

  const fetchItineraries = async () => {
    try {
      const response = await getItineraries({
        search: searchTerm,
        filterType,
        filterValue,
        sortBy,
      });
      console.log('Fetched itineraries:', response.data);
      setItineraries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      setItineraries([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch itineraries. Please try again."
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter itineraries locally after fetching
  const filteredItineraries = itineraries
    .filter(itinerary => {
      if (!itinerary) return false;
      const nameMatch = itinerary.name && itinerary.name.toLowerCase().includes(searchTerm.toLowerCase());
      const activityMatch = itinerary.activities && itinerary.activities.some(activity => 
        activity && activity.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const locationMatch = itinerary.locations && itinerary.locations.some(location => 
        location && location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return nameMatch || activityMatch || locationMatch;
    })
    .filter(itinerary => {
      if (!itinerary) return false;
      if (filterType === 'price' && filterValue && itinerary.price > Number(filterValue)) return false;
      if (filterType === 'date' && filterValue) {
        const filterDate = new Date(filterValue);
        return itinerary.availableDates.some(date => new Date(date).toDateString() === filterDate.toDateString());
      }
      if (filterType === 'language' && filterValue && itinerary.language && 
          !itinerary.language.toLowerCase().includes(filterValue.toLowerCase())) return false;
      if (filterType === 'preference' && filterValue && itinerary.preferences && 
          !itinerary.preferences.toLowerCase().includes(filterValue.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'ratings') return (b.ratings?.averageRating || 0) - (a.ratings?.averageRating || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-12 pb-16">
        <div className="max-w-7xl mx-auto">
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
                Itineraries
              </h1>
              <p className="text-muted-foreground">
                Explore and discover amazing travel experiences
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search itineraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setFilterValue('');
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
              >
                <option value="">Select Filter</option>
                <option value="price">Filter by Price</option>
                <option value="date">Filter by Date</option>
                <option value="language">Filter by Language</option>
                <option value="preference">Filter by Preference</option>
              </select>
            </div>

            {filterType && (
              <div className="relative">
                {filterType === 'date' ? (
                  <>
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="date"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </>
                ) : filterType === 'price' ? (
                  <>
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="number"
                      placeholder="Max price..."
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder={`Filter by ${filterType}...`}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                )}
              </div>
            )}

            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="ratings">Sort by Rating</option>
              </select>
            </div>
          </div>

          {/* Itineraries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItineraries.map((itinerary) => (
              <div
                key={itinerary._id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                onClick={() => navigate(`/tours/${itinerary._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="aspect-[16/9] bg-gray-100 sm:aspect-[2/1] lg:aspect-[3/2]">
                  <img
                    src={itinerary.image || "https://images.unsplash.com/photo-1571896349842-33c89424de2d"}
                    alt={itinerary.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-gray-900/25" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {itinerary.name}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-white/90" />
                      <span className="text-sm text-white/90">
                        {formatDate(itinerary.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-white/90" />
                      <span className="text-sm text-white/90">
                        {itinerary.price} EGP
                      </span>
                    </div>
                    {itinerary.ratings?.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-white/90" />
                        <span className="text-sm text-white/90">
                          {itinerary.ratings.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItineraries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No itineraries found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ItineraryList;