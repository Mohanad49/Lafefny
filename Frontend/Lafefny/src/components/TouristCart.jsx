import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/productList.css';
import Navigation from './Navigation';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCurrency, currencies } from '../context/CurrencyContext';

const TouristCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = localStorage.getItem('userID');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tourist/${userId}/cart`);
        setCartItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load cart');
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const { currency } = useCurrency();
    
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

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.put(`${import.meta.env.VITE_API_URL}/tourist/${userId}/cart/${productId}`, {
        quantity: newQuantity
      });
      setCartItems(prev => prev.map(item => 
        item._id === productId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const userId = localStorage.getItem('userID');
      await axios.delete(`${import.meta.env.VITE_API_URL}/tourist/${userId}/cart/${productId}`);
      setCartItems(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart');
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

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-primary hover:text-primary/80 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Homepage
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
            My Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            Review and manage your selected items
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground mb-6">Your cart is empty</p>
            <Link
              to="/touristProducts"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <div className="flex items-center gap-6 p-6">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-primary mb-2">{item.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-md hover:bg-accent"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 rounded-md hover:bg-accent"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="w-24 text-right font-semibold">
                        {currency} {convertPrice(item.price * item.quantity)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {currency} {convertPrice(total)}
                </span>
              </div>
              
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TouristCart;