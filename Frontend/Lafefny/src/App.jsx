/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sign from './components/Sign';
import Home from './components/GuestHome';

import AdminUserManagement from './components/AdminUserManagement';
import AddAdmin from './components/AddAdmin';
import AddTourismGovernor from './components/AddTourismGovernor';
import AdminComplaintDetail from './components/AdminComplaintDetail';
import AdminComplaintList from './components/AdminComplaintList';
import ComplaintForm from './components/ComplaintForm';

import EditActivityCategory from './components/EditActivityCategory';
import ActivityCategoryList from './components/ActivityCategoryList';
import PreferenceTagList from './components/PreferenceTagList';
import AddActivityCategory from './components/AddActivityCategory';
import AddPreferenceTag from './components/AddPreferenceTag';

import AddActivity from './components/AddActivity';
import EditActivity from './components/EditActivity';
import ActivityList from './components/ActivityList';

import GuestActivityList from './components/GuestActivityList';
import GuestItineraryList from './components/Guest-ItineraryList';
import GuestMuseumList from './components/GuestMuseumList';

import TouristActivityList from './components/TouristActivityList';
import TouristItineraryList from './components/Tourist-ItineraryList';
import TouristMuseumList from './components/TouristMuseumList';
import AddTouristItinerary from './components/AddTouristItinerary';
import EditTouristItinerary from './components/EditTourist-Itinerary';
import ActivityDetail from './components/ActivityDetail';
import ItineraryDetail from './components/ItineraryDetail';
import MuseumDetail from './components/MuseumDetail';
import TouristItineraryDetail from './components/tourist-ItineraryDetail';

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
import TouristViewAllItineraries from './components/TouristViewAll-Itineraries';
import TouristSelectPreferences from './components/touristSelectPreferences';

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

import UpdateTouristInfo from './components/EditTouristInfo';
import TouristInfo from './components/GetTouristInfo';
import AddTourGuideInfo from './components/AddTourGuideInfo';
import UpdateTourGuideInfo from './components/EditTourGuideInfo';
import AddSellerInfo from './components/AddSellerInfo';
import UpdateSellerInfo from './components/EditSellerInfo';
import SellerInfo from './components/SellerInfo';
import AddAdvertiserInfo from './components/AddAdvertiserInfo';
import UpdateAdvertiserInfo from './components/EditAdvertiserInfo';
import AdvertiserInfo from './components/AdvertiserInfo';
import ChangePassword from './components/ChangePassword';
import TouristHistory from './components/TouristHistory';
import TouristComplaintList from './components/TouristComplaintList';

import './styles/styles.css'
import UploadTourGuidePhoto from './components/EditTourGuidePhoto';
import UploadSellerLogo from './components/EditSellerLogo';
import UploadAdvertiserLogo from './components/EditAdvertiserLogo';
import UploadAdvertiserDocs from './components/UploadAdvertiserDocs';
import UploadSellerDocs from './components/UploadSellerDocs';
import UploadTourGuideDocs from './components/UploadTourGuideDocs';

import AdminItineraryList from './components/Admin-ItineraryList';
import AdminActivityList from './components/Admin-ActivityList';
import SellerDelete from './components/Sellerdelete';
import DeleteAccount from './components/DeleteAccount';

import TourGuideInfo from './components/TourGuideInfo';

import TransportationBooking from './components/TransportationBooking';
import BookHotels from './components/BookHotels';
import RoomDetails from './components/RoomDetails';
import BookFlights from './components/BookFlights';

import TouristWishlist from './components/TouristWishlist';
import TouristCart from './components/TouristCart';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Sign />} />
        <Route path="/guestHome" element={<Home />} />
        <Route path="/guestActivities" element={<GuestActivityList />} />
        <Route path="/guest-Itineraries" element={<GuestItineraryList />} />
        <Route path="/guestMuseums" element={<GuestMuseumList />} />

        {/* Protected Routes */}
        {/* Admin Routes */}
        <Route path="/adminHome" element={<ProtectedRoute><AdminHome /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><AdminUserManagement /></ProtectedRoute>} />
        <Route path="/add-admin" element={<ProtectedRoute><AddAdmin /></ProtectedRoute>} />
        <Route path="/add-tourism-governor" element={<ProtectedRoute><AddTourismGovernor /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute><AdminComplaintList /></ProtectedRoute>} />
        <Route path="/admin/complaints/:id" element={<ProtectedRoute><AdminComplaintDetail /></ProtectedRoute>} />
        <Route path="/admin-itineraries" element={<ProtectedRoute><AdminItineraryList /></ProtectedRoute>} />
        <Route path="/admin-activities" element={<ProtectedRoute><AdminActivityList /></ProtectedRoute>} />

        {/* Tourist Routes */}
        <Route path="/touristHome" element={<ProtectedRoute><TouristHome /></ProtectedRoute>} />
        <Route path="/touristActivities" element={<ProtectedRoute><TouristActivityList /></ProtectedRoute>} />
        <Route path="/tourist-Itineraries" element={<ProtectedRoute><TouristItineraryList /></ProtectedRoute>} />
        <Route path="/touristAll-Itineraries" element={<ProtectedRoute><TouristViewAllItineraries /></ProtectedRoute>} />
        <Route path="/touristMuseums" element={<ProtectedRoute><TouristMuseumList /></ProtectedRoute>} />
        <Route path="/touristProducts" element={<ProtectedRoute><TouristProductList /></ProtectedRoute>} />
        <Route path="/add-tourist-itinerary" element={<ProtectedRoute><AddTouristItinerary /></ProtectedRoute>} />
        <Route path="/edit-tourist-itinerary/:id" element={<ProtectedRoute><EditTouristItinerary /></ProtectedRoute>} />
        <Route path="/touristHistory/:userID" element={<ProtectedRoute><TouristHistory /></ProtectedRoute>} />
        <Route path="/my-complaints" element={<ProtectedRoute><TouristComplaintList /></ProtectedRoute>} />
        <Route path="/tourist/wishlist" element={<ProtectedRoute><TouristWishlist /></ProtectedRoute>} />
        <Route path="/tourist/cart" element={<ProtectedRoute><TouristCart /></ProtectedRoute>} />
        <Route path="/touristEditInfo" element={<ProtectedRoute><UpdateTouristInfo /></ProtectedRoute>} />
        <Route path="/viewTouristInfo" element={<ProtectedRoute><TouristInfo /></ProtectedRoute>} />
        <Route path="/touristSelectPreferences" element={<ProtectedRoute><TouristSelectPreferences /></ProtectedRoute>} />

        {/* Tour Guide Routes */}
        <Route path="/tourGuideHome" element={<ProtectedRoute><TourGuideHome /></ProtectedRoute>} />
        <Route path="/guide-tourist-Itineraries" element={<ProtectedRoute><GuideTouristItineraryList /></ProtectedRoute>} />
        <Route path="/addTourGuideInfo" element={<ProtectedRoute><AddTourGuideInfo /></ProtectedRoute>} />
        <Route path="/editTourGuideInfo" element={<ProtectedRoute><UpdateTourGuideInfo /></ProtectedRoute>} />
        <Route path="/getTourGuideInfo" element={<ProtectedRoute><TourGuideInfo /></ProtectedRoute>} />
        <Route path="/editProfilePhoto" element={<ProtectedRoute><UploadTourGuidePhoto /></ProtectedRoute>} />
        <Route path="/uploadTourGuideDocs" element={<ProtectedRoute><UploadTourGuideDocs /></ProtectedRoute>} />

        {/* Seller Routes */}
        <Route path="/sellerHome" element={<ProtectedRoute><SellerHome /></ProtectedRoute>} />
        <Route path="/addSellerInfo" element={<ProtectedRoute><AddSellerInfo /></ProtectedRoute>} />
        <Route path="/editSellerInfo" element={<ProtectedRoute><UpdateSellerInfo /></ProtectedRoute>} />
        <Route path="/sellerinfo" element={<ProtectedRoute><SellerInfo /></ProtectedRoute>} />
        <Route path="/seller-delete/:id" element={<ProtectedRoute><SellerDelete /></ProtectedRoute>} />
        <Route path="/editSellerLogo" element={<ProtectedRoute><UploadSellerLogo /></ProtectedRoute>} />
        <Route path="/uploadSellerDocs" element={<ProtectedRoute><UploadSellerDocs /></ProtectedRoute>} />

        {/* Advertiser Routes */}
        <Route path="/advertiserHome" element={<ProtectedRoute><AdvertiserHome /></ProtectedRoute>} />
        <Route path="/addAdvertiserInfo" element={<ProtectedRoute><AddAdvertiserInfo /></ProtectedRoute>} />
        <Route path="/updateAdvertiserInfo" element={<ProtectedRoute><UpdateAdvertiserInfo /></ProtectedRoute>} />
        <Route path="/getAdvertiserInfo" element={<ProtectedRoute><AdvertiserInfo /></ProtectedRoute>} />
        <Route path="/editAdvertiserPhoto" element={<ProtectedRoute><UploadAdvertiserLogo /></ProtectedRoute>} />
        <Route path="/uploadAdvertiserDocs" element={<ProtectedRoute><UploadAdvertiserDocs /></ProtectedRoute>} />

        {/* Shared Protected Routes */}
        <Route path="/activities" element={<ProtectedRoute><ActivityList /></ProtectedRoute>} />
        <Route path="/add-activity" element={<ProtectedRoute><AddActivity /></ProtectedRoute>} />
        <Route path="/edit-activity/:id" element={<ProtectedRoute><EditActivity /></ProtectedRoute>} />
        <Route path="/activities/:id" element={<ProtectedRoute><ActivityDetail /></ProtectedRoute>} />
        
        <Route path="/itineraries" element={<ProtectedRoute><ItineraryList /></ProtectedRoute>} />
        <Route path="/add-Itinerary" element={<ProtectedRoute><AddItinerary /></ProtectedRoute>} />
        <Route path="/edit-Itinerary/:id" element={<ProtectedRoute><EditItinerary /></ProtectedRoute>} />
        <Route path="/itineraries/:id" element={<ProtectedRoute><ItineraryDetail /></ProtectedRoute>} />
        
        <Route path="/museums" element={<ProtectedRoute><MuseumList /></ProtectedRoute>} />
        <Route path="/add-museum" element={<ProtectedRoute><AddMuseum /></ProtectedRoute>} />
        <Route path="/edit-museum/:id" element={<ProtectedRoute><EditMuseum /></ProtectedRoute>} />
        <Route path="/museums/:id" element={<ProtectedRoute><MuseumDetail /></ProtectedRoute>} />
        
        <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
        <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
        
        <Route path="/complaints" element={<ProtectedRoute><ComplaintForm /></ProtectedRoute>} />
        <Route path="/changepassword" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/delete-account" element={<ProtectedRoute><DeleteAccount /></ProtectedRoute>} />
        
        <Route path="/transportation-booking" element={<ProtectedRoute><TransportationBooking /></ProtectedRoute>} />
        <Route path="/book-flights" element={<ProtectedRoute><BookFlights /></ProtectedRoute>} />
        <Route path="/book-hotels" element={<ProtectedRoute><BookHotels /></ProtectedRoute>} />
        <Route path="/room-details/:hotelId" element={<ProtectedRoute><RoomDetails /></ProtectedRoute>} />
        
        <Route path="/map" element={<ProtectedRoute><MapMarker /></ProtectedRoute>} />

        {/* Tourism Governor Routes */}
        <Route path="/TourismGovernorHome" element={
          <ProtectedRoute>
            <TourismGovernorHome />
          </ProtectedRoute>
        } />
        
        <Route path="/edit-category/:id" element={
          <ProtectedRoute>
            <EditActivityCategory />
          </ProtectedRoute>
        } />
        
        <Route path="/add-activityCategory" element={
          <ProtectedRoute>
            <AddActivityCategory />
          </ProtectedRoute>
        } />
        
        <Route path="/add-preferenceTag" element={
          <ProtectedRoute>
            <AddPreferenceTag />
          </ProtectedRoute>
        } />
        
        <Route path="/activityCategories" element={
          <ProtectedRoute>
            <ActivityCategoryList />
          </ProtectedRoute>
        } />
        
        <Route path="/preferenceTags" element={
          <ProtectedRoute>
            <PreferenceTagList />
          </ProtectedRoute>
        } />
        
        <Route path="/edit-tag/:id" element={
          <ProtectedRoute>
            <EditPreferenceTag />
          </ProtectedRoute>
        } />
        
        <Route path="/add-museum-tag" element={
          <ProtectedRoute>
            <AddMuseumTag />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
