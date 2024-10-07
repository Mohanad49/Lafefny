/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sign from './components/Sign';
import Home from './components/GuestHome';

import AdminUserManagement from './components/AdminUserManagement';
import AddAdmin from './components/AddAdmin';
import AddTourismGovernor from './components/AddTourismGovernor';

import EditActivityCategory from './components/EditActivityCategory';
import ActivityCategoryList from './components/ActivityCategoryList';
import PreferenceTagList from './components/PreferenceTagList';
import AddActivityCategory from './components/AddActivityCategory';
import AddPreferenceTag from './components/AddPreferenceTag';

import AddActivity from './components/AddActivity';
import EditActivity from './components/EditActivity';
import ActivityList from './components/ActivityList';

import TouristActivityList from './components/TouristActivityList';
import TouristItineraryList from './components/Tourist-ItineraryList';
import TouristMuseumList from './components/TouristMuseumList';
import AddTouristItinerary from './components/AddTouristItinerary';
import EditTouristItinerary from './components/EditTourist-Itinerary';

import GuideTouristItineraryList from './components/TourGuideItineraries';
import  AddItinerary from './components/AddItinerary';
import  EditItinerary from './components/EditItinerary';
import  ItineraryList from './components/ItineraryList';

import  AddMuseum from './components/AddMuseum';
import  MuseumList from './components/MuseumList';

import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import ProductList from './components/ProductList';

import TouristProductList from './components/TouristProductList';
import GuestItineraryList from './components/Guest-ItineraryList';

import AdminHome from './components/AdminHome';
import AdvertiserHome from './components/AdvertiserHome';
import SellerHome from './components/SellerHome';
import TourGuideHome from './components/TourGuideHome';
import TouristHome from './components/TouristHome';
import TourismGovernorHome from './components/TourismGovernorHome';

import AddMuseumTag from './components/AddMuseumTag';
import EditPreferenceTag from './components/EditPreferenceTag';
import EditMuseum from './components/EditMuseum';
import MapMarker from './components/Map';

import './styles/styles.css'

const App = () => {

  return (
    <Router>
      <Routes>
          <>
            <Route path="/map" element={<MapMarker />} />
            <Route path="/" element={<Sign />} />
            <Route path="/guestHome" element={<Home />} />
            <Route path="/guest-Itineraries" element={<GuestItineraryList />} />
            
            <Route path="/users" element={<AdminUserManagement />} />
            <Route path="/add-admin" element={<AddAdmin />} />
            <Route path="/add-tourism-governor" element={<AddTourismGovernor />} />
            
            <Route path="/edit-category/:id" element={<EditActivityCategory />} />
            <Route path="/add-activityCategory" element={<AddActivityCategory />} />
            <Route path="/add-preferenceTag" element={<AddPreferenceTag />} />
            <Route path="/activityCategories" element={<ActivityCategoryList />} />
            <Route path="/preferenceTags" element={<PreferenceTagList />} />

            <Route path="/adminHome" element={<AdminHome />} />
            <Route path="/advertiserHome" element={<AdvertiserHome />} />
            <Route path="/sellerHome" element={<SellerHome />} />
            <Route path="/TourGuideHome" element={<TourGuideHome />} />
            <Route path="/TouristHome" element={<TouristHome />} />
            <Route path="/TourismGovernorHome" element={<TourismGovernorHome />} />

            <Route path="/touristActivities" element={<TouristActivityList />} />
            <Route path="/tourist-Itineraries" element={<TouristItineraryList />} />
            <Route path="/touristMuseums" element={<TouristMuseumList />} />
            <Route path="/touristProducts" element={<TouristProductList />} />
            <Route path="/add-tourist-itinerary" element={<AddTouristItinerary />} />
            <Route path="/edit-tourist-itinerary/:id" element={<EditTouristItinerary />} />
            <Route path="/guide-tourist-Itineraries" element={<GuideTouristItineraryList />} />
            <Route path="/activities" element={<ActivityList />} />
            <Route path="/add-activity" element={<AddActivity />} />
            <Route path="/edit-activity/:id" element={<EditActivity />} />

            <Route path="/itineraries" element={<ItineraryList />} />
            <Route path="/add-Itinerary" element={<AddItinerary />} />
            <Route path="/edit-Itinerary/:id" element={<EditItinerary />} />

            <Route path="/museums" element={<MuseumList />} />
            <Route path="/add-museum" element={<AddMuseum />} />
            <Route path="/edit-museum/:id" element={<EditMuseum />} />
            <Route path="/add-museum-tag" element={<AddMuseumTag />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/edit-product/:id" element={<EditProduct />} />
            
            <Route path="/edit-tag/:id" element={<EditPreferenceTag />} />
            <Route path="/edit-museum/:id" element={<EditMuseum />} />
          </>
      </Routes>
    </Router>
  );
};

export default App;
