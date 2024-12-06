/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getAllPreferenceTags } from '../services/preferenceTagService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Tag, Save, Check } from 'lucide-react';
import Navigation from '../components/Navigation';
import { useToast } from "@/components/ui/use-toast";

const SelectPreferences = () => {
  const [tags, setTags] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await getAllPreferenceTags();
        setTags(tagsData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch preference tags');
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTogglePreference = (tag) => {
    setSelectedPreferences((prev) => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userID = localStorage.getItem('userID');

    try {
      const response = await axios.put(`http://localhost:8000/tourist/updatePreferences/${userID}`, { preferences: selectedPreferences });
      toast({
        title: "Success",
        description: "Your preferences have been updated successfully!"
      });
      navigate('/touristHome');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preferences. Please try again."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <button
          onClick={() => navigate(-1)}
          className="fixed top-20 left-4 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-4 rounded-lg shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="max-w-md w-full mt-8" style={{ margin: '0 auto' }}>
          <div className="flex items-center gap-3 mb-6 justify-center">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Select Your Preferences</h1>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {tags.map(tag => (
                  <div
                    key={tag._id}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors w-full cursor-pointer hover:bg-accent
                      ${selectedPreferences.includes(tag.name)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                      }`}
                    onClick={() => handleTogglePreference(tag.name)}
                  >
                    {selectedPreferences.includes(tag.name) && (
                      <div className="absolute right-4 top-4">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex-shrink-0 mt-1">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow pr-8">
                      <div className="font-medium">{tag.name}</div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tag.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-medium transition-colors w-full justify-center"
                >
                  <Save className="h-4 w-4" />
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPreferences;