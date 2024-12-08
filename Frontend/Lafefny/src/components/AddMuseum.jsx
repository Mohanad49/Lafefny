/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { addMuseum } from '../services/museumService';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, MapPin, Clock, Tag, Image, Ticket } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navigation from './Navigation';

const AddMuseum = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [museum, setMuseum] = useState({
    name: '',
    description: '',
    pictures: [],
    location: '',
    openingHours: '',
    ticketPrices: {
      foreigner: '',
      native: '',
      student: ''
    },
    tags: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ticketPrices.')) {
      const priceType = name.split('.')[1];
      setMuseum(prev => ({
        ...prev,
        ticketPrices: {
          ...prev.ticketPrices,
          [priceType]: value
        }
      }));
    } else {
      setMuseum(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePicturesChange = (e) => {
    const pictures = e.target.value.split(',').map(url => url.trim());
    setMuseum(prev => ({ ...prev, pictures }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setMuseum(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const museumData = {
        ...museum,
        ticketPrices: {
          foreigner: Number(museum.ticketPrices.foreigner),
          native: Number(museum.ticketPrices.native),
          student: Number(museum.ticketPrices.student)
        }
      };
      await addMuseum(museumData);
      toast({
        title: "Success",
        description: "Museum added successfully"
      });
      navigate('/historicalPlaces');
    } catch (error) {
      console.error('Error adding museum:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add museum"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-transparent"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Add New Museum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Museum Name</label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Enter museum name"
                    value={museum.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    name="description"
                    placeholder="Enter museum description"
                    value={museum.description}
                    onChange={handleChange}
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Picture URLs
                  </label>
                  <Input
                    type="text"
                    name="pictures"
                    placeholder="Enter comma-separated picture URLs"
                    value={museum.pictures.join(', ')}
                    onChange={handlePicturesChange}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input
                    type="text"
                    name="location"
                    placeholder="Enter museum location"
                    value={museum.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Opening Hours
                  </label>
                  <Input
                    type="text"
                    name="openingHours"
                    placeholder="Enter opening hours"
                    value={museum.openingHours}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Foreigner Ticket Price
                    </label>
                    <Input
                      type="number"
                      name="ticketPrices.foreigner"
                      placeholder="Enter price"
                      value={museum.ticketPrices.foreigner}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Native Ticket Price
                    </label>
                    <Input
                      type="number"
                      name="ticketPrices.native"
                      placeholder="Enter price"
                      value={museum.ticketPrices.native}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Student Ticket Price
                    </label>
                    <Input
                      type="number"
                      name="ticketPrices.student"
                      placeholder="Enter price"
                      value={museum.ticketPrices.student}
                      onChange={handleChange}
                      required
                    />
                  </div>
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
                    value={museum.tags.join(', ')}
                    onChange={handleTagsChange}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg">
                  Add Museum
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddMuseum;