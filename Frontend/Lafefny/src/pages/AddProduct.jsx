import React, { useState } from 'react';
import { addProduct } from '../services/productService';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Globe2, Star, MapPin } from "lucide-react";
import { useCurrency, currencies } from '../context/CurrencyContext';
import '../styles/addProduct.css';


const AddProductPage = () => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    imageUrl: '',
    description: '',
    seller: '',
    ownerID: localStorage.getItem('userID') // Get logged in user's ID
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleChange2 = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setProduct({...product, imageUrl: base64});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!product.ownerID) {
        alert('Please login first');
        return;
      }

      const response = await addProduct(product);
      console.log('Product added successfully:', response);
      alert('Product added successfully');
      
      // Reset form after successful submission
      setProduct({
        name: '',
        price: '',
        quantity: '',
        imageUrl: '',
        description: '',
        seller: '',
        ownerID: localStorage.getItem('userID') // Maintain ownerID after reset
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Add New Product
            </h1>
            <p className="text-primary text-lg max-w-2xl mx-auto">
              Fill in the details below to add a new product to the store.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow w-full max-w-md">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      value={product.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Available Quantity</Label>
                    <Input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={product.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Picture URL</Label>
                    <Input
                      type="file"
                      id="imageUrl"
                      name="imageUrl"
                      accept=".png .jpeg .jpg"
                      onChange={(e) => handleChange2(e)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={product.description}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seller">Seller</Label>
                    <Input
                      type="text"
                      id="seller"
                      name="seller"
                      value={product.seller}
                      onChange={handleChange}
                    />
                  </div>

                  <Button type="submit" className="w-full">Add Product</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
}

export default AddProductPage;