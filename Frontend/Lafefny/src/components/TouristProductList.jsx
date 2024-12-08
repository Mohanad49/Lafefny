/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SortAsc, Star, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import Navigation from './Navigation';
import '../styles/productList.css';
import ReviewForm from './ReviewForm';
import { useCurrency, currencies } from '../context/CurrencyContext';

const TouristProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [touristName, setTouristName] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [wishlistedProducts, setWishlistedProducts] = useState(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('userID');
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchTouristName = async () => {
      const userID = localStorage.getItem('userID');
      if (!userID) return;
      
      try {
        const response = await axios.get(`http://localhost:8000/users/${userID}`);
        if (response.data.tourist && response.data.tourist.name) {
          setTouristName(response.data.tourist.name);
        }
      } catch (error) {
        console.error('Error fetching tourist name:', error);
      }
    };

    fetchTouristName();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/products');
        // Filter out archived products and ensure imageUrl exists
        const activeProducts = response.data
          .filter(product => !product.isArchived)
          .map(product => ({
            ...product,
            imageUrl: product.imageUrl || product.image // Handle both fields for compatibility
          }));
        setProducts(activeProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);

  useEffect(() => {
    const userID = localStorage.getItem('userID');
    if (userID) {
      const fetchWishlist = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/tourist/${userID}/wishlist`);
          const data = response.data;
          setWishlistedProducts(new Set(data.map(item => item._id)));
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        }
      };
      fetchWishlist();
    }
  }, []);

  const convertPrice = (price, reverse = false) => {
    if (!price) return 0;
    const numericPrice = typeof price === 'string' ? 
      parseFloat(price.replace(/[^0-9.-]+/g, "")) : 
      parseFloat(price);
      
    if (reverse) {
      return numericPrice / currencies[currency].rate;
    }
    const convertedPrice = numericPrice * currencies[currency].rate;
    return convertedPrice.toFixed(2);
  };

  const handleAddToWishlist = async (productId) => {
    if (!isLoggedIn) {
      alert('Please log in to add items to your wishlist');
      return;
    }

    setIsAddingToWishlist(true);
    try {
      const userId = localStorage.getItem('userID');
      // Use the same endpoint format as TouristWishlist.jsx
      if (wishlistedProducts.has(productId)) {
        // Remove from wishlist
        await axios.delete(`http://localhost:8000/tourist/${userId}/wishlist/${productId}`);
      } else {
        // Add to wishlist
        await axios.post(`http://localhost:8000/products/wishlist/${userId}`, {
          productId: productId
        });
      }
      
      setWishlistedProducts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });
      
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) {
      alert('Please log in to add items to your cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      const userId = localStorage.getItem('userID');
      await axios.post(`http://localhost:8000/products/cart/${userId}`, { productId, quantity: 1 });
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleReviewClick = async (product) => {
      if (!isLoggedIn) {
        alert('Please log in to review products');
        return;
      }
    
      const userID = localStorage.getItem('userID');
      try {
        const response = await axios.get(`http://localhost:8000/products/check-purchase/${userID}/${product._id}`);
        
    
        if (!response.data.hasPurchased) {
          alert('You can only review products you have purchased.');
          return;
        }
    
        const userResponse = await axios.get(`http://localhost:8000/tourist/getTouristInfo/${userID}`);
        const touristName = userResponse.data[0]?.username;
        
    
        setTouristName(touristName);
        setSelectedProduct(product);
        setShowReviewModal(true);
      } catch (error) {
        console.error('Error checking product purchase:', error);
        alert('Failed to verify purchase status');
      }
    };
  
    const handleReviewSubmit = async (review) => {
      if (!selectedProduct) return;
  
      try {
        const reviewData = {
          reviewerName: touristName,
          rating: review.rating,
          comment: review.comment
        };
        

        const response = await axios.post(`http://localhost:8000/products/${selectedProduct._id}/reviews`, reviewData);
        
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === selectedProduct._id 
              ? { ...product, ratings: response.data.ratings }
              : product
          )
        );
    
        setShowReviewModal(false);
        setSelectedProduct(null);
        alert('Review submitted successfully!');
      } catch (error) {
        console.error('Error submitting review:', error);
        console.error('Error response:', error.response?.data);
        console.error('Review data that failed:', {
          reviewerName: touristName,
          rating: review.rating,
          comment: review.comment
        });
        alert(error.response?.data?.message || 'Failed to submit review');
      }
    };
  
  

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Search filter
      const searchMatch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!searchMatch) return false;

      // Type and value filter
      if (filterType !== 'all' && filterValue) {
        switch (filterType) {
          case 'price':
            return parseFloat(convertPrice(product.price, true)) <= parseFloat(filterValue);
          case 'quantity':
            return product.quantity >= parseInt(filterValue);
          case 'rating':
            return (product.ratings?.averageRating || 0) >= parseFloat(filterValue);
          default:
            return true;
        }
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(convertPrice(a.price, true)) - parseFloat(convertPrice(b.price, true));
        case 'rating':
          return (b.ratings?.averageRating || 0) - (a.ratings?.averageRating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover and shop our curated collection of authentic products from local artisans and sellers
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Type Select */}
            <div className="w-full">
              <Select 
                value={filterType} 
                onValueChange={(value) => {
                  setFilterType(value);
                  setFilterValue('');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="price">By Price</SelectItem>
                  <SelectItem value="quantity">By Quantity</SelectItem>
                  <SelectItem value="rating">By Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Value Input */}
            {filterType !== 'all' && (
              <div className="w-full">
                <Input
                  type={filterType === 'quantity' ? 'number' : 'text'}
                  placeholder={`Enter ${filterType} value...`}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full"
                  min={0}
                />
              </div>
            )}

            {/* Sort Select */}
            <div className="w-full">
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                  <SelectItem value="rating">Sort by Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-muted-foreground">Loading...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-destructive">{error}</div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg text-muted-foreground mb-6">No products available matching your criteria</p>
                <Button onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterValue('');
                  setSortBy('name');
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product._id} className="flex flex-col overflow-hidden">
                  <div className="relative w-full pt-[75%]">
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/400x300'}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Product+Image';
                      }}
                    />
                    {isLoggedIn && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddToWishlist(product._id)}
                        disabled={isAddingToWishlist}
                        className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                      >
                        <Heart 
                          className={`h-5 w-5 ${wishlistedProducts.has(product._id) ? 'text-red-500 fill-red-500' : 'text-foreground'}`}
                        />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-primary">
                        {currencies[currency].symbol}{convertPrice(product.price)} {currency}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span>{product.ratings?.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                      {isLoggedIn && (
                        <Button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={isAddingToCart}
                          className="flex-1"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                      
                      <Button
                        variant="secondary"
                        onClick={() => handleReviewClick(product)}
                        className="flex-1"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-lg bg-card p-6 shadow-lg border border-border">
            <button 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
              onClick={() => setShowReviewModal(false)}
            >
              ×
            </button>
            <ReviewForm
              title={selectedProduct.name}
              touristName={touristName}
              onSubmit={handleReviewSubmit}
              onClose={() => setShowReviewModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristProductList;