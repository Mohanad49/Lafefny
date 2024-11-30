import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Menu, Plane, MapPin, Globe, Navigation as NavigationIcon, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();

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
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        Sign In
                      </Button>
                      <Button variant="default" className="w-full bg-black text-white hover:bg-gray-800">
                        Book Now
                      </Button>
                    </div>
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

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search destinations..."
              className="w-full pl-10 pr-4 bg-gray-100 border-transparent focus:border-gray-300 focus:ring-gray-300 rounded-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/destinations" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Destinations
          </Link>
          <Link to="/tours" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Tours
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          className="hidden md:inline-flex hover:bg-gradient-to-r from-[#9EE755] to-[#CFDD3C] hover:text-black transition-all"
          onClick={() => navigate('/sign')}
        > 
          Sign In
        </Button>
          <Button className="bg-black text-white hover:bg-gray-800">
            Book Now
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;