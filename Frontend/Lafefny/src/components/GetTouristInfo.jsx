/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

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
      const response = await fetch(`http://localhost:8000/tourist/getTouristInfo/${localStorage.getItem("userID")}`);
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
        `http://localhost:8000/tourist/redeemPoints/${userId}`
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
      const response = await fetch(`http://localhost:8000/tourist/updateTouristInfo/${localStorage.getItem("userID")}`, {
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
        `http://localhost:8000/request-deletion/${auth.userID}`, 
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

  if (error) {
    return <p className="text-destructive p-4">Error: {error}</p>;
  }

  if (!touristData) {
    return <p className="text-muted-foreground p-4">Loading tourist information...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Info
          </button>
          <button
            onClick={handleDeleteRequest}
            className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-primary mb-6">Tourist Information</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Username</td>
                  <td className="py-3 px-4">{touristData[0].username}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Date of Birth</td>
                  <td className="py-3 px-4">{new Date(touristData[0].dateOfBirth).toLocaleDateString()}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Mobile Number</td>
                  <td className="py-3 px-4">{touristData[0].mobileNumber}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Nationality</td>
                  <td className="py-3 px-4">{touristData[0].nationality}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Job</td>
                  <td className="py-3 px-4">{touristData[0].job}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Wallet</td>
                  <td className="py-3 px-4">EGP {Number(touristData[0].wallet || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-4 bg-accent/10 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Loyalty Program</h3>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Points</td>
                  <td className="py-3 px-4">{Number(touristData[0].loyaltyPoints || 0)} points</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium text-muted-foreground">Level</td>
                  <td className="py-3 px-4">{touristData[0].level || 1}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-muted-foreground">Badge</td>
                  <td className="py-3 px-4">{touristData[0].badge || 'Bronze'}</td>
                </tr>
              </tbody>
            </table>

            {touristData[0].loyaltyPoints >= 10000 && (
              <button 
                onClick={handleRedeemPoints}
                disabled={isRedeeming}
                className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem Points'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-lg bg-card p-6 shadow-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Edit Tourist Information</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editFormData.dateOfBirth}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={editFormData.mobileNumber}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={editFormData.nationality}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Job</label>
                <input
                  type="text"
                  name="job"
                  value={editFormData.job}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-input rounded-lg text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristInfo;
