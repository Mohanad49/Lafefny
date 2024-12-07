import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../services/productService';
import { ArrowLeft, Package, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    imageUrl: '',
    description: '',
    seller: '',
    ownerID: localStorage.getItem('userID')
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const base64 = await convertToBase64(file);
        setProduct({ ...product, imageUrl: base64 });
        toast({
          title: "Success",
          description: "Image uploaded successfully."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image."
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!product.ownerID) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login first"
      });
      return;
    }

    try {
      setLoading(true);
      await addProduct(product);
      toast({
        title: "Success",
        description: "Product added successfully"
      });
      
      setProduct({
        name: '',
        price: '',
        quantity: '',
        imageUrl: '',
        description: '',
        seller: '',
        ownerID: localStorage.getItem('userID')
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add product"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Add New Product
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new product listing
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Product Image</Label>
                  <Input
                    type="file"
                    id="imageUrl"
                    name="imageUrl"
                    accept=".png, .jpeg, .jpg"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seller">Seller Name</Label>
                  <Input
                    id="seller"
                    name="seller"
                    value={product.seller}
                    onChange={handleChange}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  <Package className="h-4 w-4 mr-2" />
                  {loading ? "Adding Product..." : "Add Product"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
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

export default AddProduct;