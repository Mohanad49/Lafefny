import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const userID = localStorage.getItem('userID');
  
  if (!userID) {
    // Redirect to sign-in if no userID is found
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute; 