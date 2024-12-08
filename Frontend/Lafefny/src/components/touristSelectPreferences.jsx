import React, { useState, useEffect } from 'react';
import { getAllPreferenceTags } from '../services/preferenceTagService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Tag, Save, Check, Sparkles, X } from 'lucide-react';
import Navigation from './Navigation';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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

    if (selectedPreferences.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one preference."
      });
      return;
    }

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 md:px-8 pt-24 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 hover:-translate-x-1 transition-transform self-start group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:animate-pulse" />
              Back
            </button>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">Personalize Your Experience</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                Select Your Preferences
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose your interests to help us create a personalized experience just for you
              </p>
            </div>
          </div>

          {/* Selected Tags Preview */}
          {selectedPreferences.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Selected Preferences</h2>
                <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full">
                  {selectedPreferences.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPreferences.map(pref => (
                  <button
                    key={pref}
                    onClick={() => handleTogglePreference(pref)}
                    className="inline-flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm font-medium transition-colors group"
                  >
                    <span>{pref}</span>
                    <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Grid */}
          <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
            <div className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tags.map(tag => (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => handleTogglePreference(tag.name)}
                      className={`group relative flex items-start gap-4 p-6 rounded-2xl border text-left transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        ${selectedPreferences.includes(tag.name)
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                        selectedPreferences.includes(tag.name)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                      }`}>
                        {selectedPreferences.includes(tag.name) ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Tag className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-lg mb-1">{tag.name}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tag.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {selectedPreferences.length === 0 ? (
                      'No preferences selected'
                    ) : (
                      <>
                        <span className="font-medium text-foreground">{selectedPreferences.length}</span>
                        {' preferences selected'}
                      </>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="relative px-8 py-6 text-base font-medium transition-all hover:translate-y-[-2px]"
                    disabled={selectedPreferences.length === 0}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save Preferences
                    {selectedPreferences.length > 0 && (
                      <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-background text-foreground text-xs h-5 min-w-[20px] rounded-full flex items-center justify-center border border-border shadow-sm">
                        {selectedPreferences.length}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SelectPreferences;