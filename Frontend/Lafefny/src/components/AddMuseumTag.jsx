/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from './Navigation';
import { addMuseumTag } from '../services/museumTagService';

const AddMuseumTag = () => {
  const [tag, setTag] = useState({
    name: '',
    historicalPeriod: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTag(prevTag => ({
      ...prevTag,
      [name]: value
    }));
  };

  const handleNameChange = (value) => {
    setTag(prevTag => ({
      ...prevTag,
      name: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newTag = await addMuseumTag(tag);
      toast({
        title: "Success",
        description: "Museum tag added successfully!"
      });
      setTag({ name: '', historicalPeriod: '' }); // Reset form
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.error || 'An error occurred while adding the tag.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Add Museum Tag
              </h1>
              <p className="text-sm text-muted-foreground">
                Create a new tag for categorizing museums
              </p>
            </div>

            <div className="grid gap-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tag Name</Label>
                    <Select
                      value={tag.name}
                      onValueChange={handleNameChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monuments">Monuments</SelectItem>
                        <SelectItem value="Museums">Museums</SelectItem>
                        <SelectItem value="Religious Sites">Religious Sites</SelectItem>
                        <SelectItem value="Palaces/Castles">Palaces/Castles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="historicalPeriod">Historical Period</Label>
                    <Input
                      id="historicalPeriod"
                      name="historicalPeriod"
                      value={tag.historicalPeriod}
                      onChange={handleChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Tag className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMuseumTag;
