// src/pages/Tutorial.jsx
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Tutorial = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 flex items-center gap-2 hover:bg-accent/10"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
            Platform Tutorial
          </h1>
          <p className="text-muted-foreground">
            Your guide to traveling the world!
          </p>
        </div>

        {/* Video Container */}
        <div className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <iframe 
            src="https://scribehow.com/embed/Navigating_the_Lafefny_Platform_for_Activities_and_Bookings__fifrtlQtTa-H_lqyR0gSRA?skipIntro=true&as=video" 
            width="100%" 
            height="640" 
            allowFullScreen 
            frameBorder="0"
            className="w-full aspect-video"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tutorial;