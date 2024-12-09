import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAllActivityCategories, updateActivityCategory } from '../services/activityCategoryService';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Navigation from '../components/Navigation';

const EditActivityCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await getAllActivityCategories();
        const foundCategory = response.find((category) => category._id === id);
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Category not found"
          });
          navigate('/activityCategories');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch category details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, navigate, toast]);

  const handleChange = (e) => {
    setCategory({
      ...category,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateActivityCategory(id, category);
      toast({
        title: "Success",
        description: "Activity category updated successfully"
      });
      navigate('/activityCategories');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update activity category"
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container relative max-w-4xl mx-auto pt-24 pb-16 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="w-full space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Edit Activity Category</h1>
            <p className="text-sm text-muted-foreground">
              Update the details of your activity category
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Make changes to your category here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Category Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={category.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter category name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={category.description}
                    onChange={handleChange}
                    required
                    placeholder="Enter category description"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Update Category
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditActivityCategory;