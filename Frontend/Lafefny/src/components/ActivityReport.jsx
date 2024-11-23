import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ActivityReport() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [isFiltered, setIsFiltered] = useState(false);

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

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Activity Name</th>
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Time</th>
                                <th className="border p-2">Location</th>
                                <th className="border p-2">Price ($)</th>
                                <th className="border p-2">Category</th>
                                <th className="border p-2">Rating</th>
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
                                    <td className="border p-2">{activity.time}</td>
                                    <td className="border p-2">{activity.location}</td>
                                    <td className="border p-2">{activity.price}</td>
                                    <td className="border p-2">{activity.category}</td>
                                    <td className="border p-2">{activity.ratings?.averageRating || 0}</td>
                                    <td className="border p-2">
                                        <span className="font-medium">
                                            {getFilteredTouristCount(activity)} tourists
                                            {isFiltered && ` in ${selectedMonth}`}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}