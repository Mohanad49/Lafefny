import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (!auth.isAuthenticated) {
        await Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'You Must Log in First',
          confirmButtonColor: '#d33',
          showConfirmButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          timer: 2000,
          timerProgressBar: true,
        });
        navigate('/');
        return;
      }

      // Check role-based access if roles are specified
      if (allowedRoles.length > 0 && !allowedRoles.includes(auth.userRole)) {
        // Get the appropriate home page based on user role
        let homePage = '/';
        switch(auth.userRole) {
          case 'Tourist':
            homePage = '/touristHome';
            break;
          case 'Admin':
            homePage = '/adminHome';
            break;
          case 'TourGuide':
            homePage = '/tourGuideHome';
            break;
          case 'Seller':
            homePage = '/sellerHome';
            break;
          case 'Advertiser':
            homePage = '/advertiserHome';
            break;
          case 'TourismGovernor':
            homePage = '/TourismGovernorHome';
            break;
          default:
            homePage = '/';
        }

        await Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'You do not have permission to access this page',
          confirmButtonColor: '#d33',
          showConfirmButton: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          timer: 2000,
          timerProgressBar: true,
        });
        navigate(homePage);
        return;
      }
    };

    checkAccess();
  }, [auth.isAuthenticated, auth.userRole, allowedRoles, navigate]);

  return children;
}

export default ProtectedRoute;