import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, MapPin, Globe, Calendar, Settings, ShoppingBag,
  User, Star, Wallet, History, Info, Key, Tag, MessageSquare,  CreditCard, Clock, Sparkles 
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import NotificationBell from './NotificationBell';
import axios from 'axios';
import { useCurrency, currencies } from '../context/CurrencyContext';


const TouristHome = () => {
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const userId = localStorage.getItem('userID');

  const { currency } = useCurrency();
  const [conversionRates, setConversionRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);

  const [profile, setProfile] = useState({
    level: 1,
    badge: 'Bronze',
    loyaltyPoints: 0,
    wallet: 0,
  });

  useEffect(() => {
    const fetchTouristData = async () => {
      try {
        // Fetch tourist profile information
        const response = await axios.get(`http://localhost:8000/tourist/getTouristInfo/${userId}`);
        if (response.data && response.data.length > 0) {
          const touristInfo = response.data[0];
          setProfile({
            level: touristInfo.level,
            badge: touristInfo.badge,
            loyaltyPoints: touristInfo.loyaltyPoints,
            wallet: touristInfo.wallet,
            name: touristInfo.username,
          });
        }
        
        // Fetch upcoming activities
        const activitiesResponse = await axios.get(`http://localhost:8000/tourist/upcomingActivities/${userId}`);
        setUpcomingActivities(activitiesResponse.data.upcomingActivities);
      } catch (error) {
        console.error('Error fetching tourist data:', error);
      }
    };
    
    fetchTouristData();
  }, [userId]);

  useEffect(() => {
    const fetchPersonalizedData = async () => {
      try {
        // Get user preferences
        const prefsResponse = await axios.get(`http://localhost:8000/tourist/getTouristPreferences/${userId}`);
        setUserPreferences(prefsResponse.data.preferences);

        // Get recommendations based on preferences
        const recsResponse = await axios.get(`http://localhost:8000/tourist/recommendations/${userId}`);
        setRecommendations(recsResponse.data);

        // Get recently viewed from localStorage or API
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(recent);
      } catch (error) {
        console.error('Error fetching personalized data:', error);
      }
    };

    fetchPersonalizedData();
  }, [userId]);

  useEffect(() => {
    const getRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setConversionRates(rates);
      } catch (error) {
        setRatesError('Failed to load currency rates');
      } finally {
        setRatesLoading(false);
      }
    };
    getRates();
  }, []);

  const convertWalletBalance = (wallet) => {
    if (!conversionRates || !wallet) return wallet;
    const walletInUSD = wallet / conversionRates.EGP;
    return (walletInUSD * conversionRates[currency]).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section with Profile Banner */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                Welcome Back
                <span className="block text-2xl sm:text-3xl text-muted-foreground mt-2">
                  Plan, Book, and Explore
                </span>
              </h1>
              
              {/* Profile Stats Banner */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg mt-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Level {profile.level}</p>
                      <p className="font-medium">{profile.badge}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-sm text-muted-foreground">Loyalty Points</p>
                      <p className="font-medium">{profile.loyaltyPoints.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Wallet Balance</p>
                      <p className="font-medium">{currencies[currency].symbol} {convertWalletBalance(profile.wallet).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </section>

        {/* Upcoming Activities Section */}
        <section className="py-8 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Upcoming Activities</h3>
                </div>
                <Link to="/touristActivities" className="text-sm text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingActivities.length > 0 ? (
                  upcomingActivities.map((activity) => (
                    <div key={activity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {activity.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">No upcoming activities</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* New Personalized Section */}
        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8">
              {/* Recommendations */}
              <div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {recommendations.slice(0, 3).map((item) => (
                    <Link
                      key={item._id}
                      to={`/${item.type}/${item._id}`}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {item.type === 'activity' ? (
                          <Globe className="h-6 w-6 text-primary" />
                        ) : (
                          <MapPin className="h-6 w-6 text-primary" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground capitalize">
                          {item.type}
                        </span>
                      </div>
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recently Viewed */}
              <div>
                
                <div className="grid md:grid-cols-4 gap-4">
                  {recentlyViewed.slice(0, 4).map((item) => (
                    <Link
                      key={item._id}
                      to={`/${item.type}/${item._id}`}
                      className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {item.type === 'activity' ? (
                          <Globe className="h-5 w-5 text-primary" />
                        ) : (
                          <MapPin className="h-5 w-5 text-primary" />
                        )}
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Viewed {formatTimeAgo(item.viewedAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of existing sections with updated styling */}
        {/* Quick Actions */}
        <section className="py-12 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-4 gap-6">
              <Link to="/touristActivities" 
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Globe className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Activities</h3>
              </Link>
              <Link to="/book-flights"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Plane className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Flights</h3>
              </Link>
              <Link to="/book-hotels"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Settings className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Hotels</h3>
              </Link>
              <Link to="/transportation-booking"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <ShoppingBag className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Transport</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* Planning Section */}
        <section className="py-12 bg-surface px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-8">Plan Your Journey</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/tourist-Itineraries"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <Calendar className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">My Itineraries</h3>
              </Link>
              <Link to="/touristAll-Itineraries"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <Globe className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">Browse Itineraries</h3>
              </Link>
              <Link to="/touristMuseums"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <MapPin className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">Museums & History</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* Profile & Settings */}
        <section className="py-12 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-8">Account Management</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/viewTouristInfo" 
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <User className="h-5 w-5" />
                <span>Profile Info</span>
              </Link>
              <Link to="/touristEditInfo"
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <Info className="h-5 w-5" />
                <span>Edit Profile</span>
              </Link>
              <Link to="/changePassword"
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <Key className="h-5 w-5" />
                <span>Password</span>
              </Link>
              <Link to="/touristSelectPreferences"
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <Tag className="h-5 w-5" />
                <span>Preferences</span>
              </Link>
              <Link to="/complaints"
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <span>Support</span>
              </Link>
              <Link to="/manage-addresses"
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Addresses</span>
              </Link>
              <Link to={`/touristHistory/${localStorage.getItem("userID")}`}
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:border-accent transition-all flex flex-col items-center gap-2">
                <History className="h-5 w-5" />
                <span>History</span>
              </Link>
              <Link to="/delete-account"
                className="px-6 py-4 bg-background border border-border text-center rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all flex flex-col items-center gap-2">
                <User className="h-5 w-5" />
                <span>Delete Account</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Shopping Section */}
        <section className="px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Shopping & Orders</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/touristProducts" 
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Browse Products</h3>
                  <p className="text-sm text-muted-foreground">Discover local treasures</p>
                </div>
              </Link>
              <Link to="/my-orders"
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">My Orders</h3>
                  <p className="text-sm text-muted-foreground">Track your purchases</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-8 py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Profile & Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/viewTouristInfo" 
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">View Profile</span>
              </Link>
              
              <Link to="/touristEditInfo"
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Edit Profile</span>
              </Link>

              <Link to="/touristSelectPreferences"
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <Tag className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Preferences</span>
              </Link>

              <Link to="/manage-addresses"
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Addresses</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TouristHome;
