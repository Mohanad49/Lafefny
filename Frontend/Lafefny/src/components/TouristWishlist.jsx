import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/productList.css';
import Navigation from './Navigation';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { fetchExchangeRates } from '../services/currencyService';
import { useCurrency } from '../context/CurrencyContext';

const TouristWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currency, conversionRates } = useCurrency();
  const [isMovingToCart, setIsMovingToCart] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userId = localStorage.getItem('userID');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tourist/${userId}/wishlist`);
        setWishlistItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setError('Failed to load wishlist');
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const convertPrice = (price) => {
    if (!conversionRates || !price) return price;
    const priceInUSD = price / conversionRates.EGP;
    return (priceInUSD * conversionRates[currency]).toFixed(2);
  };

  const removeFromWishlist = async (productId) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.delete(`${import.meta.env.VITE_API_URL}/tourist/${userId}/wishlist/${productId}`);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  const moveToCart = async (productId) => {
    try {
      setIsMovingToCart(true);
      const userId = localStorage.getItem('userID');
      
      // Add to cart first
      await axios.post(`${import.meta.env.VITE_API_URL}/products/cart/${userId}`, {
        productId,
        quantity: 1
      });

      // Then remove from wishlist
      await removeFromWishlist(productId);
      
      alert('Item moved to cart successfully!');
    } catch (error) {
      console.error('Error moving item to cart:', error);
      alert('Failed to move item to cart');
    } finally {
      setIsMovingToCart(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-destructive">{error}</div>
        </div>
      </main>
    </div>
  );

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
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            Save and manage your favorite items
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground mb-6">Your wishlist is empty</p>
            <Link
              to="/tourist/products"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <div key={item._id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/300x200'}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-primary">
                      {currency} {convertPrice(item.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <button
                      onClick={() => moveToCart(item._id)}
                      disabled={isMovingToCart}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Move to Cart
                    </button>
                    
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="flex items-center justify-center p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TouristWishlist;