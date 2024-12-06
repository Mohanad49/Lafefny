import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { 
  Menu, Plane, MapPin, Globe, Navigation as NavigationIcon, Search, 
  Activity, History, ChevronDown, User, LogOut, ShoppingCart,
  Calendar, Landmark, Building, Car, ShoppingBag, Package, 
  Settings, Lock, Heart, MessageSquare, List, Trash2, Bell,
  AlertTriangle
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import authService from '../services/authService'; 
import notificationService from '../services/notificationService';
import { useState, useEffect, useRef } from "react";
import { destinations } from "../data/destinations"; 
import { useCurrency, currencies } from "../context/CurrencyContext";

const Navigation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const { currency, setCurrency } = useCurrency();
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem('userID');
  const username = localStorage.getItem('currentUserName');
  const isTourist = localStorage.getItem('userRole') === 'Tourist';
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);

  const notificationIcons = {
    INAPPROPRIATE_FLAG: AlertTriangle,
    OUT_OF_STOCK: Package,
    EVENT_REMINDER: Calendar
  };

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isLoggedIn) {
        try {
          const userId = localStorage.getItem('userID');
          const fetchedNotifications = await notificationService.getNotifications(userId);
          setNotifications(fetchedNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
  }, [isLoggedIn]);

  // Search handler
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Filter destinations based on search term
    const filtered = destinations.filter(dest => 
      dest.name.toLowerCase().includes(value.toLowerCase()) ||
      dest.description.toLowerCase().includes(value.toLowerCase())
    );

    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleLogout = async () => {
    authService.logout();
    navigate('/');
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? {...n, read: true} : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderAccountSection = () => {
    if (isLoggedIn) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg text-gray-600">
            <User className="h-5 w-5" />
            <span>{username}</span>
          </div>
          <Button 
            variant="default"
            className="w-full justify-start bg-black text-white hover:bg-gray-800" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/sign')}>
          Sign In
        </Button>
        <Button variant="default" className="w-full bg-black text-white hover:bg-gray-800" onClick={() => navigate('/sign')}>
          Book Now
        </Button>
      </div>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-2 pt-4">
                  <Plane className="h-6 w-6" />
                  <span className="text-xl font-semibold">Lafefny</span>
                </div>
                
                <div className="space-y-4">
                  {!isTourist && (
                    <>
                    <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Navigation</h3>
                    <div className="space-y-4">
                      <Link to="/destinations" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <MapPin className="h-5 w-5" />
                        Destinations
                      </Link>
                      <Link to="/activities" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <Activity className="h-5 w-5" />
                        Activities
                      </Link>
                      <Link to="/historicalPlaces" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <History className="h-5 w-5" />
                        Historical Places
                      </Link>
                      <Link to="/tours" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <Globe className="h-5 w-5" />
                        Tours
                      </Link>
                      <Link to="/about" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                        <NavigationIcon className="h-5 w-5" />
                        About
                      </Link>
                    </div>
                  </div>
                  </>)}

                  {isLoggedIn && isTourist && (
                    <>
                      {/* Activities & Itineraries Section */}
                      <div className="border-b pb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Activities & Itineraries</h3>
                        <div className="space-y-4">
                          <Link to="/touristActivities" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Activity className="h-5 w-5" />
                            View Activities
                          </Link>
                          <Link to="/tourist-Itineraries" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Calendar className="h-5 w-5" />
                            My Itineraries
                          </Link>
                          <Link to="/touristAll-Itineraries" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Globe className="h-5 w-5" />
                            Browse Itineraries  
                          </Link>
                          <Link to="/touristMuseums" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Landmark className="h-5 w-5" />
                            Museums & History
                          </Link>
                          <Link to={`/touristHistory/${localStorage.getItem("userID")}`} className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <History className="h-5 w-5" />
                            History
                          </Link>
                        </div>
                      </div>

                      {/* Bookings Section */}
                      <div className="border-b pb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Travel Bookings</h3>
                        <div className="space-y-4">
                          <Link to="/book-flights" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Plane className="h-5 w-5" />
                            Book Flights
                          </Link>
                          <Link to="/book-hotels" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Building className="h-5 w-5" />
                            Book Hotels
                          </Link>
                          <Link to="/transportation-booking" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Car className="h-5 w-5" />
                            Book Transportation
                          </Link>
                        </div>
                      </div>

                      {/* Shopping Section */}
                      <div className="border-b pb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Shopping</h3>
                        <div className="space-y-4">
                          <Link to="/touristProducts" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <ShoppingBag className="h-5 w-5" />
                            View Products
                          </Link>
                          <Link to="/my-orders" className="flex items-center gap-3 text-lg text-gray-600 hover:text-gray-900 transition-colors">
                            <Package className="h-5 w-5" />
                            My Orders
                          </Link>
                          <Link
                            to="/tourist/cart"
                            className="flex items-center gap-2 text-lg text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <ShoppingCart className="h-5 w-5" />
                            Cart
                          </Link>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
                    {renderAccountSection()}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/" className="flex items-center gap-2 text-xl font-medium text-gray-900">
            <Plane className="h-6 w-6 text-black" />
            Lafefny
          </Link>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search destinations..."
              className="w-full pl-10 pr-4 bg-gray-100 border-transparent focus:border-gray-300 focus:ring-gray-300 rounded-lg"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-96 overflow-auto">
                {searchResults.map((destination, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                    onClick={() => {
                      navigate(`/destination/${destination.name.toLowerCase().replace(/\s+/g, '-')}`);
                      setShowResults(false);
                      setSearchTerm("");
                    }}
                  >
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{destination.name}</div>
                      <div className="text-sm text-gray-500">{destination.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/destinations" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Destinations
          </Link>
          <Link to="/tours" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Tours
          </Link>
          <div className="relative group" ref={currencyDropdownRef}>
            <button 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            >
              {currencies[currency].symbol} {currency}
              <ChevronDown className="h-4 w-4" />
            </button>
            {isCurrencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                {Object.keys(currencies).map((code) => (
                  <button
                    key={code}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                      currency === code ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => {
                      setCurrency(code);
                      setIsCurrencyDropdownOpen(false);
                    }}
                  >
                    {currencies[code].symbol} {code}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{username}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                    <Link to="/viewTouristInfo" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>
                    <Link to="/touristEditInfo" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Link>
                    <Link to="/changePassword" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Lock className="h-4 w-4" />
                      Change Password
                    </Link>
                    {isTourist && (
                    <>
                    <Link to="/touristSelectPreferences" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Heart className="h-4 w-4" />
                        Preferences
                      </Link><Link to="/manage-addresses" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <MapPin className="h-4 w-4" />
                          Addresses
                        </Link><Link to="/complaints" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <MessageSquare className="h-4 w-4" />
                          Submit Complaint
                        </Link><Link to="/my-complaints" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <List className="h-4 w-4" />
                          View Complaints
                        </Link>
                        </>
                    )}
                    <div className="border-t my-2"></div>
                    <Link to="/delete-account" className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Link>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        <button 
                          className="text-xs text-primary hover:text-primary/80"
                          onClick={() => {
                            notifications.forEach(n => {
                              if (!n.read) handleMarkAsRead(n._id);
                            });
                          }}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const Icon = notificationIcons[notification.type] || Bell;
                          return (
                            <div 
                              key={notification._id}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? 'bg-blue-50/50' : ''
                              }`}
                              onClick={() => handleMarkAsRead(notification._id)}
                            >
                              <div className="flex items-start gap-3">
                                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{notification.type.replace(/_/g, ' ')}</p>
                                  <p className="text-sm text-gray-600">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <span className="h-2 w-2 mt-1 rounded-full bg-blue-500" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No notifications
                        </div>
                      )}
                    </div>

                    <div className="px-4 py-2 border-t border-border">
                      <Link
                        to="/notifications"
                        className="text-xs text-center w-full block text-primary hover:text-primary/80"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {isTourist && (
                <Link 
                  to="/tourist/cart"
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Link>
              )}
              <Button 
                variant="default"
                className="bg-black text-white hover:bg-gray-800 flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="hidden md:inline-flex hover:bg-gradient-to-r from-[#9EE755] to-[#CFDD3C] hover:text-black transition-all"
                onClick={() => navigate('/sign')}
              > 
                Sign In
              </Button>
              <Button 
                className="bg-black text-white hover:bg-gray-800" 
                onClick={() => navigate('/sign')}
              >
                Book Now
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;