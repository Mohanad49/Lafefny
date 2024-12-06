/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UpdateSellerInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch existing seller info
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/seller/getSeller/${localStorage.getItem(
            "userID"
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          // Since getSeller returns an array, take the first item
          const sellerInfo = data[0];

          setFormData({
            name: sellerInfo.name || "",
            description: sellerInfo.description || "",
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
      const response = await fetch(
        `http://localhost:8000/seller/updateSellerInfo/${localStorage.getItem(
          "userID"
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="absolute top-4 left-4 flex items-center gap-2 hover:bg-accent/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Previous
      </Button>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Update Seller Info
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>
          <button
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
            type="submit"
          >
            Update Seller Information
          </button>
          {message && (
                <div className="mt-4 text-center text-sm text-gray-600">
                    {message}
                </div>
            )}
        </form>
      </div>

  
    </div>
  );
};

export default UpdateSellerInfo;
