/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { signUp, signIn } from '../services/signService';
import { useNavigate } from 'react-router-dom';
import '../styles/sign.css';

function Sign() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState('Tourist');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    dateOfBirth: '',
    mobileNumber: '',
    nationality: '',
    job: '',
    role:'Tourist'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSignUp = () => {
    setIsSignUp(true);
  };

  const handleSignIn = () => {
    setIsSignUp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = {
        ...formData,
        role: userType,  // Assign role based on the dropdown selection
      };
    
    try {
        if (isSignUp) {
          const signUpResponse = await signUp(updatedFormData);
          alert('Sign up successful! You can now sign in.');
          setIsSignUp(false);
        } else {
          const signInResponse = await signIn(formData.email, formData.password);
          const userRole = signInResponse.role;
          localStorage.setItem('currentUserName', signInResponse.username);
        // Redirect based on the user role
        if (userRole === 'Tourist') {
            navigate('/touristHome');
        } else if (userRole === 'Seller') {
            navigate('/sellerHome');
        } else if (userRole === 'TourGuide') {
            navigate('/tourGuideHome');
        } else if (userRole === 'Advertiser') {
            navigate('/advertiserHome');
        } else if (userRole === 'Admin') {
            navigate('/adminHome');
        } else {
            alert('Invalid role detected');
        }

        }
      } catch (error) {
        console.error('Authentication error:', error);
        alert(error);
      }
  };

  return (
    <div className="sign">
      <h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>
      <form onSubmit={handleSubmit}>
        {isSignUp ? (
          <>
            <div>
              <label>User Type: </label>
              <select name="userType" value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="Tourist">Tourist</option>
                <option value="TourGuide">Tour Guide</option>
                <option value="Advertiser">Advertiser</option>
                <option value="Seller">Seller</option>
              </select>
            </div>

            {/* Common fields */}
            <div>
              <label>Username: </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Email: </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Password: </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Additional fields for Tourist */}
            {userType === 'Tourist' && (
              <>
                <div>
                  <label>Date of Birth: </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Mobile Number: </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Nationality: </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>Job: </label>
                  <input
                    type="text"
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}
            <button type="submit">Sign Up</button>
          </>
        ) : (
          <>
            <div>
              <label>Email: </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Password: </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit">Sign In</button>
          </>
        )}
      </form>

      <div>
        {isSignUp ? (
          <p>
            Already have an account? <button onClick={handleSignIn}>Sign In</button>
          </p>
        ) : (
          <p>
            Don't have an account? <button onClick={handleSignUp}>Sign Up</button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Sign;