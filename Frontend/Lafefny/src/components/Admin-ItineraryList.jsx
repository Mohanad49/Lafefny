import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItineraries, updateItineraryInappropriateFlag } from '../services/itineraryService';
import { ArrowLeft, Globe2, DollarSign, Flag, Route } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import Navigation from '../components/Navigation';

const AdminItineraryList = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await getItineraries();
      setItineraries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch itineraries."
      });
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleInappropriateFlag = async (id, currentFlag) => {
    try {
      await updateItineraryInappropriateFlag(id, !currentFlag);
      await fetchItineraries();
      toast({
        title: "Success",
        description: `Itinerary marked as ${!currentFlag ? 'inappropriate' : 'appropriate'}.`
      });
    } catch (error) {
      console.error('Error toggling inappropriate flag:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update itinerary status."
      });
    }
  };

  if (loading) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      

        <div className="lg:p-8">
          
          <div className="mx-auto flex w-full flex-col justify-center space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 md:mb-0 hover:translate-x-1 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
            <div className="flex flex-col space-y-2 text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">
                Manage Itineraries
              </h1>
              <p className="text-sm text-muted-foreground">
                Review and moderate itinerary listings
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {itineraries.map((itinerary) => (
                <Card key={itinerary._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold">
                        {itinerary.name}
                      </CardTitle>
                      <Badge 
                        variant={itinerary.inappropriateFlag ? "destructive" : "secondary"}
                      >
                        {itinerary.inappropriateFlag ? 'Inappropriate' : 'Appropriate'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe2 className="h-4 w-4" />
                      {itinerary.language}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      ${itinerary.price}
                    </div>
                    <Button
                      onClick={() => toggleInappropriateFlag(itinerary._id, itinerary.inappropriateFlag)}
                      variant={itinerary.inappropriateFlag ? "outline" : "destructive"}
                      className="w-full"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Mark as {itinerary.inappropriateFlag ? 'Appropriate' : 'Inappropriate'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {itineraries.length === 0 && (
              <div className="text-center py-12">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No itineraries found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminItineraryList;