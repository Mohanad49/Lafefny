/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMuseums, deleteMuseum } from '../services/museumService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Navigation from './Navigation';

const ManageMuseums = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [museums, setMuseums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMuseums();
  }, []);

  const fetchMuseums = async () => {
    try {
      const response = await getMuseums();
      setMuseums(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching museums:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch museums"
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this museum?')) {
      try {
        await deleteMuseum(id);
        toast({
          title: "Success",
          description: "Museum deleted successfully"
        });
        fetchMuseums(); // Refresh the list
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to delete museum"
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-museum/${id}`);
  };

  const filteredMuseums = museums.filter(museum =>
    museum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    museum.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    museum.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-transparent"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Manage Museums
            </CardTitle>
            <Button onClick={() => navigate('/add-museum')} className="bg-primary">
              Add New Museum
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search museums by name, location, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading museums...</div>
            ) : filteredMuseums.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No museums found
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredMuseums.map((museum) => (
                  <Card key={museum._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{museum.name}</h3>
                        <p className="text-sm text-muted-foreground">{museum.location}</p>
                        <div className="flex flex-wrap gap-2">
                          {museum.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-sm font-medium">Foreigner Price</p>
                            <p className="text-sm">${museum.ticketPrices.foreigner}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Native Price</p>
                            <p className="text-sm">${museum.ticketPrices.native}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Student Price</p>
                            <p className="text-sm">${museum.ticketPrices.student}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(museum._id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(museum._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ManageMuseums;
