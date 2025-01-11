/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const TouristComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    body: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    fetchUserComplaints(userId);
  }, []);

  const fetchUserComplaints = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch complaints. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'resolved':
        return 'bg-green-500/10 text-green-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userID');
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User ID not found. Please sign in again."
        });
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          title: newComplaint.title, 
          body: newComplaint.body 
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Complaint submitted successfully!"
        });
        setShowAddModal(false);
        setNewComplaint({ title: '', body: '' });
        fetchUserComplaints(userId);
      } else {
        throw new Error('Failed to submit complaint');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit complaint. Please try again."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>

          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
                My Complaints
              </h1>
              <p className="text-muted-foreground">
                View and track the status of your complaints
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Complaint
            </button>
          </div>

          {/* Add Complaint Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-background rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Submit a Complaint</h2>
                <form onSubmit={handleAddComplaint}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newComplaint.title}
                        onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={newComplaint.body}
                        onChange={(e) => setNewComplaint(prev => ({ ...prev, body: e.target.value }))}
                        className="w-full p-2 border rounded-md h-32"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setNewComplaint({ title: '', body: '' });
                        }}
                        className="px-4 py-2 border rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Complaints Grid */}
          <div className="grid gap-6">
            {complaints.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
                No complaints found
              </div>
            ) : (
              complaints.map((complaint) => (
                <div 
                  key={complaint._id}
                  className="bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{complaint.title}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(complaint.status)}`}>
                          {getStatusIcon(complaint.status)}
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4">{complaint.body}</p>
                      {complaint.adminReply && (
                        <div className="bg-accent/50 rounded-lg p-4 mb-4">
                          <p className="font-medium mb-2">Admin Reply:</p>
                          <p className="text-muted-foreground">{complaint.adminReply}</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(complaint.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TouristComplaintList;