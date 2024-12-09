/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getItinerary, editItinerary } from '../services/itineraryService';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, X } from 'lucide-react';
import '../styles/edit-Itinerary.css';

const EditItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState({
    name: '',
    activities: [],
    locations: [],
    timeline: [],
    duration: [],
    language: '',
    price: 0,
    availableDates: [],
    accessibility: '',
    pickUpLocation: '',
    dropOffLocation: '',
    ratings: 0,
    preferences: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setLoading(true);
        const response = await getItinerary(id);
        setItinerary(response.data);
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

  const handleArrayChange = (e, index, field) => {
    const newArray = [...itinerary[field]];
    newArray[index] = e.target.value;
    setItinerary(prev => ({ ...prev, [field]: newArray }));
  };

  const handleDateChange = (e, index) => {
    const newDates = [...itinerary.availableDates];
    newDates[index] = e.target.value;
    setItinerary(prev => ({ ...prev, availableDates: newDates }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await editItinerary(id, itinerary);
      toast({
        title: "Success",
        description: "Itinerary updated successfully"
      });
      navigate('/tours');
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Itinerary</h1>
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
                    <label htmlFor="accessibility">Accessibility</label>
                    <Input
                      id="accessibility"
                      name="accessibility"
                      value={itinerary.accessibility}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="pickUpLocation">Pick Up Location</label>
                    <Input
                      id="pickUpLocation"
                      name="pickUpLocation"
                      value={itinerary.pickUpLocation}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dropOffLocation">Drop Off Location</label>
                    <Input
                      id="dropOffLocation"
                      name="dropOffLocation"
                      value={itinerary.dropOffLocation}
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
                </div>

                <div className="space-y-2">
                  <label htmlFor="description">Description</label>
                  <Textarea
                    id="description"
                    name="description"
                    value={itinerary.description || ''}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="activities">Activities (comma-separated)</label>
                  <Input
                    id="activities"
                    name="activities"
                    value={itinerary.activities.join(', ')}
                    onChange={(e) => handleArrayChange(e, 0, 'activities')}
                    placeholder="Enter activities separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="locations">Locations (comma-separated)</label>
                  <Input
                    id="locations"
                    name="locations"
                    value={itinerary.locations.join(', ')}
                    onChange={(e) => handleArrayChange(e, 0, 'locations')}
                    placeholder="Enter locations separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="timeline">Timeline (comma-separated)</label>
                  <Input
                    id="timeline"
                    name="timeline"
                    value={itinerary.timeline.join(', ')}
                    onChange={(e) => handleArrayChange(e, 0, 'timeline')}
                    placeholder="Enter timeline separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="duration">Duration (hours)</label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={itinerary.duration}
                    onChange={(e) => handleArrayChange(e, 0, 'duration')}
                    placeholder="Enter duration in hours"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="availableDates">Available Dates</label>
                  {itinerary.availableDates.map((date, index) => (
                    <Input
                      key={index}
                      type="date"
                      value={date.split('T')[0]}
                      onChange={(e) => handleDateChange(e, index)}
                    />
                  ))}
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

export default EditItinerary;