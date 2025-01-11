/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, User, Phone, Globe, Briefcase, Calendar, Wallet, 
  Award, Trophy, Star, Shield, Crown, Sparkles 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import Navigation from './Navigation';

const TouristInfo = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [touristData, setTouristData] = useState(null);
  const [error, setError] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    dateOfBirth: "",
    mobileNumber: "",
    nationality: "",
    job: "",
  });

  useEffect(() => {
    fetchTouristInfo();
  }, []);

  const fetchTouristInfo = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tourist/getTouristInfo/${localStorage.getItem("userID")}`);
      if (!response.ok) {
        throw new Error("Tourist not found");
      }
      const data = await response.json();
      setTouristData(data);
      setEditFormData({
        dateOfBirth: data[0].dateOfBirth || "",
        mobileNumber: data[0].mobileNumber || "",
        nationality: data[0].nationality || "",
        job: data[0].job || "",
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRedeemPoints = async () => {
    setIsRedeeming(true);
    try {
      const userId = localStorage.getItem('userID');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/tourist/redeemPoints/${userId}`
      );
      
      setTouristData([{
        ...touristData[0],
        wallet: response.data.newWalletBalance,
        loyaltyPoints: response.data.remainingPoints
      }]);
      
      await Swal.fire({
        icon: 'success',
        title: 'Points Redeemed',
        text: `Successfully redeemed ${response.data.pointsRedeemed} points for ${response.data.egpAdded} EGP`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'Failed to redeem points'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tourist/updateTouristInfo/${localStorage.getItem("userID")}`, {
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
        text: 'Tourist information updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });

      setShowEditModal(false);
      fetchTouristInfo();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'An error occurred while updating tourist info'
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
        `${import.meta.env.VITE_API_URL}/request-deletion/${auth.userID}`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
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

  if (!touristData) {
    return <p className="text-muted-foreground p-4">Loading tourist information...</p>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-28 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 md:mb-0 hover:translate-x-1 transition-transform"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h1 className="text-4xl font-bold text-foreground">Tourist Profile</h1>
              <p className="text-muted-foreground text-lg">Manage your personal information and preferences</p>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 py-3 px-6 rounded-xl text-sm font-medium transition-all hover:scale-105"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                onClick={handleDeleteRequest}
                className="flex items-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 py-3 px-6 rounded-xl text-sm font-medium transition-all hover:scale-105"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Personal Information Card */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
                    <User className="h-6 w-6 text-primary" />
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-background/50 p-4 rounded-xl">
                        <label className="text-sm text-muted-foreground block mb-2">Username</label>
                        <p className="text-foreground font-medium text-lg">{touristData[0].username}</p>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl">
                        <label className="text-sm text-muted-foreground block mb-2">Date of Birth</label>
                        <p className="text-foreground font-medium text-lg flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          {new Date(touristData[0].dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl">
                        <label className="text-sm text-muted-foreground block mb-2">Mobile Number</label>
                        <p className="text-foreground font-medium text-lg flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary" />
                          {touristData[0].mobileNumber}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-background/50 p-4 rounded-xl">
                        <label className="text-sm text-muted-foreground block mb-2">Nationality</label>
                        <p className="text-foreground font-medium text-lg flex items-center gap-3">
                          <Globe className="h-5 w-5 text-primary" />
                          {touristData[0].nationality}
                        </p>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl">
                        <label className="text-sm text-muted-foreground block mb-2">Job</label>
                        <p className="text-foreground font-medium text-lg flex items-center gap-3">
                          <Briefcase className="h-5 w-5 text-primary" />
                          {touristData[0].job}
                        </p>
                      </div>
                      <div className="bg-background/50 p-4 rounded-xl">
                        <label className="text-sm text-muted-foreground block mb-2">Wallet Balance</label>
                        <p className="text-foreground font-medium text-lg flex items-center gap-3">
                          <Wallet className="h-5 w-5 text-primary" />
                          <span className="text-xl font-bold">EGP {Number(touristData[0].wallet || 0).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Program Card */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <h2 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
                    <Award className="h-6 w-6 text-primary" />
                    Loyalty Program
                  </h2>
                  
                  <div className="space-y-8">
                    {/* Points Display */}
                    <div className="bg-primary/5 rounded-2xl p-6 text-center">
                      <label className="text-sm text-muted-foreground block mb-2">Points Balance</label>
                      <p className="text-4xl font-bold text-primary">
                        {Number(touristData[0].loyaltyPoints || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Total Points Earned</p>
                    </div>
                    
                    {/* Level Display */}
                    <div className="bg-background/50 rounded-2xl p-6">
                      <label className="text-sm text-muted-foreground block mb-3">Current Level</label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trophy className={`h-8 w-8 ${getLevelColor(touristData[0].level)}`} />
                          <div>
                            <p className={`text-2xl font-bold ${getLevelColor(touristData[0].level)}`}>
                              Level {touristData[0].level || 1}
                            </p>
                            <p className="text-sm text-muted-foreground">Explorer Status</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Badge Display */}
                    <div className="bg-background/50 rounded-2xl p-6">
                      <label className="text-sm text-muted-foreground block mb-3">Badge Status</label>
                      <div className="flex items-center gap-4">
                        {getBadgeIcon(touristData[0].badge)}
                        <div>
                          <p className="text-xl font-semibold">{touristData[0].badge || 'Bronze'}</p>
                          <p className="text-sm text-muted-foreground">Current Rank</p>
                        </div>
                      </div>
                    </div>

                    {touristData[0].loyaltyPoints >= 10000 && (
                      <button 
                        onClick={handleRedeemPoints}
                        disabled={isRedeeming}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 px-6 rounded-xl font-medium text-lg transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-5 w-5" />
                        {isRedeeming ? 'Redeeming Points...' : 'Redeem Points'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl rounded-2xl bg-card p-8 shadow-xl border border-border">
                <h3 className="text-2xl font-semibold mb-8">Edit Profile Information</h3>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editFormData.dateOfBirth}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={editFormData.mobileNumber}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={editFormData.nationality}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Job</label>
                    <input
                      type="text"
                      name="job"
                      value={editFormData.job}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-10">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-3 border border-input rounded-xl text-base font-medium hover:bg-accent transition-all hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:bg-primary/90 transition-all hover:scale-105"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TouristInfo;
