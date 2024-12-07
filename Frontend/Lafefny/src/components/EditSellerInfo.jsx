/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UpdateSellerInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
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
            logo: sellerInfo.logo || "",
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

  const handleChangePhoto = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setFormData({ ...formData, logo: base64 });
  };

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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">Loading seller information...</div>;
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
        Back 
      </Button>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {formData.name} Info
          </h2>
        </div>
          {/* Profile Picture Section */}
          <div className="absolute top-20 left-10 flex flex-col items-center space-y-4 mb-8">
                <div className="relative">
                    <img
                        src={formData.logo || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="w-40 h-40 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    />
                </div>
                <input
                    type="file"
                    onChange={handleChangePhoto}
                    accept="image/*"
                    className="block w-64 text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-medium
                        file:bg-black file:text-white
                        hover:file:bg-gray-800
                        file:cursor-pointer cursor-pointer"
                />
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
          <div className="flex gap-4">
            <button
                type="button" // Important: type="button" prevents form submission
                onClick={() => navigate(-1)}
                className="w-1/2 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="w-1/2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
            >
                Save
            </button>
          </div>

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

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}
