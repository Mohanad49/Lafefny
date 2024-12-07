import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { ArrowLeft, Users, TrendingUp } from 'lucide-react';
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

export default function AdminNumberOfUsers() {
  const [numOfUsers, setNumOfUsers] = useState({
    totalNum: 0,
    monthlyUsers: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNumOfUsers = async () => {
      try {
        setLoading(true);
        const users = await axios.get('http://localhost:8000/admin/numberOfUsers');
        const newUsers = await axios.get('http://localhost:8000/admin/numberOfNewUsers');
        setNumOfUsers({
          totalNum: users.data,
          monthlyUsers: newUsers.data
        });
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user statistics."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchNumOfUsers();
  }, [toast]);

  if (loading) {
    return (
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

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
        <div className="mx-auto flex w-full flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              User Statistics
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of user growth and monthly registrations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{numOfUsers.totalNum}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users across all time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Users This Month
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {numOfUsers.monthlyUsers[numOfUsers.monthlyUsers.length - 1]?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users registered in {numOfUsers.monthlyUsers[numOfUsers.monthlyUsers.length - 1]?.month || 'current month'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Registration Trends</CardTitle>
              <CardDescription>
                Number of new user registrations per month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">New Users</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {numOfUsers.monthlyUsers.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.month}</TableCell>
                      <TableCell className="text-right">{data.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}