/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { getProducts, addProduct, updateProductArchiveStatus } from "../services/productService";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useCurrency, currencies } from '../context/CurrencyContext';
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SellerHome = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    return convertedPrice;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newProduct = {
      name: formData.get("name"),
      price: parseFloat(formData.get("price")),
      description: formData.get("description"),
      quantity: parseInt(formData.get("stock")),
      imageUrl: formData.get("image"),
      seller: localStorage.getItem("username") || "Unknown Seller",
    };

    try {
      await addProduct(newProduct);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      fetchProducts(); // Refresh products list
      e.target.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const toggleArchiveStatus = async (id) => {
    try {
      await updateProductArchiveStatus(id);
      await fetchProducts(); // Refresh products list
      toast({
        title: "Success",
        description: "Product archive status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update archive status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-6">
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
         

          {/* Featured Products Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Button
                variant="link"
                onClick={() => setShowAllProducts(!showAllProducts)}
              >
                {showAllProducts ? "Show Less" : "View All Products"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(showAllProducts ? products : products.slice(0, 4)).map((product) => (
                <Card key={product._id}>
                  <div className="relative h-48">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{product.name}</h3>
                        <span className="font-medium text-primary">
                        {currencies[currency].symbol}{convertPrice(product.price).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Stock: {product.quantity}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/edit-product/${product._id}`)}>
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleArchiveStatus(product._id)}
                            className={product.isArchived ? "bg-yellow-100" : ""}
                          >
                            {product.isArchived ? "Unarchive" : "Archive"}
                          </Button>
                        </div>
                      </div>
                      {product.isArchived && (
                        <span className="text-sm text-yellow-600 block mt-2">
                          ⓘ This product is archived
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Add Product Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" name="image" type="url" required />
                </div>
                <Button type="submit" className="w-full">
                  Add Product
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SellerHome;