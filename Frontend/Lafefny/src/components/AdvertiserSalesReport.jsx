/* eslint-disable no-unused-vars */
// AdvertiserSalesReport.jsx
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns"
import cn from 'classnames';
import { useCurrency, currencies } from '../context/CurrencyContext';

export default function AdvertiserSalesReport() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const { toast } = useToast();
  const userId = localStorage.getItem('userID');

  // Fetch all activities when component mounts
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/activities`);
      const allActivities = response.data;
      // Filter activities by advertiser ID (userId)
      const advertiserActivities = allActivities.filter(activity => activity.advertiser === userId);
      setActivities(advertiserActivities);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activities. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const generateReport = () => {
    setIsLoading(true);
    try {
      // Filter activities by date range
      const filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startDate && activityDate <= endDate;
      });

      // Filter activities by month and year if selected
      const filteredActivitiesByMonthAndYear = filteredActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return (selectedMonth === '' || activityDate.getMonth() + 1 === parseInt(selectedMonth)) 
          && (selectedYear === '' || activityDate.getFullYear() === parseInt(selectedYear));
      });

      // Generate report data
      const reportSummary = {
        totalActivities: filteredActivitiesByMonthAndYear.length,
        totalRevenue: filteredActivitiesByMonthAndYear.reduce((sum, activity) => sum + activity.price, 0),
        activitiesByCategory: {},
        activityList: filteredActivitiesByMonthAndYear,
      };

      // Group activities by category
      filteredActivitiesByMonthAndYear.forEach(activity => {
        if (!reportSummary.activitiesByCategory[activity.category]) {
          reportSummary.activitiesByCategory[activity.category] = {
            count: 0,
            revenue: 0,
          };
        }
        reportSummary.activitiesByCategory[activity.category].count += 1;
        reportSummary.activitiesByCategory[activity.category].revenue += activity.price;
      });

      setReportData(reportSummary);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sales Report</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Start Date</h2>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            className="rounded-md border"
            classNames={{
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "[&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-md"
              ),
              day: cn(
                "h-9 w-9 p-0 font-normal rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none"
              ),
              day_selected: cn(
                "bg-primary text-primary-foreground",
                "hover:bg-primary hover:text-primary-foreground",
                "focus:bg-primary focus:text-primary-foreground",
                "rounded-md"
              ),
              day_today: "bg-accent/50 text-accent-foreground rounded-md"
            }}
          />
        </Card>
        
        <Card className="p-6">
          <h2 className="font-semibold mb-4">End Date</h2>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            className="rounded-md border"
            classNames={{
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "[&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-md"
              ),
              day: cn(
                "h-9 w-9 p-0 font-normal rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none"
              ),
              day_selected: cn(
                "bg-primary text-primary-foreground",
                "hover:bg-primary hover:text-primary-foreground",
                "focus:bg-primary focus:text-primary-foreground",
                "rounded-md"
              ),
              day_today: "bg-accent/50 text-accent-foreground rounded-md"
            }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Filter by Month</h2>
          <Select 
            onValueChange={(value) => setSelectedMonth(value === 'all' ? '' : value)}
            value={selectedMonth || 'all'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Filter by Year</h2>
          <Select 
            onValueChange={(value) => setSelectedYear(value === 'all' ? '' : value)}
            value={selectedYear || 'all'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      </div>

      <Button 
        onClick={generateReport} 
        className="w-full mb-6 py-6 text-lg font-semibold"
        disabled={isLoading}
      >
        {isLoading ? "Generating Report..." : "Generate Report"}
      </Button>

      {reportData && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold mt-1">{reportData.totalActivities}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">{currencies[currency].symbol}{convertPrice(reportData.totalRevenue).toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Activities by Category</h2>
            <div className="space-y-4">
              {Object.entries(reportData.activitiesByCategory).map(([category, data]) => (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{category}</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <p className="text-gray-600">Count: <span className="font-semibold">{data.count}</span></p>
                    <p className="text-gray-600">Revenue: <span className="font-semibold">{currencies[currency].symbol}{convertPrice(data.revenue).toFixed(2)}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Details</h2>
            <div className="space-y-4">
              {reportData.activityList.map((activity, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{activity.name}</p>
                      <p className="text-gray-600">Date: {format(new Date(activity.date), "PPP")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{currencies[currency].symbol}{convertPrice(activity.price).toFixed(2)}</p>
                      <p className="text-gray-600">{activity.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}