import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Menu, Plane, MapPin, Globe, Navigation as NavigationIcon, Search, Activity, History, ChevronDown, User, LogOut } from "lucide-react"; // Add User icon import
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import authService from '../services/authService'; 
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

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                
                <div className="space-y-6">
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
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-5 w-5" />
                <span className="font-medium">{username}</span>
              </div>
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