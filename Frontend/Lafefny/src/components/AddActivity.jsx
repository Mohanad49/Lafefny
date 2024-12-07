import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addActivity } from '../services/activityService';
import Map from './Map';
import mapboxgl from 'mapbox-gl';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, MapPin, Plus, Image, X } from 'lucide-react';

const AddActivity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    price: '',
    description: '',
    highlights: [],
    category: '',
    tags: [],
    specialDiscounts: '',
    bookingOpen: true,
    advertiser: localStorage.getItem('userID'),
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity(prev => ({
      ...prev,
      [name]: name === 'highlights' || name === 'tags' 
        ? value.split(',').map(item => item.trim()) 
        : value
    }));
  };

  const handleLocationSelect = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      const address = data.features[0].place_name;
      setActivity(prev => ({ ...prev, location: address }));
    } catch (error) {
      console.error('Error fetching address:', error);
      setActivity(prev => ({ ...prev, location: `${lng},${lat}` }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setActivity(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addActivity(activity);
      toast({
        title: "Success",
        description: "Activity added successfully"
      });
      navigate('/activities');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add activity"
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Add New Activity</h1>
            <p className="text-muted-foreground">Create a new activity listing for tourists</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name">Activity Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={activity.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category">Category</label>
                    <Input
                      id="category"
                      name="category"
                      value={activity.category}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  
                  <div className="space-y-2 relative z-10"> 
                  <label htmlFor="date">Date</label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={activity.date}
                    onChange={handleChange}
                    required
                    className="bg-background" // Add background color
                    style={{ 
                      position: 'relative',
                      zIndex: 40 
                    }}
                  />
                </div>

                  <div className="space-y-2">
                    <label htmlFor="time">Time</label>
                    <Input
                      type="time"
                      id="time"
                      name="time"
                      value={activity.time}
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
                      value={activity.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="specialDiscounts">Special Discounts</label>
                    <Input
                      id="specialDiscounts"
                      name="specialDiscounts"
                      value={activity.specialDiscounts}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description">Description</label>
                  <Textarea
                    id="description"
                    name="description"
                    value={activity.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="highlights">Highlights (comma-separated)</label>
                  <Input
                    id="highlights"
                    name="highlights"
                    value={activity.highlights.join(', ')}
                    onChange={handleChange}
                    placeholder="Enter highlights separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="tags">Tags (comma-separated)</label>
                  <Input
                    id="tags"
                    name="tags"
                    value={activity.tags.join(', ')}
                    onChange={handleChange}
                    placeholder="Enter tags separated by commas"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="image">Activity Image (Optional)</label>
                  <div className="flex flex-col gap-4">
                    {imagePreview && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background/90"
                          onClick={() => {
                            setImagePreview(null);
                            setActivity(prev => ({ ...prev, image: '' }));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-muted-foreground">
                        Supported formats: JPG, PNG, GIF. Max size: 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 relative z-0"> {/* Add relative and z-0 */}
                <label>Location</label>
                <div className="h-[300px] rounded-md overflow-hidden relative">
                  <Map onLocationSelect={handleLocationSelect} />
                </div>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <Input
                      name="location"
                      value={activity.location}
                      readOnly
                      placeholder="Select location on map"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Adding Activity..." : "Add Activity"}
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

export default AddActivity;