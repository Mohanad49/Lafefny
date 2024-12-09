import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, MapPin, Globe, Calendar, Settings, ShoppingBag,
  User, Star, Wallet, History, Info, Key, Tag, MessageSquare,  CreditCard, Clock, Sparkles, Bookmark, Heart, ChevronRight, PlayCircle
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import NotificationBell from './NotificationBell';
import axios from 'axios';
import { useCurrency, currencies } from '../context/CurrencyContext';
import { Button } from "@/components/ui/button"; 
import { Coins, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";


const TouristHome = () => {
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [upcomingItineraries, setUpcomingItineraries] = useState([]);
  const [userPreferences, setUserPreferences] = useState([]);
  const userId = localStorage.getItem('userID');

  const { currency } = useCurrency();
  const [conversionRates, setConversionRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();

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

        try {
          // Fetch upcoming itineraries - wrapped in try-catch to handle 404 gracefully
          const itinerariesResponse = await axios.get(`http://localhost:8000/tourist/upcomingItineraries/${userId}`);
          setUpcomingItineraries(itinerariesResponse.data.upcomingItineraries);
        } catch (error) {
          // If endpoint is not ready, set empty array and log only in development
          console.log('Itineraries endpoint not available yet');
          setUpcomingItineraries([]);
        }
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
  const convertPrice = (priceInEGP) => {
    if (!priceInEGP) return 0;
    const price = typeof priceInEGP === 'string' ? parseFloat(priceInEGP) : priceInEGP;
    return Math.round(price * currencies[currency].rate);
  };

  const handleRedeemPoints = async () => {
    try {
      setIsRedeeming(true);
      const response = await axios.post(
        `http://localhost:8000/tourist/redeemPoints/${userId}`
      );
      
      setProfile(prev => ({
        ...prev,
        wallet: response.data.newWalletBalance,
        loyaltyPoints: response.data.remainingPoints
      }));
  
      toast({
        title: "Points Redeemed Successfully!",
        description: `${response.data.pointsRedeemed} points redeemed for ${response.data.egpAdded}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Redemption Failed",
        description: error.response?.data?.error || "Failed to redeem points",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-transparent px-6 lg:px-8 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-primary mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Welcome Back
                <span className="block text-2xl sm:text-3xl text-muted-foreground mt-4 text-slate-600">
                  Plan, Book, and Explore
                </span>
              </h1>
            </div>
          </div>
        </section>

        {/* Profile Stats Banner */}
        <section className="px-6 lg:px-8 -mt-10 mb-8">
          <div className="mx-auto max-w-7xl">
            <div className="bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm bg-white/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Level {profile.level}</p>
                    <p className="text-lg font-semibold text-primary">{profile.badge}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <Star className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Loyalty Points</p>
                    <p className="text-lg font-semibold text-primary">{profile.loyaltyPoints.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
                    <Wallet className="h-7 w-7 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Wallet Balance</p>
                    <p className="text-lg font-semibold text-primary">
                    {currencies[currency].symbol}{convertPrice(profile.wallet).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-8 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-center">
              {profile.loyaltyPoints >= 10000 && (
                <Button
                  onClick={handleRedeemPoints}
                  disabled={isRedeeming}
                  className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redeeming...
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4" />
                      Redeem Points
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-primary mb-8">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[/* 
                { to: "/tourist-Itineraries", icon: Calendar, label: "My Itineraries" },
                */ 
                { to: "/activities", icon: Globe, label: "Activities" },
                { to: "/book-flights", icon: Plane, label: "Flights" },
                { to: "/book-hotels", icon: Settings, label: "Hotels" },
                { to: "/transportation-booking", icon: ShoppingBag, label: "Transport" }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="p-8 rounded-xl bg-white hover:bg-primary/5 transition-all flex flex-col items-center group shadow-sm hover:shadow-md"
                >
                  <item.icon className="h-8 w-8 mb-4 text-primary group-hover:text-accent transition-colors" />
                  <h3 className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{item.label}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Activities */}
        <section className="bg-white px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary">Upcoming Activities</h2>
              <Link to="/Activities" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                View All
              </Link>
            </div>
            <div className="grid gap-4">
              {upcomingActivities.length > 0 ? (
                upcomingActivities.map((activity) => (
                  <Link
                    key={activity._id}
                    to={`/activities/${activity._id}`}
                    className="block group"
                  >
                    <div className="p-6 bg-slate-50/50 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{activity.name}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm px-4 py-1.5 bg-primary/5 text-primary rounded-full font-medium">
                          {activity.status}
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No upcoming activities</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Upcoming Itineraries */}
        <section className="bg-white px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary">Upcoming Itineraries</h2>
              <Link to="/tours" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                View All
              </Link>
            </div>
            <div className="grid gap-4">
              {upcomingItineraries.length > 0 ? (
                upcomingItineraries.map((itinerary) => (
                  <Link
                    key={itinerary._id}
                    to={`/itineraries/${itinerary._id}`}
                    className="block group"
                  >
                    <div className="p-6 bg-slate-50/50 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{itinerary.name}</p>
                          <p className="text-sm text-slate-500">{new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No upcoming itineraries</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Plan Your Journey */}
        <section className="px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-primary mb-8">Plan Your Journey</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[/* 
                { to: "/tourist-Itineraries", icon: Calendar, label: "My Itineraries" },
                */ 
                { to: "/Tours", icon: Globe, label: "Browse Itineraries" },
                { to: "/HistoricalPlaces", icon: MapPin, label: "Museums & History" }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center group"
                >
                  <item.icon className="h-8 w-8 mb-4 text-primary group-hover:text-accent transition-colors" />
                  <h3 className="font-semibold text-slate-700 group-hover:text-primary transition-colors">{item.label}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Account Management */}
        <section className="bg-white px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-primary mb-8">Account Management</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[/* 
                { to: "/tourist-Itineraries", icon: Calendar, label: "My Itineraries" },
                */ 
                { to: "/viewTouristInfo", icon: User, label: "Profile Info" },
                { to: "/changePassword", icon: Key, label: "Password" },
                { to: "/touristSelectPreferences", icon: Tag, label: "Preferences" },
                { to: "/complaints", icon: MessageSquare, label: "Support" },
                { to: "/manage-addresses", icon: MapPin, label: "Addresses" },
                { to: `/touristHistory/${localStorage.getItem("userID")}`, icon: History, label: "History" },
                { to: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
                { to: "/tutorial", icon: PlayCircle, label: "Tutorial" }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className={`p-6 bg-slate-50/50 rounded-xl transition-all flex flex-col items-center gap-3 group hover:shadow-sm
                    ${item.danger 
                      ? 'hover:bg-red-50 hover:text-red-500' 
                      : 'hover:bg-primary/5'
                    }`}
                >
                  <item.icon className={`h-6 w-6 ${item.danger ? 'text-slate-600 group-hover:text-red-500' : 'text-primary group-hover:text-accent'} transition-colors`} />
                  <span className="text-sm font-medium text-center text-slate-700 group-hover:text-inherit transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Shopping Section */}
        <section className="px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-primary mb-8">Shopping & Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[/* 
                { to: "/tourist-Itineraries", icon: Calendar, label: "My Itineraries" },
                */ 
                { 
                  to: "/touristProducts",
                  icon: ShoppingBag,
                  label: "Browse Products",
                  description: "Discover local treasures"
                },
                {
                  to: "/my-orders",
                  icon: CreditCard,
                  label: "My Orders",
                  description: "Track your purchases"
                },
                {
                  to: "/tourist/wishlist",
                  icon: Heart,
                  label: "Wishlist",
                  description: "Your saved items"
                }
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-6 group"
                >
                  <div className="p-4 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 group-hover:text-primary transition-colors mb-1">{item.label}</h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TouristHome;
