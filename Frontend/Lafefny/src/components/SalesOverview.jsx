import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import axios from 'axios';
import { useCurrency, currencies } from '../context/CurrencyContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const SalesOverview = () => {
  const [salesData, setSalesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currency } = useCurrency();

  useEffect(() => {
    fetchSalesReport();
  }, [currency]);

  const fetchSalesReport = async () => {
    try {
      const userId = localStorage.getItem('userID');
      if (!userId) {
        throw new Error('User ID not found');
      }
  
      const response = await axios.get(`http://localhost:8000/advertiser/sales-report/${userId}`, {
        params: {
          startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString(),
          endDate: new Date().toISOString(),
        }
      });
  
      setSalesData(response.data.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      // Add error handling UI feedback here
    } finally {
      setIsLoading(false);
    }
  };

  
    
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

  if (isLoading || !salesData) return <div>Loading sales data...</div>;

  const chartData = {
    labels: salesData.activitySales.map(sale => 
      `${sale._id.month}/${sale._id.year}`
    ),
    datasets: [{
      label: 'Revenue',
      data: salesData.activitySales.map(sale => convertPrice(sale.revenue)),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sales Overview</h2>
        <span className="text-sm text-muted-foreground">
          Last 6 months
        </span>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <span className="text-2xl font-bold">{currencies[currency].symbol}{convertPrice(salesData.summary.totalRevenue).toFixed(2)}</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Total Bookings</span>
            <span className="text-2xl font-bold">{salesData.summary.totalBookings}</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Activities</span>
            <span className="text-2xl font-bold">{salesData.summary.totalActivities}</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Avg Rating</span>
            <span className="text-2xl font-bold">{salesData.summary.averageRating.toFixed(1)}</span>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Line data={chartData} options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: `Revenue ${currencies[currency].symbol}`
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Monthly Revenue'
            }
          }
        }} />
      </Card>
    </section>
  );
};