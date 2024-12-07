import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivities, updateActivityInappropriateFlag } from '../services/activityService';
import { ArrowLeft, Map, DollarSign, Flag } from 'lucide-react';
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

const AdminActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await getActivities();
      setActivities(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch activities."
      });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleInappropriateFlag = async (id, currentFlag) => {
    try {
      await updateActivityInappropriateFlag(id, !currentFlag);
      await fetchActivities();
      toast({
        title: "Success",
        description: `Activity marked as ${!currentFlag ? 'inappropriate' : 'appropriate'}.`
      });
    } catch (error) {
      console.error('Error toggling inappropriate flag:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update activity status."
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
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Manage Activities
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and moderate activity listings
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <Card key={activity._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">
                      {activity.name}
                    </CardTitle>
                    <Badge 
                      variant={activity.inappropriateFlag ? "destructive" : "secondary"}
                    >
                      {activity.inappropriateFlag ? 'Inappropriate' : 'Appropriate'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Map className="h-4 w-4" />
                    {activity.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    ${activity.price}
                  </div>
                  <Button
                    onClick={() => toggleInappropriateFlag(activity._id, activity.inappropriateFlag)}
                    variant={activity.inappropriateFlag ? "outline" : "destructive"}
                    className="w-full"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Mark as {activity.inappropriateFlag ? 'Appropriate' : 'Inappropriate'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No activities found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminActivityList;