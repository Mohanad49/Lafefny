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

import TransportationBooking from './components/TransportationBooking';

const App = () => {

  return (
    <Router>
      <Routes>
          <>
            <Route path="/map" element={<MapMarker />} />
            <Route path="/" element={<Sign />} />

            <Route path="/guestHome" element={<Home />} />
            <Route path="/guestActivities" element={<GuestActivityList />} />
            <Route path="/guest-Itineraries" element={<GuestItineraryList />} />
            <Route path="/guestMuseums" element={<GuestMuseumList />} />
            
            <Route path="/users" element={<AdminUserManagement />} />
            <Route path="/add-admin" element={<AddAdmin />} />
            <Route path="/add-tourism-governor" element={<AddTourismGovernor />} />
            <Route path="/complaints" element={<ComplaintForm />} />
            <Route path="/admin/complaints" element={<AdminComplaintList />} />
            <Route path="/admin/complaints/:id" element={<AdminComplaintDetail />} />
            
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
            <Route path="/touristAll-Itineraries" element={<TouristViewAllItineraries />} />
            <Route path="/touristMuseums" element={<TouristMuseumList />} />
            <Route path="/touristProducts" element={<TouristProductList />} />
            <Route path="/activities/:id" element={<ActivityDetail />} /> 
            <Route path="/itineraries/:id" element={<ItineraryDetail />} /> 
            <Route path="/tourist-Itineraries/:id" element={<TouristItineraryDetail />} /> 
            <Route path="/museums/:id" element={<MuseumDetail />} /> 

            <Route path="/add-tourist-itinerary" element={<AddTouristItinerary />} />
            <Route path="/edit-tourist-itinerary/:id" element={<EditTouristItinerary />} />
            <Route path="/guide-tourist-Itineraries" element={<GuideTouristItineraryList />} />
            <Route path="/touristHistory/:userID" element={<TouristHistory />} />
            <Route path="/my-complaints" element={<TouristComplaintList />} />

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

            <Route path="/touristEditInfo" element={<UpdateTouristInfo></UpdateTouristInfo>}/>
            <Route path="/viewTouristInfo" element={<TouristInfo></TouristInfo>}/>
            <Route path="/changepassword" element={<ChangePassword></ChangePassword>}/>
            
            <Route path="/touristSelectPreferences" element={<TouristSelectPreferences />} />

            <Route path='/addTourGuideInfo' element={<AddTourGuideInfo></AddTourGuideInfo>}/>
            <Route path='/editTourGuideInfo' element={<UpdateTourGuideInfo></UpdateTourGuideInfo>}/>
            <Route path='/getTourGuideInfo' element={<TouristInfo></TouristInfo>}/>

            <Route path="/addSellerInfo" element={<AddSellerInfo></AddSellerInfo>}/>
            <Route path='/editSellerInfo' element={<UpdateSellerInfo></UpdateSellerInfo>}/>
            <Route path="/sellerinfo" element={<SellerInfo></SellerInfo>}/>
            <Route path="/seller-delete/:id" element={<SellerDelete />} />

            <Route path='/addAdvertiserInfo' element={<AddAdvertiserInfo></AddAdvertiserInfo>}/>
            <Route path='/updateAdvertiserInfo' element={<UpdateAdvertiserInfo></UpdateAdvertiserInfo>}/>
            <Route path="/getAdvertiserInfo" element={<AdvertiserInfo></AdvertiserInfo>}/>
            
            <Route path="/editProfilePhoto" element={<UploadTourGuidePhoto></UploadTourGuidePhoto>}/>
            <Route path="/editSellerLogo" element={<UploadSellerLogo></UploadSellerLogo>}/>
            <Route path="/editAdvertiserPhoto" element={<UploadAdvertiserLogo></UploadAdvertiserLogo>}/>
            <Route path="/uploadAdvertiserDocs" element={<UploadAdvertiserDocs></UploadAdvertiserDocs>}/>
            <Route path="/uploadSellerDocs" element={<UploadSellerDocs></UploadSellerDocs>}/>
            <Route path="/uploadTourGuideDocs" element={<UploadTourGuideDocs></UploadTourGuideDocs>}/>

            <Route path="/admin-itineraries" element={<AdminItineraryList />} />
            <Route path="/admin-activities" element={<AdminActivityList />} />
            <Route path="/delete-account" element={<DeleteAccount />} />

            <Route path="/transportation-booking" element={<TransportationBooking />} />
          </>
      </Routes>
    </Router>
  );
};

export default App;
