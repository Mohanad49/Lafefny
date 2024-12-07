/* eslint-disable no-unused-vars */
// SalesReport.jsx
import { useState } from 'react';
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

export default function SalesReport() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const { toast } = useToast();
  const userId = localStorage.getItem('userID');

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/advertiser/sales-report/${userId}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          month: selectedMonth,
          year: selectedYear
        }
      });

      setReportData(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sales report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
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
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              day_today: "bg-accent/50 text-accent-foreground",
              cell: "h-9 w-9 text-center text-sm relative p-0 data-[isSelected=true]:bg-primary data-[isSelected=true]:text-primary-foreground",
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
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              day_today: "bg-accent/50 text-accent-foreground",
              cell: "h-9 w-9 text-center text-sm relative p-0 data-[isSelected=true]:bg-primary data-[isSelected=true]:text-primary-foreground",
            }}
            footer={
              <p className="text-sm text-muted-foreground">
                {endDate && format(endDate, "PPP")}
              </p>
            }
          />
        </Card>

        <div className="space-y-4">
          <Select 
            onValueChange={(value) => setSelectedMonth(value === 'all' ? '' : value)}
            value={selectedMonth || 'all'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by Month</SelectItem>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            onValueChange={(value) => setSelectedYear(value === 'all' ? '' : value)}
            value={selectedYear || 'all'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Filter by Year</SelectItem>
              {Array.from({ length: 5 }, (_, i) => (
                <SelectItem key={i} value={String(new Date().getFullYear() - i)}>
                  {new Date().getFullYear() - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={fetchReport} disabled={isLoading}>
            {isLoading ? "Loading..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {reportData && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${reportData.summary.totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{reportData.summary.totalBookings}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold">{reportData.summary.totalActivities}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{reportData.summary.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Activity Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Activity</th>
                    <th className="text-left p-2">Month/Year</th>
                    <th className="text-right p-2">Revenue</th>
                    <th className="text-right p-2">Bookings</th>
                    <th className="text-right p-2">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.activitySales.map((sale, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{sale._id.activity}</td>
                      <td className="p-2">
                        {new Date(0, sale._id.month - 1).toLocaleString('default', { month: 'long' })} {sale._id.year}
                      </td>
                      <td className="text-right p-2">${sale.revenue.toFixed(2)}</td>
                      <td className="text-right p-2">{sale.bookings}</td>
                      <td className="text-right p-2">{sale.averageRating?.toFixed(1) || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}