/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getProductById, updateProduct } from '../services/productService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        setProduct(response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to fetch product data');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    setProduct({ ...product, imageUrl: base64 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProduct(id, product);
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
      navigate('/products');
    } catch (error) {
      console.error('Error updating Product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update product"
      });
    }
  };

  if (loading) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="text-center">Error: {error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="text-center">No product data available</div>
      </div>
    );
  }

  return (
    <div className="container relative min-h-screen flex-col items-start justify-start grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="w-full space-y-6 p-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update product details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={product.name || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={product.price || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Available Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={product.quantity || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Picture</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="file"
                  accept=".png,.jpeg,.jpg"
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={product.description || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seller">Seller</Label>
                <Input
                  id="seller"
                  name="seller"
                  value={product.seller || ''}
                  onChange={handleChange}
                />
              </div>

              <Button type="submit" className="w-full">
                Update Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProduct;

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