/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getTouristBookings, addActivityReview, addItineraryReview, addTourGuideReview } from '../services/touristHistoryService';
import ReviewForm from './ReviewForm';

import '../styles/ItineraryList.css';
const userID = localStorage.getItem("userID");


const TouristHistory = ({ userID }) => {
  const [bookedActivities, setBookedActivities] = useState([]);
  const [bookedItineraries, setBookedItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [touristName, setTouristName] = useState('');

  useEffect(() => {
    // Fetch tourist's booked activities and itineraries
    const fetchBookings = async () => {
        try {
            const response = await getTouristBookings(localStorage.getItem("userID"));
            
            setBookedActivities(response.data.pastActivities);
            setBookedItineraries(response.data.pastItineraries);
            setTouristName(response.data.touristName);
          } catch (error) {
            console.error('Error fetching bookings:', error);
          
      } finally {
        setLoading(false);
      }
    };
    
    
    fetchBookings();
  }, [localStorage.getItem("userID")]);

  const openReviewModal = (target, title) => {
    setReviewTarget(target);
    setReviewTitle(title);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewTarget(null);
    setReviewTitle('');
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!rating || !comment) {
      alert('Please provide both rating and comment');
      return;
    }

    const review = {
      reviewerName: touristName,
      rating: parseInt(rating),
      comment,
      date: new Date()
    };

    try {
      let response;
      if (reviewTitle.includes('Activity')) {
        response = await addActivityReview(reviewTarget, review);
        // Update the local state to reflect the new review
        setBookedActivities(prevActivities => 
          prevActivities.map(activity => 
            activity._id === reviewTarget 
              ? { ...activity, ratings: response.data.ratings }
              : activity
          )
        );
      } else if (reviewTitle.includes('Itinerary')) {
        response = await addItineraryReview(reviewTarget, review);
        setBookedItineraries(prevItineraries => 
          prevItineraries.map(itinerary => 
            itinerary._id === reviewTarget 
              ? { ...itinerary, ratings: response.data.ratings }
              : itinerary
          )
        );
      } else if (reviewTitle.includes('Tour Guide')) {
        console.log('Submitting tour guide review for:', reviewTarget);
        console.log('Review data:', review);
        response = await addTourGuideReview(reviewTarget, review);
        console.log('Tour guide review response:', response);
      }
      
      alert('Review submitted successfully!');
      closeReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Failed to submit review: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="tourist-history-container">
      <h1>Activity and Itinerary History</h1>

      <h2>Booked Activities</h2>
      {
        <ul className="activity-list">
          {bookedActivities.map((activity) => (
            <li key={activity._id} className="activity-item">
              <h3>{activity.name}</h3>
              <p className="yellow-text">Category: {activity.category}</p>
              <p className="yellow-text">Date: {new Date(activity.date).toLocaleDateString()}</p>
              <p className="yellow-text">Location: {activity.location}</p>
              <p className="yellow-text">Price: ${activity.price}</p>
              <p className="yellow-text">Tags: {activity.tags.join(', ')}</p>
              <p className="yellow-text">Special Discounts: {activity.specialDiscounts || 'None'}</p>
              <p className="yellow-text">Booking Open: {activity.bookingOpen ? 'Yes' : 'No'}</p>
              <p className="yellow-text">Rating: {activity.ratings.averageRating.toFixed(1)}</p>
              <div className="activity-actions">
                <button
                  className="review-button"
                  onClick={() => openReviewModal(activity._id, `Review Activity: ${activity.name}`)}
                >
                  Review Activity
                </button>
              </div>
            </li>
          ))}
        </ul>
      }

      <h2>Booked Itineraries</h2>
      {
        <ul className="itinerary-list">
          {bookedItineraries.map((itinerary) => (
            <li key={itinerary._id} className="itinerary-item">
              <h3>{itinerary.name}</h3>
              <p className="yellow-text">Locations: {itinerary.locations.join(', ')}</p>
              <p className="yellow-text">Price: ${itinerary.price}</p>
              <p className="yellow-text">Tourist Name: {itinerary.touristName}</p>
              <p className="yellow-text">Start Date: {new Date(itinerary.startDate).toLocaleDateString()}</p>
              <p className="yellow-text">End Date: {new Date(itinerary.endDate).toLocaleDateString()}</p>
              <p className="yellow-text">Rating: {itinerary.ratings.averageRating}</p>
              <p className="yellow-text">Preferences: {itinerary.preferences || 'None'}</p>
              <p className="yellow-text">Language: {itinerary.language || 'None'}</p>
              <p className="yellow-text">Tour Guide: {itinerary.tourGuideName || 'None'}</p>
              <div className="itinerary-actions">
                <button
                  className="review-button"
                  onClick={() => openReviewModal(itinerary._id, `Review Itinerary: ${itinerary.name}`)}
                >
                  Review Itinerary
                </button>
                <button
                  className="review-button"
                  onClick={() => {
                    if (!itinerary.tourGuideName) {
                      alert('No tour guide assigned to this itinerary');
                      return;
                    }
                    openReviewModal(itinerary.tourGuideName, `Review Tour Guide: ${itinerary.tourGuideName}`);
                  }}
                >
                  Review Tour Guide
                </button>
              </div>
            </li>
          ))}
        </ul>
      }

      {showReviewModal && (
        <ReviewForm
          title={reviewTitle}
          onClose={closeReviewModal}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default TouristHistory;
