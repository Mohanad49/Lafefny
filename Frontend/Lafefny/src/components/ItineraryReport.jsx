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

export default function ItineraryReport() {
    const navigate = useNavigate();
    const [itineraries, setItineraries] = useState([]);
    const [touristBookings, setTouristBookings] = useState({});
    const [loading, setLoading] = useState({});
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

    useEffect(() => {
        fetchItineraries();
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    },[]); //itineraries

    const fetchItineraries = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/itineraries/tourGuide/${localStorage.getItem('userID')}`);
            setItineraries(response.data);
            response.data.forEach(itinerary => getTouristBookings(itinerary._id));
        } catch (error) {
            console.error(error);
        }
    };

    const getTouristBookings = async (itineraryId) => {
        setLoading(prev => ({ ...prev, [itineraryId]: true }));
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/tourGuide/numberOfTourists/${itineraryId}`);
            setTouristBookings(prev => ({
                ...prev,
                [itineraryId]: response.data
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(prev => ({ ...prev, [itineraryId]: false }));
        }
    };

    const getFilteredTouristCount = (itineraryId) => {
        if (!touristBookings[itineraryId]) return 0;
        if (!isFiltered) return touristBookings[itineraryId].length;

        return touristBookings[itineraryId].filter(booking => {
            const bookingDate = new Date(booking.bookedDate);
            const bookingMonth = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
            return bookingMonth === selectedMonth;
        }).length;
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
                    <h1 className="text-3xl font-bold text-primary">Itinerary Report</h1>
                </div>
            
            <div className="flex justify-center mb-4  gap-4">
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
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Clear Filter
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Itinerary Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Price ($)</TableHead>
                                <TableHead>Number of Tourists</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {itineraries.map((itinerary) => (
                                <TableRow key={itinerary._id}>
                                    <TableCell className="font-medium">{itinerary.name}</TableCell>
                                    <TableCell>{itinerary.duration} hours</TableCell>
                                    <TableCell>{itinerary.location}</TableCell>
                                    <TableCell>{itinerary.price}</TableCell>
                                    <TableCell>
                                        {getFilteredTouristCount(itinerary._id)} tourists
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
