/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts } from '../services/productService';
import '../styles/productList.css';
import { fetchExchangeRates } from '../services/currencyService';
import { addProductReview, checkProductPurchase, addToWishlist, addToCart } from '../services/productService';
import ReviewForm from './ReviewForm';
import Navigation from './Navigation';
import { ArrowLeft, Search, Filter, SortAsc, Star, ShoppingCart, Heart, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [currency, setCurrency] = useState('EGP');
  const [conversionRates, setConversionRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [touristName, setTouristName] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userID');

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

  useEffect(() => {
    const getRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setConversionRates(rates);
      } catch (error) {
        setRatesError('Failed to load currency rates');
      } finally {
        setRatesLoading(false);
      }
    };
    getRates();
  }, []);

  useEffect(() => {
    const userID = localStorage.getItem('userID');
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      // Filter out archived products
      const activeProducts = response.filter(product => !product.isArchived);
      console.log('Fetched active products:', activeProducts); // For debugging
      setProducts(activeProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const convertPrice = (price) => {
    if (!conversionRates || !price) return price;
    // Convert from EGP to USD first
    const priceInUSD = price / conversionRates.EGP;
    // Then convert to target currency
    return (priceInUSD * conversionRates[currency]).toFixed(2);
  };

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const openModal = (reviews) => {
    setSelectedReviews(reviews);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReviews([]);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => !product.isArchived)
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

  const handleReviewClick = async (product) => {
    try {
      const userID = localStorage.getItem('userID');
      if (!userID) {
        alert('Please log in to submit a review');
        return;
      }

      console.log('Attempting to check purchase with:', {
        userID,
        productId: product._id
      });

      const response = await checkProductPurchase(userID, product._id);
      console.log('Response from checkProductPurchase:', response);
      
      if (!response.hasPurchased) {
        alert('You can only review products you have purchased.');
        return;
      }

      setTouristName(response.touristName);
      setSelectedProduct(product);
      setShowReviewModal(true);
    } catch (error) {
      console.error('Error in handleReviewClick:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        alert(`Error checking purchase history: ${error.response.data.message}`);
      } else {
        console.error('No response in error:', error.message);
        alert('Error checking purchase history');
      }
    }
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const handleReviewSubmit = async ({ rating, comment }) => {
    if (!rating || !comment) {
      alert('Please provide both rating and comment');
      return;
    }

    const review = {
      reviewerName: touristName,
      rating: parseInt(rating),
      comment,
      date: new Date()
    };

    try {
      const response = await addProductReview(selectedProduct._id, review);
      
      // Update the products list with the new review
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === selectedProduct._id 
            ? { ...product, ratings: response.data.ratings }
            : product
        )
      );

      alert('Review submitted successfully!');
      closeReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Failed to submit review: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      setIsAddingToWishlist(true);
      const userId = localStorage.getItem('userID');
      if (!userId) {
        alert('Please log in to add items to your wishlist');
        return;
      }
      await addToWishlist(userId, productId);
      alert('Added to wishlist successfully!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      setIsAddingToCart(true);
      const userId = localStorage.getItem('userID');
      if (!userId) {
        alert('Please log in to add items to your cart');
        return;
      }
      await addToCart(userId, productId, 1);
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex gap-6">
          {/* Sidebar */}
          {isLoggedIn && (
            <aside className="hidden lg:block w-64 space-y-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="font-semibold mb-4">Wishlist</h3>
                <nav className="space-y-2">
                  <Link
                    to="/tourist/wishlist"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    View Wishlist
                  </Link>
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Back Button */}
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-primary hover:text-primary/80 mb-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
                Our Products
              </h1>
              <p className="text-muted-foreground">
                Discover and shop our curated collection of authentic products
              </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Filter by...</option>
                <option value="price">Price</option>
                <option value="quantity">Quantity</option>
                <option value="rating">Rating</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>

              {!ratesLoading && !ratesError && (
                <select
                  value={currency}
                  onChange={handleCurrencyChange}
                  className="rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {Object.keys(conversionRates).map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No products available matching your criteria
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product._id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md">
                    <img
                      src={product.image || 'https://via.placeholder.com/300x200'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-primary">
                          {currency} {convertPrice(product.price)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400" />
                          <span>{product.ratings.averageRating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                        {isLoggedIn && (
                          <>
                            <button
                              onClick={() => handleAddToCart(product._id)}
                              disabled={isAddingToCart}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Cart
                            </button>
                            
                            <button
                              onClick={() => handleAddToWishlist(product._id)}
                              disabled={isAddingToWishlist}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium transition-colors"
                            >
                              <Heart className="h-4 w-4" />
                              Wishlist
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleReviewClick(product)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 text-sm font-medium transition-colors"
                        >
                          <Star className="h-4 w-4" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-lg bg-card p-6 shadow-lg border border-border">
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => setShowReviewModal(false)}>×</button>
            <ReviewForm
              productId={selectedProduct._id}
              touristName={touristName}
              onSubmit={handleReviewSubmit}
              onClose={() => setShowReviewModal(false)}
            />
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-lg bg-card p-6 shadow-lg border border-border">
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={closeModal}>×</button>
            <h2 className="text-xl font-semibold mb-4">Product Reviews</h2>
            {selectedReviews.map((review, index) => (
              <div key={index} className="mb-4 p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{review.touristName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(review.date)}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'text-amber-400' : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;