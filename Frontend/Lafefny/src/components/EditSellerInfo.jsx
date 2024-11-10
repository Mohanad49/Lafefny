/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";

const UpdateSellerInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing seller info
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/seller/getSeller/${localStorage.getItem("userID")}`
        );
        
        if (response.ok) {
          const data = await response.json();
          // Since getSeller returns an array, take the first item
          const sellerInfo = data[0];
          
          setFormData({
            name: sellerInfo.name || "",
            description: sellerInfo.description || ""
          });
        } else {
          setMessage("Error fetching seller information");
        }
      } catch (error) {
        console.error("Error:", error);
        setMessage("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
  }, []); // Empty dependency array means this runs once on mount

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
      const response = await fetch(`http://localhost:8000/seller/updateSellerInfo/${localStorage.getItem("userID")}`, {
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
        setMessage("Seller information updated successfully!");
        console.log("Updated data:", data);
      }
    } catch (error) {
      setMessage("An error occurred while updating the seller info.");
    }
  };

  if (loading) {
    return <div>Loading seller information...</div>;
  }

  return (
    <div>
      <h2>Update Seller Info</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Information</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateSellerInfo;
