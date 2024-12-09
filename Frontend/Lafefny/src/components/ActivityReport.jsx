/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ActivityReport() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/activities/advertiser/${localStorage.getItem('userID')}`);
            setActivities(response.data);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTouristCount = (activity) => {
        if (!activity.touristBookings) return 0;
        
        if (!isFiltered) return activity.touristBookings.length;

        const activityDate = new Date(activity.date);
        const activityMonth = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, '0')}`;
        
        return activityMonth === selectedMonth ? activity.touristBookings.length : 0;
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <Navigation />
            
            {/* Back button */}
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 mt-9"
                    > 
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">Activity Report</h1>
                </div>

                {/* Filter Controls */}
                <div className="flex justify-center gap-4 mb-8">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                        onClick={() => setIsFiltered(true)}
                        disabled={!selectedMonth}
                        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Filter by Month
                    </button>
                    {isFiltered && (
                        <button
                            onClick={() => {
                                setIsFiltered(false);
                                setSelectedMonth('');
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Activity Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Number of Tourists</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity) => (
                                <TableRow key={activity._id}>
                                    <TableCell className="font-medium">{activity.name}</TableCell>
                                    <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{activity.time}</TableCell>
                                    <TableCell>{activity.location}</TableCell>
                                    <TableCell>${activity.price}</TableCell>
                                    <TableCell>
                                        {getFilteredTouristCount(activity)} tourists
                                        {isFiltered && ` in ${selectedMonth}`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}