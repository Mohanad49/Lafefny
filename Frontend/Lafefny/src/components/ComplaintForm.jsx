import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  });
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userID');
    setUserId(storedUserId);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setMessage('User ID not found. Please sign in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: formData.title,
          body: formData.body
        }),
      });
      
      if (response.ok) {
        setMessage('Complaint submitted successfully!');
        setFormData({ title: '', body: '' });
        setIsSubmitted(true);
      } else {
        setMessage('Error submitting complaint');
      }
    } catch (error) {
      setMessage('Error submitting complaint');
      console.error('Complaint submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <button
        onClick={() => navigate('/touristHome')}
        className="absolute top-4 left-4 p-2 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-full mb-6">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Submit a Complaint
          </h2>
          <p className="text-gray-500 text-sm">
            We value your feedback and will address your concerns
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Brief description of your complaint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Please provide detailed information about your complaint"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Submit Complaint
          </button>

          {message && (
            <div className={`text-center p-3 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {isSubmitted && (
            <button
              type="button"
              onClick={() => navigate('/my-complaints')}
              className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View My Complaints
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;