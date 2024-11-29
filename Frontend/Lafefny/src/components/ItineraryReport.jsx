import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ItineraryReport() {
    const [itineraries, setItineraries] = useState([]);
    const [touristBookings, setTouristBookings] = useState({});
    const [loading, setLoading] = useState({});
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

    useEffect(() => {
        fetchItineraries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    const fetchItineraries = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/itineraries/tourGuide/${localStorage.getItem('userID')}`);
            setItineraries(response.data);
            response.data.forEach(itinerary => getTouristBookings(itinerary._id));
        } catch (error) {
            console.error(error);
        }
    };

    const getTouristBookings = async (itineraryId) => {
        setLoading(prev => ({ ...prev, [itineraryId]: true }));
        try {
            const response = await axios.get(`http://localhost:8000/tourGuide/numberOfTourists/${itineraryId}`);
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
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Itinerary Report</h1>
            
            <div className="mb-4 flex gap-4">
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={() => setIsFiltered(true)}
                    disabled={!selectedMonth}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
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

            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Itinerary Name</th>
                            <th className="border p-2">Duration (hours)</th>
                            <th className="border p-2">Price ($)</th>
                            <th className="border p-2">Language</th>
                            <th className="border p-2">Average Rating</th>
                            <th className="border p-2">Number of Tourists</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itineraries.map((itinerary) => (
                            <tr key={itinerary._id}>
                                <td className="border p-2">{itinerary.name}</td>
                                <td className="border p-2">{itinerary.duration}</td>
                                <td className="border p-2">{itinerary.price}</td>
                                <td className="border p-2">{itinerary.language}</td>
                                <td className="border p-2">{itinerary.ratings?.averageRating || 0}</td>
                                <td className="border p-2">
                                    <div className="flex flex-col items-center gap-2">
                                        {loading[itinerary._id] ? (
                                            <span>Loading...</span>
                                        ) : (
                                            <span className="font-medium">
                                                {getFilteredTouristCount(itinerary._id)} tourists
                                                {isFiltered && ` in ${selectedMonth}`}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
