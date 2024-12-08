import React, { useState, useEffect } from 'react';
import { fetchUsers, deleteUser, acceptUser, rejectUser, 
  viewAdvertiser_pdf, viewSeller_pdf, viewTourGuide_pdf } from '../services/adminService';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, Eye, XCircle, Check, X, FileText } from 'lucide-react';
import Navigation from '../components/Navigation'; // Import the Navigation component

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        alert('User deleted successfully');
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleAccept = async (userId) => {
    const user = users.find(u => u._id === userId);
    
    if (user.isAccepted) {
      alert('User is already accepted');
      return;
    }

    if (window.confirm('Are you sure you want to accept this account?')) {
      try {
        await acceptUser(userId);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAccepted: true } : user
        ));
        alert('User Accepted');
      } catch (error) {
        alert('Failed to accept user');
      }
    }
  };

  const handleReject = async (userId) => {
    const user = users.find(u => u._id === userId);
    
    if (user.isAccepted === false) {
      alert('User is already rejected');
      return;
    }

    if (window.confirm('Are you sure you want to reject this account?')) {
      try {
        await rejectUser(userId);
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAccepted: false } : user
        ));
        alert('User Rejected');
      } catch (error) {
        alert('Failed to reject user');
      }
    }
  };

  const handleViewDocument = async (userId, role) => {
    try {
      let pdfUrl;
      switch(role.toLowerCase()) {
        case 'advertiser':
          pdfUrl = viewAdvertiser_pdf(userId);
          break;
        case 'seller':
          pdfUrl = await viewSeller_pdf(userId);
          break;
        case 'tourguide':
          pdfUrl = await viewTourGuide_pdf(userId);
          break;
        default:
          console.log('Invalid role for document viewing');
          return;
      }
      window.open(pdfUrl, '_blank');
    } catch (error) {
      alert('Failed to load document');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status.deletionRequested) return 'bg-red-100 text-red-800';
    if (status.isAccepted) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const isRoleNeedingApproval = (role) => {
    const rolesNeedingApproval = ['tourguide', 'advertiser', 'seller'];
    return rolesNeedingApproval.includes(role.toLowerCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/adminHome"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Manage User Accounts</h1>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user._id} className={user.deletionRequested ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getStatusColor({ deletionRequested: user.deletionRequested, isAccepted: user.isAccepted })
                        }`}>
                          {user.deletionRequested ? 'Deletion Requested' : (user.isAccepted ? 'Active' : 'Pending')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {isRoleNeedingApproval(user.role) && !user.isAccepted && (
                          <>
                            <button
                              onClick={() => handleAccept(user._id)}
                              className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(user._id)}
                              className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        {(user.role?.toLowerCase() === 'advertiser' || 
                          user.role?.toLowerCase() === 'seller' || 
                          user.role?.toLowerCase() === 'tourguide') && (
                          <button
                            onClick={() => handleViewDocument(user._id, user.role)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Documents
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserManagement;