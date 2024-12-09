/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Calendar, Globe, MapPin, Plus, Tag, Shield, Trash2, Loader2 } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import NotificationBell from './NotificationBell';
import '../styles/homePage.css'; // Ensure this path is correct
import SalesReport from './SalesReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const TourGuideHome = () => {
  const [itineraries, setItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please login again.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    fetchItineraries();
  }, [userId]);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/itineraries/tourGuide/${userId}`);
      const fetchedItineraries = response.data;
      setItineraries(fetchedItineraries.slice(0, 4)); // Only show first 4 itineraries
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch itineraries",
        variant: "destructive",
      });
      setItineraries([]);
      setIsLoading(false);
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    try {
      await axios.delete(`http://localhost:8000/itineraries/${itineraryId}`);
      setItineraries(itineraries.filter(itinerary => itinerary._id !== itineraryId));
      toast({
        title: "Success",
        description: "Itinerary deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete itinerary",
        variant: "destructive",
      });
    }
  };

  const toggleActiveStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`http://localhost:8000/itineraries/${id}/toggleActive`, { isActive: !currentStatus });
      fetchItineraries();
    } catch (error) {
      console.error('Error toggling itinerary status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle itinerary status",
        variant: "destructive",
      });
    }
  };

  const handleClick = (id) => {
    navigate(`/tours/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                Tour Guide Dashboard
                <span className="block text-2xl sm:text-3xl text-muted-foreground mt-2">
                  Manage Activities, Itineraries & More
                </span>
              </h1>
            </div>
          </div>
        </section>

        {/* Profile Stats Banner */}
        <section className="px-6 lg:px-8 -mt-10 mb-8">
          <div className="mx-auto max-w-7xl">
            <div className="bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm bg-white/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Role</p>
                    <p className="text-lg font-semibold text-primary">Tour Guide</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <Calendar className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Upcoming Tours</p>
                    <p className="text-lg font-semibold text-primary">5</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
                    <Globe className="h-7 w-7 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Itineraries</p>
                    <p className="text-lg font-semibold text-primary">12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-primary mb-8">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { to: "/Activities", icon: Activity, label: "View Activities" },
                { to: "/tours", icon: Calendar, label: "View Itineraries" },
                { to: "/add-itinerary", icon: Plus, label: "Add Itinerary" }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="p-8 rounded-xl bg-white hover:bg-primary/5 transition-all flex flex-col items-center group shadow-sm hover:shadow-md"
                >
                  <item.icon className="h-8 w-8 mb-4 text-primary group-hover:text-accent transition-colors" />
                  <h3 className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{item.label}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Your Itineraries Section */}
        <section className="bg-white px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary">Your Itineraries</h2>
              <Link to="/tours" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {itineraries.map((itinerary) => (
                <Card key={itinerary._id} onClick={() => handleClick(itinerary._id)}>
                  <div className="relative h-48">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItinerary(itinerary._id);
                      }}
                      className="absolute top-2 left-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                    <img
                      src={itinerary.image}
                      alt={itinerary.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{itinerary.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {itinerary.description}
                    </p>
                    <div className="flex justify-between items-center">
                      
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-itinerary/${itinerary._id}`);
                      }}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActiveStatus(itinerary._id, itinerary.isActive);
                        }}
                      >
                        {itinerary.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Sales Report Section */}
        <section className="px-6 lg:px-8 py-12 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary">Sales Report</h2>
              <Link to="/sales-report" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                View Detailed Report
              </Link>
            </div>
            <SalesReport />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TourGuideHome;