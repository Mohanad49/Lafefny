import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const userID = localStorage.getItem('userID');

  useEffect(() => {
    if (!userID) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You Must Log in First',
        confirmButtonColor: '#d33',
        timer: 3000,
        timerProgressBar: true,
      }).then(() => {
        navigate('/');
      });
    }
  }, [userID, navigate]);

  if (!userID) {
    return null;
  }

  return children;
}

export default ProtectedRoute; 