/* eslint-disable react-hooks/exhaustive-deps */
import  { useState, useEffect } from "react";

const TourGuideInfo = () => {
  const [tourGuideData, setTourGuideData] = useState(null); // State for tour guide data
  const [error, setError] = useState(""); // State for error handling

  // Fetch tour guide info when the component mounts
  useEffect(() => {
    const fetchTourGuide = async () => {
      try {
        const response = await fetch(`http://localhost:8000/tourGuide/getTourGuide/${localStorage.getItem("userID")}`);
        if (!response.ok) {
          throw new Error("Tour guide not found");
        }
        const data = await response.json();
        setTourGuideData(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTourGuide();
  }, [localStorage.getItem("userID")]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!tourGuideData) {
    return <p>Loading tour guide information...</p>;
  }

  return (
    <div>
      <h2>Tour Guide Information</h2>
      {tourGuideData.length > 0 ? (
        <>
          <p><strong>Mobile:</strong> {tourGuideData[0].mobile}</p>
          <p><strong>Years of Experience:</strong> {tourGuideData[0].yearsOfExperience}</p>
          <p><strong>Previous Work:</strong> {tourGuideData[0].previousWork}</p>
        </>
      ) : (
        <p>No tour guide information found.</p>
      )}
    </div>
  );
};

export default TourGuideInfo;
