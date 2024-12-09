/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Calendar, Globe, MapPin, Plus, Tag, Shield } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import NotificationBell from './NotificationBell';
import '../styles/homePage.css'; // Ensure this path is correct
import SalesReport from './SalesReport';

const TourGuideHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
                Tour Guide Dashboard
                <span className="block text-2xl sm:text-3xl text-muted-foreground mt-2">
                  Manage Activities, Itineraries & More
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
                    <Shield className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Role</p>
                    <p className="text-lg font-semibold text-primary">Tour Guide</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                    <Calendar className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Upcoming Tours</p>
                    <p className="text-lg font-semibold text-primary">5</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="p-4 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
                    <Globe className="h-7 w-7 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Itineraries</p>
                    <p className="text-lg font-semibold text-primary">12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-primary mb-8">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { to: "/Activities", icon: Activity, label: "View Activities" },
                { to: "/tours", icon: Calendar, label: "View Itineraries" },
                { to: "/add-itinerary", icon: Plus, label: "Add Itinerary" }
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
              {/* Add upcoming activities here */}
              <div className="text-center py-12 bg-slate-50/50 rounded-xl">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No upcoming activities</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sales Report Section */}
        <section className="px-6 lg:px-8 py-12 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary">Sales Report</h2>
              <Link to="/sales-report" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                View Detailed Report
              </Link>
            </div>
            <SalesReport />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TourGuideHome;