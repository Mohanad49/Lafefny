/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UpdateAdvertiserInfo = () => {
  const [formData, setFormData] = useState({
    hotline: "",
    company: "",
    website: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch existing advertiser info
  useEffect(() => {
    const fetchAdvertiserInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/advertiser/getAdvertiser/${localStorage.getItem(
            "userID"
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          // Add null check for advertiserInfo
          if (data && data[0]) {
            const advertiserInfo = data[0];
            setFormData({
              hotline: advertiserInfo.hotline?.toString() || "",
              company: advertiserInfo.company || "",
              website: advertiserInfo.website || "",
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
      const response = await fetch(
        `http://localhost:8000/advertiser/updateAdvertiser/${localStorage.getItem(
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back Button */}
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
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Previous
        </Button>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Update Advertiser Info
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Hotline
            </label>
            <input
              type="text"
              name="hotline"
              value={formData.hotline}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
            />
          </div>
          <div className="pt-4">
          <button
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
            type="submit"
          >
            Update Information
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

export default UpdateAdvertiserInfo;
