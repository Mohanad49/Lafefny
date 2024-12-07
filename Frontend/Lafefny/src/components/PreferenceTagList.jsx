/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getAllPreferenceTags, deletePreferenceTag } from '../services/preferenceTagService';
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

function PreferenceTagList() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getTags = async () => {
      try {
        const tagsData = await getAllPreferenceTags();
        setTags(tagsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch preference tags"
        });
      } finally {
        setLoading(false);
      }
    };

    getTags();
  }, [toast]);

  const handleDelete = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deletePreferenceTag(tagId);
        setTags(tags.filter(tag => tag._id !== tagId));
        toast({
          title: "Success",
          description: "Preference tag deleted successfully"
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete preference tag"
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
          <h1 className="text-2xl font-semibold tracking-tight">Preference Tags</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize preference tags
          </p>
        </div>

        <div className="flex justify-end">
          <Button asChild>
            <Link to="/add-tag">
              <Plus className="h-4 w-4 mr-2" />
              Add New Tag
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>All Tags</CardTitle>
                <CardDescription>
                  View and manage preference tags
                </CardDescription>
              </div>
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <div className="text-center py-12">
                <LayoutGrid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No tags found</p>
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
                  {tags.map((tag) => (
                    <TableRow key={tag._id}>
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {tag.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/edit-tag/${tag._id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(tag._id)}
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
  );
}

export default PreferenceTagList;