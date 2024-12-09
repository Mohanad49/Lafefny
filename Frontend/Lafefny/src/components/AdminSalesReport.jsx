import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import Navigation from './Navigation';
import { useCurrency } from '@/context/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { format, isToday, isSameDay } from 'date-fns';

// Simple currency conversion rates
const currencyRates = {
  EGP: 1,
  USD: 0.032,
  EUR: 0.029,
  SAR: 0.12
};

const currencySymbols = {
  EGP: 'EGP',
  USD: '$',
  EUR: '€',
  SAR: 'SAR'
};

const AdminSalesReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [reportType, setReportType] = useState('all');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [salesData, setSalesData] = useState({
    giftShop: { sales: [], totalSales: 0 },
    itineraries: { sales: [], totalSales: 0, appRevenue: 0 },
    activities: { sales: [], totalSales: 0, appRevenue: 0 },
    summary: { totalGrossSales: 0, totalAppRevenue: 0 }
  });
  const [loading, setLoading] = useState(false);

  const convertCurrency = (amount) => {
    const rate = currencyRates[currency] || 1;
    return amount * rate;
  };

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      console.log('Sending request with params:', {
        type: reportType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await axios.get('http://localhost:8000/admin/sales-report', {
        params: {
          type: reportType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.data) {
        console.log('Received sales data:', response.data.data);
        
        const { data } = response.data;
        if (!data.itineraries?.sales) {
          console.warn('Missing itineraries sales data');
        }
        if (!data.activities?.sales) {
          console.warn('Missing activities sales data');
        }
        
        setSalesData(data);
      } else {
        toast({
          title: "No Data",
          description: "No sales data found for the selected period.",
          variant: "warning"
        });
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch sales report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSalesTable = (sales, title, type) => {
    if (!sales || sales.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title} Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Month/Year</th>
                  {type === 'giftShop' && <th className="py-2 text-right">Product</th>}
                  <th className="py-2 text-right">Total Sales</th>
                  <th className="py-2 text-right">
                    {type === 'giftShop' ? 'Quantity Sold' : 'Bookings'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-2">
                      {item._id.month}/{item._id.year}
                    </td>
                    {type === 'giftShop' && (
                      <td className="py-2 text-right">{item._id.product}</td>
                    )}
                    <td className="py-2 text-right">
                      {currencySymbols[currency]}{convertCurrency(item.totalSales).toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      {type === 'giftShop' ? item.quantitySold : item.bookingCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container relative max-w-6xl mx-auto pt-24 pb-16 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
            <p className="text-muted-foreground">
              View comprehensive sales data across activities, itineraries, and products
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="itineraries">Itineraries</SelectItem>
                <SelectItem value="products">Products</SelectItem>
              </SelectContent>
            </Select>

            <Card className="p-4 min-w-[320px]">
              <h3 className="font-medium mb-2">Start Date</h3>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                defaultMonth={startDate}
                initialFocus
                className="rounded-md border"
                classNames={{
                  day_selected: "bg-black text-white hover:bg-black/90 focus:bg-black",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  day_today: "bg-accent/50 text-accent-foreground",
                  cell: "h-9 w-9 text-center text-sm relative p-0 data-[selected=true]:bg-black data-[selected=true]:text-white",
                }}
                footer={
                  <p className="text-sm text-muted-foreground">
                    {startDate && format(startDate, "PPP")}
                  </p>
                }
              />
            </Card>

            <Card className="p-4 min-w-[320px]">
              <h3 className="font-medium mb-2">End Date</h3>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                defaultMonth={endDate}
                initialFocus
                className="rounded-md border"
                classNames={{
                  day_selected: "bg-black text-white hover:bg-black/90 focus:bg-black",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  day_today: "bg-accent/50 text-accent-foreground",
                  cell: "h-9 w-9 text-center text-sm relative p-0 data-[selected=true]:bg-black data-[selected=true]:text-white",
                }}
                footer={
                  <p className="text-sm text-muted-foreground">
                    {endDate && format(endDate, "PPP")}
                  </p>
                }
              />
            </Card>
          </div>

          <Button onClick={fetchSalesReport} className="w-full" disabled={loading}>
            {loading ? "Generating Report..." : "Generate Report"}
          </Button>

          {!loading && (
            <div>
              <Card className="mb-6 bg-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="text-xl font-semibold">Total Sales</h3>
                        <p className="text-muted-foreground">
                          {currencySymbols[currency]}{convertCurrency(salesData.summary.totalGrossSales).toFixed(2)}
                        </p>
                        <h4 className="text-sm mt-2">App Revenue</h4>
                        <p className="text-muted-foreground">
                          {currencySymbols[currency]}{convertCurrency(salesData.summary.totalAppRevenue).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(reportType === 'all' || reportType === 'products') && 
                renderSalesTable(salesData.giftShop.sales, 'Gift Shop', 'giftShop')}
              
              {(reportType === 'all' || reportType === 'itineraries') && 
                renderSalesTable(salesData.itineraries.sales, 'Itineraries', 'itineraries')}
              
              {(reportType === 'all' || reportType === 'events') && 
                renderSalesTable(salesData.activities.sales, 'Activities', 'activities')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSalesReport;
