/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Tag, CreditCard, Users, CalendarIcon } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navigation from './Navigation';
import { addTouristItinerary } from '../services/touristItineraryService';
import { Calendar } from "@/components/ui/calendar"; // Import the Calendar component
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from 'axios';

const AddTouristItinerary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [itinerary, setItinerary] = useState({
    name: '',
    activities: '',
    locations: '',
    tags: '',
    startDate: '',
    endDate: '',
    price: '',
    touristName: '',
    tourGuideName: ''
  });

  useEffect(() => {
    const fetchTourGuideName = async () => {
      try {
        const userId = localStorage.getItem('userID');
        const response = await axios.get(`http://localhost:8000/users/${userId}`);
        const user = response.data;
        setItinerary(prev => ({ ...prev, tourGuideName: user.username }));
      } catch (error) {
        console.error('Error fetching tour guide name:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch tour guide name"
        });
      }
    };

    fetchTourGuideName();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItinerary(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setItinerary(prev => ({ ...prev, [field]: date ? format(date, 'yyyy-MM-dd') : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedItinerary = {
        ...itinerary,
        activities: itinerary.activities.split(',').map(item => item.trim()),
        locations: itinerary.locations.split(',').map(item => item.trim()),
        tags: itinerary.tags.split(',').map(item => item.trim()),
        price: parseFloat(itinerary.price)
      };

      await addTouristItinerary(formattedItinerary);
      toast({
        title: "Success",
        description: "Tourist Itinerary added successfully"
      });
      navigate('/');
    } catch (error) {
      console.error('Error adding tourist itinerary:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add tourist itinerary"
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
              <CalendarIcon className="h-6 w-6" />
              Add New Tourist Itinerary
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
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <Input
                    type="text"
                    name="tags"
                    placeholder="Enter comma-separated tags"
                    value={itinerary.tags}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Start Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {itinerary.startDate ? format(new Date(itinerary.startDate), 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={itinerary.startDate ? new Date(itinerary.startDate) : undefined}
                          onSelect={(date) => handleDateChange(date, 'startDate')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      End Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {itinerary.endDate ? format(new Date(itinerary.endDate), 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={itinerary.endDate ? new Date(itinerary.endDate) : undefined}
                          onSelect={(date) => handleDateChange(date, 'endDate')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      <Users className="h-4 w-4" />
                      Tourist Name
                    </label>
                    <Input
                      type="text"
                      name="touristName"
                      placeholder="Enter tourist name"
                      value={itinerary.touristName}
                      onChange={handleChange}
                      required
                    />
                  </div>
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

export default AddTouristItinerary;
