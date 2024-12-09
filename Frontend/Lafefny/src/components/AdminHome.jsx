import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Settings, ShoppingBag, Tag, MessageSquare, 
  Plus, Key, UserPlus, BarChart, Activity, Globe,
  LayoutGrid, Ticket, History, Shield
} from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import NotificationBell from './NotificationBell';

const AdminHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section with Admin Banner */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                Admin Dashboard
                <span className="block text-2xl sm:text-3xl text-muted-foreground mt-2">
                  Manage, Monitor, and Control
                </span>
              </h1>
              
              {/* Admin Stats Banner */}
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg mt-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium">Administrator</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">System Access</p>
                      <p className="font-medium">Full Control</p>
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
          <h2 className="text-3xl font-bold text-center mb-8">Quick Actions</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <Link to="/users" 
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Users className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Users</h3>
              </Link>
              <Link to="/admin-activities"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <Activity className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Activities</h3>
              </Link>
              <Link to="/products"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <ShoppingBag className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Products</h3>
              </Link>
              <Link to="/admin/complaints"
                className="p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all flex flex-col items-center group">
                <MessageSquare className="h-10 w-10 mb-4 group-hover:text-accent transition-colors" />
                <h3 className="text-xl font-semibold">Complaints</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* User Management Section */}
        <section className="py-12 bg-surface px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-8">User Management</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/add-tourism-Governor"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <UserPlus className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">Add Governor</h3>
              </Link>
              <Link to="/add-admin"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <Plus className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">Add Admin</h3>
              </Link>
              <Link to="/numberOfUsers"
                className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-all flex flex-col items-center">
                <BarChart className="h-8 w-8 mb-4" />
                <h3 className="text-xl font-semibold">User Statistics</h3>
              </Link>
            </div>
          </div>
        </section>

        {/* Activity & Content Management */}
        <section className="py-12 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6">Content Management</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="grid gap-4">
                <Link to="/activityCategories"
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <LayoutGrid className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Activity Categories</h3>
                    <p className="text-sm text-muted-foreground">Manage activity types</p>
                  </div>
                </Link>
                <Link to="/preferenceTags"
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <Tag className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Preference Tags</h3>
                    <p className="text-sm text-muted-foreground">Manage user preferences</p>
                  </div>
                </Link>
              </div>
              <div className="grid gap-4">
                <Link to="/admin-itineraries"
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <Globe className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Itineraries</h3>
                    <p className="text-sm text-muted-foreground">View all itineraries</p>
                  </div>
                </Link>
                <Link to="/create-promo-code"
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <Ticket className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Promo Codes</h3>
                    <p className="text-sm text-muted-foreground">Manage promotions</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Section */}
        <section className="px-6 lg:px-8 py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-center place-items-center">
              <Link to="/changePassword" 
                className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                <Key className="h-6 w-6 mb-2 text-primary group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium">Change Password</span>
              </Link>
              
              <Link to="/add-activityCategory"
                className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                <Plus className="h-6 w-6 mb-2 text-primary group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium">Add Category</span>
              </Link>

              <Link to="/activityCategories/"
                className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                <LayoutGrid className="h-6 w-6 mb-2 text-primary group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium">Edit Categories</span>
              </Link>

              <Link to="/add-preferenceTag"
                className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                <Tag className="h-6 w-6 mb-2 text-primary group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium">Add Tag</span>
              </Link>

              <Link to="/preferenceTags"
                className="w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group">
                <Settings className="h-6 w-6 mb-2 text-primary group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium">Edit Tags</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminHome;