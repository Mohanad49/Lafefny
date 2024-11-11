/* eslint-disable no-unused-vars */
import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/roomDetails.css';

const RoomDetails = () => {
  const { hotelId } = useParams();

  return (
    <div className="room-details-container">
      <h1>Room Details</h1>
      <p>Hotel ID: {hotelId}</p>
      <p>This is a placeholder for room details. You can add more information here.</p>
    </div>
  );
};

export default RoomDetails;
