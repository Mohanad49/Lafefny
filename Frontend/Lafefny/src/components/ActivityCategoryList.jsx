import React, { useState, useEffect } from 'react';
import { getAllActivityCategories, deleteActivityCategory } from '../services/activityCategoryService';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Plus, LayoutGrid } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Navigation from '../components/Navigation';

function ActivityCategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoriesData = await getAllActivityCategories();
        setCategories(categoriesData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch activity categories"
        });
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, [toast]);

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteActivityCategory(categoryId);
        setCategories(categories.filter(category => category._id !== categoryId));
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete category"
        });
      }
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
      <div className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="w-full space-y-6 p-8">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Activity Categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize activity categories
            </p>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <Link to="/add-activityCategory">
                <Plus className="h-4 w-4 mr-2" />
                Add New Category
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>All Categories</CardTitle>
                  <CardDescription>
                    View and manage activity categories
                  </CardDescription>
                </div>
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <LayoutGrid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No categories found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {category.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/edit-category/${category._id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(category._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ActivityCategoryList;