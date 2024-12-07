/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, Globe, PlusCircle, 
  User, Key, Settings, AlertCircle,
  Calendar, MapPin, Building, Loader2
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const AdvertiserHome = () => {
  const [activities, setActivities] = useState([]);
  const [advertiserInfo, setAdvertiserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please login again.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    fetchAdvertiserData();
  }, [userId]);

  const fetchAdvertiserData = async () => {
    try {
      // First get advertiser info
      const advertiserRes = await axios.get(`http://localhost:8000/advertiser/getAdvertiser/${userId}`);
      const advertiserData = advertiserRes.data[0];
      setAdvertiserInfo(advertiserData);
  
      // Then get activities using the correct endpoint URL
      if (advertiserData) {
        const activitiesRes = await axios.get(`http://localhost:8000/activities/advertiser/${userId}`);
        const fetchedActivities = activitiesRes.data;
        setActivities(fetchedActivities.slice(0, 4)); // Only show first 4 activities
      }
  
      setIsLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: error.response?.status === 404 
          ? "No activities found for this advertiser" 
          : "Failed to fetch advertiser data",
        variant: error.response?.status === 404 ? "default" : "destructive",
      });
      setActivities([]); // Set empty array on error
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Company Info Section */}
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Company Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-xl font-semibold">{advertiserInfo?.company || 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Hotline</p>
                <p className="text-xl font-semibold">{advertiserInfo?.hotline || 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Active Activities</p>
                <p className="text-xl font-semibold">{activities?.length || 0}</p>
              </div>
            </div>
          </section>

          {/* Featured Activities Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Activities</h2>
              <Button
                variant="link"
                onClick={() => navigate('/activities')}
              >
                View All Activities
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map((activity) => (
                <Card key={activity._id}>
                  <div className="relative h-48">
                    <img
                      src={activity.image}
                      alt={activity.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{activity.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {activity.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-primary font-medium">
                        {activity.bookingOpen ? 'Open' : 'Closed'}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/edit-activity/${activity._id}`)}>
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/activities" 
                className="p-6 bg-background border border-border rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <span className="font-medium">View Activities</span>
              </Link>
              
              <Link to="/add-activity"
                className="p-6 bg-background border border-border rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <PlusCircle className="h-6 w-6 text-primary" />
                <span className="font-medium">Add Activity</span>
              </Link>

              <Link to="/Tours"
                className="p-6 bg-background border border-border rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <span className="font-medium">Itineraries</span>
              </Link>

              <Link to="/HistoricalPlaces"
                className="p-6 bg-background border border-border rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                <span className="font-medium">Historical Places</span>
              </Link>
            </div>
          </section>

          {/* Account Management */}
          <section className="bg-surface rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Account Management</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/viewAdvertiserInfo"
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Profile Info</span>
              </Link>

              <Link to="/changePassword"
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Password</span>
              </Link>

              <Link to="/viewAdvertiserInfo"
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2 hover:bg-red-50 hover:text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Delete Account</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdvertiserHome;