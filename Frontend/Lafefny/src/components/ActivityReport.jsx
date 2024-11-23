/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ActivityReport() {
    const [activities, setActivities] = useState([]);
    const [touristBookings, setTouristBookings] = useState({});
    const [loading, setLoading] = useState({});
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get('http://localhost:8000/activities');
            setActivities(response.data);
            response.data.forEach(activity => getTouristBookings(activity._id));
        } catch (error) {
            console.error(error);
        }
    };

    const getTouristBookings = async (activityId) => {
        setLoading(prev => ({ ...prev, [activityId]: true }));
        try {
            const response = await axios.get(`http://localhost:8000/advertiser/numberOfTourists/${activityId}`);
            setTouristBookings(prev => ({
                ...prev,
                [activityId]: response.data
            }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(prev => ({ ...prev, [activityId]: false }));
        }
    };

    const getFilteredTouristCount = (activity) => {
        const activityId = activity._id;
        if (!touristBookings[activityId]) return 0;
        
        // If not filtered, return total bookings
        if (!isFiltered) return touristBookings[activityId].length;

        // Check if activity date matches selected month
        const activityDate = new Date(activity.date);
        const activityMonth = `${activityDate.getFullYear()}-${String(activityDate.getMonth() + 1).padStart(2, '0')}`;
        
        // Only count bookings if activity is in selected month
        if (activityMonth === selectedMonth) {
            return touristBookings[activityId].length;
        }
        return 0;
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Activity Report</h1>
            
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
                            <th className="border p-2">Activity Name</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Duration</th>
                            <th className="border p-2">Price ($)</th>
                            <th className="border p-2">Number of Tourists</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity) => (
                            <tr key={activity._id}>
                                <td className="border p-2">{activity.name}</td>
                                <td className="border p-2">
                                    {new Date(activity.date).toLocaleDateString()}
                                </td>
                                <td className="border p-2">{activity.duration}</td>
                                <td className="border p-2">{activity.price}</td>
                                <td className="border p-2">
                                    <div className="flex flex-col items-center gap-2">
                                        {loading[activity._id] ? (
                                            <span>Loading...</span>
                                        ) : (
                                            <span className="font-medium">
                                                {getFilteredTouristCount(activity)} tourists
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