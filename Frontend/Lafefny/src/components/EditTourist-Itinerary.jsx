/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllTouristItineraries, updateTouristItinerary } from '../services/touristItineraryService';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from 'lucide-react';
import '../styles/edit-Itinerary.css';

const EditTouristItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState({
    name: '',
    activities: [],
    locations: [],
    tags: [],
    startDate: '',
    endDate: '',
    price: '',
    touristName: '',
    ratings: 0,
    preferences: '',
    language: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const itineraries = await getAllTouristItineraries();
        const currentItinerary = itineraries.find(item => item._id === id);
        if (currentItinerary) {
          setItinerary({
            ...currentItinerary,
            startDate: new Date(currentItinerary.startDate).toISOString().split('T')[0],
            endDate: new Date(currentItinerary.endDate).toISOString().split('T')[0],
          });
        }
      } catch (error) {
        setError('Failed to fetch itinerary data');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch itinerary data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setItinerary(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateTouristItinerary(id, {
        ...itinerary,
        price: Number(itinerary.price),
        ratings: Number(itinerary.ratings)
      });
      toast({
        title: "Success",
        description: "Itinerary updated successfully"
      });
      navigate('/guide-tourist-itineraries');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update itinerary"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">{error || "Itinerary not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Edit Tourist Itinerary</h1>
            <p className="text-muted-foreground">Update itinerary details</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Itinerary Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name">Itinerary Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={itinerary.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="price">Price (EGP)</label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      value={itinerary.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="language">Language</label>
                    <Input
                      id="language"
                      name="language"
                      value={itinerary.language}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ratings">Ratings</label>
                    <Input
                      id="ratings"
                      type="number"
                      name="ratings"
                      value={itinerary.ratings}
                      onChange={handleChange}
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="preferences">Preferences</label>
                    <Input
                      id="preferences"
                      name="preferences"
                      value={itinerary.preferences}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="touristName">Tourist Name</label>
                    <Input
                      id="touristName"
                      name="touristName"
                      value={itinerary.touristName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="activities">Activities (comma-separated)</label>
                  <Input
                    id="activities"
                    name="activities"
                    value={itinerary.activities.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'activities')}
                    placeholder="Enter activities separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="locations">Locations (comma-separated)</label>
                  <Input
                    id="locations"
                    name="locations"
                    value={itinerary.locations.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'locations')}
                    placeholder="Enter locations separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tags">Tags (comma-separated)</label>
                  <Input
                    id="tags"
                    name="tags"
                    value={itinerary.tags.join(', ')}
                    onChange={(e) => handleArrayChange(e, 'tags')}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="startDate">Start Date</label>
                  <Input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={itinerary.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endDate">End Date</label>
                  <Input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={itinerary.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Updating Itinerary..." : "Update Itinerary"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditTouristItinerary;
