import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getAllPreferenceTags, updatePreferenceTag } from '../services/preferenceTagService';
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

const EditPreferenceTag = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const response = await getAllPreferenceTags();
        const foundTag = response.find((tag) => tag._id === id);
        if (foundTag) {
          setTag(foundTag);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Tag not found"
          });
          navigate('/preferenceTags');
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch tag details"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [id, navigate, toast]);

  const handleChange = (e) => {
    setTag({
      ...tag,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePreferenceTag(id, tag);
      toast({
        title: "Success",
        description: "Preference tag updated successfully"
      });
      navigate('/preferenceTags');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preference tag"
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
            <h1 className="text-2xl font-semibold tracking-tight">Edit Preference Tag</h1>
            <p className="text-sm text-muted-foreground">
              Update the details of your preference tag
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tag Details</CardTitle>
              <CardDescription>
                Make changes to your tag here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Tag Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={tag.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter tag name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={tag.description}
                    onChange={handleChange}
                    required
                    placeholder="Enter tag description"
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Update Tag
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

export default EditPreferenceTag;