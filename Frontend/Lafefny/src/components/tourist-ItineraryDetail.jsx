/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTouristItineraryById } from '../services/touristItineraryService';
import { ArrowLeft, Calendar, DollarSign, Globe2, MapPin, Star, Users } from 'lucide-react';
import Navigation from './Navigation';

const TouristItineraryDetail = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await getTouristItineraryById(id);
        setItinerary(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch itinerary details');
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          {/* Hero Section */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            <div className="aspect-[21/9] w-full">
              <img 
                src={itinerary.image || "https://images.unsplash.com/photo-1571896349842-33c89424de2d"}
                alt={itinerary.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                {itinerary.name}
              </h1>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{new Date(itinerary.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span>{itinerary.price} EGP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5" />
                  <span>{itinerary.language}</span>
                </div>
                {itinerary.ratings?.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    <span>{itinerary.ratings.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Activities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Activities</h2>
              <ul className="space-y-3">
                {itinerary.activities.map((activity, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Locations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Locations</h2>
              <ul className="space-y-3">
                {itinerary.locations.map((location, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{location}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TouristItineraryDetail;
