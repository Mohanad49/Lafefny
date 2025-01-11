/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, User, Phone, Briefcase, Calendar, 
  Award, Trophy, Star, Shield, Crown, Sparkles 
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Navigation from './Navigation';

const UpdateTourGuideInfo = () => {
  const navigate = useNavigate();
  const [tourGuideData, setTourGuideData] = useState(null);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    mobile: "",
    yearsOfExperience: "",
    previousWork: "",
    picture: "",
  });

  useEffect(() => {
    fetchTourGuideInfo();
  }, []);

  const fetchTourGuideInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tourGuide/getTourGuide/${localStorage.getItem("userID")}`);
      if (!response.ok) {
        throw new Error("Tour Guide not found");
      }
      const data = await response.json();
      setTourGuideData(data);
      setEditFormData({
        mobile: data[0].mobile || "",
        yearsOfExperience: data[0].yearsOfExperience || "",
        previousWork: data[0].previousWork || "",
        picture: data[0].picture || "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tourGuide/updateTourGuideInfo/${localStorage.getItem("userID")}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Tour Guide information updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });

      setShowEditModal(false);
      fetchTourGuideInfo();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred while updating tour guide info'
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteRequest = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to request account deletion? This request will be reviewed by an admin.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/request-deletion/${localStorage.getItem("userID")}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit deletion request');
      }
      
      await Swal.fire({
        icon: 'success',
        title: 'Request Submitted',
        text: 'Your account deletion request has been submitted successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate('/');
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to submit account deletion request'
      });
    }
  };

  const getBadgeIcon = (badge) => {
    switch(badge?.toLowerCase()) {
      case 'gold':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'silver':
        return <Shield className="h-6 w-6 text-gray-400" />;
      case 'platinum':
        return <Sparkles className="h-6 w-6 text-blue-400" />;
      default:
        return <Star className="h-6 w-6 text-amber-700" />; // Bronze
    }
  };

  const getLevelColor = (level) => {
    const lvl = parseInt(level) || 1;
    if (lvl >= 5) return 'text-purple-500';
    if (lvl >= 3) return 'text-blue-500';
    return 'text-green-500';
  };

  if (error) {
    return <p className="text-destructive p-4">Error: {error}</p>;
  }

  if (!tourGuideData) {
    return <p className="text-muted-foreground p-4">Loading tour guide information...</p>;
  }

  const tourGuide = tourGuideData[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="relative mb-6">
              <img 
                src={tourGuide.picture || "https://via.placeholder.com/150"} 
                alt="Profile" 
                className="w-48 h-48 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{tourGuide.username}</h2>
            <p className="text-muted-foreground">{tourGuide.email}</p>
          </div>

          {/* Detailed Information */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <User className="h-6 w-6 mr-2 text-primary" />
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    {tourGuide.mobile || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Years of Experience</p>
                  <p className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-primary" />
                    {tourGuide.yearsOfExperience || 'Not specified'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Previous Work</p>
                  <p className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    {tourGuide.previousWork || 'No previous work listed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-primary" />
                Account Actions
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Profile
                </button>
                <button 
                  onClick={handleDeleteRequest}
                  className="flex-1 flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Request Account Deletion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Edit className="h-6 w-6 mr-2 text-primary" />
                Edit Profile
              </h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={editFormData.mobile}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={editFormData.yearsOfExperience}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Work
                  </label>
                  <input
                    type="text"
                    name="previousWork"
                    value={editFormData.previousWork}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditFormData(prev => ({
                          ...prev,
                          picture: reader.result
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateTourGuideInfo;