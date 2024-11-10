/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";

const UpdateTourGuideInfo = () => {
  const [formData, setFormData] = useState({
    mobile: "",
    yearsOfExperience: "",
    previousWork: "",
  });

  const [message, setMessage] = useState(""); // For success or error messages

  // Fetch existing tour guide info
  useEffect(() => {
    const fetchTourGuideInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/tourGuide/getTourGuide/${localStorage.getItem("userID")}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // Since getTourGuide returns an array, we take the first item
          const tourGuideInfo = data[0];
          
          setFormData({
            mobile: tourGuideInfo.mobile || "",
            yearsOfExperience: tourGuideInfo.yearsOfExperience || "",
            previousWork: tourGuideInfo.previousWork || "",
          });
        } else {
          setMessage("Error fetching tour guide information");
        }
      } catch (error) {
        console.error("Error:", error);
        setMessage("Error connecting to server");
      }
    };

    fetchTourGuideInfo();
  }, []); // Empty dependency array means this runs once on mount

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/tourGuide/updateTourGuideInfo/${localStorage.getItem("userID")}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      } else {
        const data = await response.json();
        setMessage("Tour guide information updated successfully!");
        console.log("Updated data:", data);
      }
    } catch (error) {
      setMessage("An error occurred while updating the tour guide info.");
    }
  };

  return (
    <div>
      <h2>Update Tour Guide Info</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Mobile:</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Years of Experience:</label>
          <input
            type="number"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Previous Work:</label>
          <input
            type="text"
            name="previousWork"
            value={formData.previousWork}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Update Tour Guide Info</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateTourGuideInfo;
