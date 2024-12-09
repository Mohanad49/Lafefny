import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpDown, Mail, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import Navigation from '../components/Navigation';

const AdminComplaintList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [sortOrder]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/complaints?sort=${sortOrder}`);
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch complaints"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
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
      <div className="container relative min-h-screen flex-col items-start justify-start grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      

        <div className="w-full space-y-6 p-8">
          
          <div className="flex flex-col space-y-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 md:mb-0 hover:translate-x-1 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
            <h1 className="text-2xl font-semibold tracking-tight">Complaints</h1>
            <p className="text-sm text-muted-foreground">
              Manage and view all complaints
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle>All Complaints</CardTitle>
                  <CardDescription>
                    View and manage customer complaints
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSortChange}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </Button>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {complaints
                  .filter(complaint => 
                    statusFilter === 'all' || complaint.status === statusFilter
                  )
                  .map((complaint) => (
                    <Card key={complaint._id} className="hover:bg-accent transition-colors">
                      <Link to={`/admin/complaints/${complaint._id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                <h3 className="font-semibold">{complaint.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(complaint.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <Badge className={getStatusBadgeColor(complaint.status)}>
                              {complaint.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}

                {complaints.length === 0 && (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No complaints found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintList;