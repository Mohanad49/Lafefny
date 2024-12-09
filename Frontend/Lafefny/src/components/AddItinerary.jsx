import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Clock, Tag, Globe, CreditCard, Users, Accessibility } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navigation from './Navigation';
import { addItinerary } from '../services/itineraryService';

const AddItinerary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itinerary, setItinerary] = useState({
    name: '',
    activities: '',
    locations: '',
    timeline: '',
    duration: '',
    language: '',
    price: '',
    availableDates: '',
    accessibility: '',
    pickUpLocation: '',
    dropOffLocation: '',
    preferences: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedData = {
        ...itinerary,
        activities: itinerary.activities.split(',').map(item => item.trim()),
        locations: itinerary.locations.split(',').map(item => item.trim()),
        timeline: itinerary.timeline.split(',').map(item => item.trim()),
        duration: [Number(itinerary.duration)],
        price: Number(itinerary.price),
        availableDates: itinerary.availableDates.split(',').map(date => {
          const [year, month, day] = date.trim().split('-');
          return new Date(Date.UTC(year, month - 1, day)).toISOString();
        }),
        ratings: 0,
        tourGuide: localStorage.getItem('userID'),
      };

      await addItinerary(processedData);
      toast({
        title: "Success",
        description: "Itinerary added successfully"
      });
      navigate('/');
    } catch (error) {
      console.error('Error adding itinerary:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add itinerary"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
      <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <Card>
          
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Add New Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Itinerary Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter itinerary name"
                    value={itinerary.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Activities
                  </label>
                  <Input
                    type="text"
                    name="activities"
                    placeholder="Enter comma-separated activities"
                    value={itinerary.activities}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Locations
                  </label>
                  <Input
                    type="text"
                    name="locations"
                    placeholder="Enter comma-separated locations"
                    value={itinerary.locations}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline
                  </label>
                  <Input
                    type="text"
                    name="timeline"
                    placeholder="Enter comma-separated timeline"
                    value={itinerary.timeline}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duration (hours)
                    </label>
                    <Input
                      type="number"
                      name="duration"
                      placeholder="Enter duration"
                      value={itinerary.duration}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Language
                    </label>
                    <Input
                      type="text"
                      name="language"
                      placeholder="Enter language"
                      value={itinerary.language}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Price
                    </label>
                    <Input
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      value={itinerary.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Available Dates
                    </label>
                    <Input
                      type="text"
                      name="availableDates"
                      placeholder="Enter comma-separated dates (YYYY-MM-DD)"
                      value={itinerary.availableDates}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Accessibility className="h-4 w-4" />
                    Accessibility
                  </label>
                  <Input
                    type="text"
                    name="accessibility"
                    placeholder="Enter accessibility information"
                    value={itinerary.accessibility}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Pick-Up Location
                  </label>
                  <Input
                    type="text"
                    name="pickUpLocation"
                    placeholder="Enter pick-up location"
                    value={itinerary.pickUpLocation}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Drop-Off Location
                  </label>
                  <Input
                    type="text"
                    name="dropOffLocation"
                    placeholder="Enter drop-off location"
                    value={itinerary.dropOffLocation}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Preferences
                  </label>
                  <Input
                    type="text"
                    name="preferences"
                    placeholder="Enter preferences (optional)"
                    value={itinerary.preferences}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg">
                  Add Itinerary
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddItinerary;