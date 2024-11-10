/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";

const UpdateAdvertiserInfo = () => {
  const [formData, setFormData] = useState({
    hotline: "",
    company: "",
    website: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing advertiser info
  useEffect(() => {
    const fetchAdvertiserInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/advertiser/getAdvertiser/${localStorage.getItem("userID")}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // Add null check for advertiserInfo
          if (data && data[0]) {
            const advertiserInfo = data[0];
            setFormData({
              hotline: advertiserInfo.hotline?.toString() || "",
              company: advertiserInfo.company || "",
              website: advertiserInfo.website || ""
            });
          } else {
            setMessage("No advertiser information found");
          }
        } else {
          setMessage("Error fetching advertiser information");
        }
      } catch (error) {
        console.error("Error:", error);
        setMessage("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertiserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/advertiser/updateAdvertiser/${localStorage.getItem("userID")}`, {
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
        setMessage("Advertiser information updated successfully!");
        console.log("Updated data:", data);
      }
    } catch (error) {
      setMessage("An error occurred while updating the Advertiser info.");
    }
  };

  if (loading) {
    return <div>Loading advertiser information...</div>;
  }

  return (
    <div>
      <h2>Update Advertiser Info</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Hotline:</label>
          <input
            type="text"
            name="hotline"
            value={formData.hotline}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Company:</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Website:</label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Information</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default UpdateAdvertiserInfo;
