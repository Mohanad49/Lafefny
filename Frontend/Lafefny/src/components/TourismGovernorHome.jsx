/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Globe, Building2, Key, 
  Plus, History, Map, Tag, Shield
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

const TourismGovernorHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                Tourism Governor Dashboard
                <span className="block text-2xl sm:text-3xl text-muted-foreground mt-2">
                  Manage Activities, Museums & Itineraries
                </span>
              </h1>
　　 　 　 　 {/* Stats Banner */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg mt-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium">Tourism Governor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Access Level</p>
                      <p className="font-medium">Tourism Management</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/activities" 
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Activity className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Activities</h3>
              </Link>
              <Link to="/tours"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Globe className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Itineraries</h3>
              </Link>
              <Link to="/historicalPlaces"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Building2 className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Museums</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* Museum Management */}
        <section className="py-12 bg-surface px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-8">Museum Management</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/add-museum"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <Plus className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">Add Museum</h3>
                <p className="text-sm text-muted-foreground mt-2">Add new historical places and museums</p>
              </Link>
              <Link to="/manage-museums"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <Building2 className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">Manage Museums</h3>
                <p className="text-sm text-muted-foreground mt-2">Edit, update, and delete museums</p>
              </Link>
              <Link to="/add-museum-tag"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <Tag className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">Museum Tags</h3>
                <p className="text-sm text-muted-foreground mt-2">Manage museum categories and tags</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section className="px-6 lg:px-8 py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/changepassword" 
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <Key className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Change Password</span>
              </Link>
　　 　 　 　 <Link to="/profile"
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Profile Settings</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TourismGovernorHome;