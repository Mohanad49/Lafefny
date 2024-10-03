/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import './ReviewModal.css'; // Import the CSS file for styling

const ReviewModal = ({ reviews, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Reviews</h2>
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review, index) => (
              <li key={index}>
                <strong>User:</strong> {review.user} <br />
                <strong>Comment:</strong> {review.comment} <br />
                <strong>Rating:</strong> {review.rating} ⭐
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;