import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, updateProductArchiveStatus } from '../services/productService';
import { ArrowLeft, Search, Plus } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (reviews) => {
    setSelectedReviews(reviews);
    setShowModal(true);
  };

  const toggleArchiveStatus = async (id, currentStatus) => {
    try {
      await updateProductArchiveStatus(id);
      await fetchProducts();
      alert(`Product ${currentStatus ? 'unarchived' : 'archived'} successfully`);
    } catch (error) {
      console.error('Error toggling archive status:', error);
      alert('Failed to update product status');
    }
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => {
      if (filterType === 'price' && filterValue) {
        return product.price <= parseFloat(filterValue);
      }
      if (filterType === 'quantity' && filterValue) {
        return product.quantity >= parseInt(filterValue);
      }
      if (filterType === 'rating' && filterValue) {
        return product.ratings.averageRating >= parseFloat(filterValue);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.ratings.averageRating - a.ratings.averageRating;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Products</h1>
          <Link
            to="/add-product"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by name, description, or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Filter</option>
              <option value="price">Filter by Max Price</option>
              <option value="quantity">Filter by Min Quantity</option>
              <option value="rating">Filter by Min Rating</option>
            </select>
            {filterType && (
              <input
                type={filterType === 'quantity' ? 'number' : 'text'}
                placeholder={`Enter ${filterType} value`}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.sales}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.ratings.averageRating.toFixed(1)} ★ ({product.ratings.totalRatings})
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{product.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.seller}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(product.ratings.reviews)}
                          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Reviews
                        </button>
                        <Link
                          to={`/edit-product/${product._id}`}
                          className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleArchiveStatus(product._id, product.isArchived)}
                          className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                        >
                          {product.isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              {selectedReviews.length > 0 ? (
                <div className="space-y-4">
                  {selectedReviews.map((review, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{review.reviewerName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-400">★</span>
                            <span>{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.date)}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  No reviews available.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;