/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMuseumById, updateMuseum } from '../services/museumService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, MapPin, Clock, Tag, Image, Ticket } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navigation from './Navigation';

const EditMuseum = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMuseum = async () => {
      try {
        setLoading(true);
        const response = await getMuseumById(id);
        setMuseum(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching museum:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch museum data"
        });
        setLoading(false);
      }
    };

    fetchMuseum();
  }, [id, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('ticketPrices.')) {
      const priceType = name.split('.')[1];
      setMuseum(prevState => ({
        ...prevState,
        ticketPrices: {
          ...prevState.ticketPrices,
          [priceType]: parseFloat(value)
        }
      }));
    } else {
      setMuseum(prevState => ({
        ...prevState,
        [name]: value
      }));
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
      await updateMuseum(id, museum);
      toast({
        title: "Success",
        description: "Museum updated successfully"
      });
      navigate('/manage-museums');
    } catch (error) {
      console.error('Error updating museum:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update museum"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading museum data...</div>
        </main>
      </div>
    );
  }

  if (!museum) return null;

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
              Edit Museum
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
                  Update Museum
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditMuseum;
