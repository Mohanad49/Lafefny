import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, Landmark, Globe, Heart, User } from 'lucide-react';

const TouristMenubar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const username = localStorage.getItem('currentUserName');
  const menuItems = [
    {
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      path: '/touristHome'
    },
    {
      label: username,
      icon: <User className="h-5 w-5" />,
      path: '/viewTouristInfo'
    },
    {
      label: 'Activities',
      icon: <Activity className="h-5 w-5" />,
      path: '/activities'
    },
    {
      label: 'Historical Places',
      icon: <Landmark className="h-5 w-5" />,
      path: '/historicalPlaces'
    },
    {
      label: 'Tours',
      icon: <Globe className="h-5 w-5" />,
      path: '/tours'
    },
    {
      label: 'Wishlist',
      icon: <Heart className="h-5 w-5" />,
      path: '/tourist/wishlist'
    }
    
  ];

  return (
    <div className="space-y-4">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 text-lg ${
            isActive(item.path)
              ? 'text-gray-900 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default TouristMenubar;
