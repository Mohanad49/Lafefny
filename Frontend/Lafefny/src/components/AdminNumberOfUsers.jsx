import axios from "axios";
import { useState, useEffect } from "react";

export default function AdminNumberOfUsers() {
    const [numOfUsers, setNumOfUsers] = useState({
        totalNum: 0,
        monthlyUsers: []
    });

    useEffect(() => { 
        const fetchNumOfUsers = async () => {
            try {
                const users = await axios.get('http://localhost:8000/admin/numberOfUsers');
                const newUsers = await axios.get('http://localhost:8000/admin/numberOfNewUsers');
                setNumOfUsers({
                    totalNum: users.data,
                    monthlyUsers: newUsers.data
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchNumOfUsers();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Number of Users</h1>
            <p className="mb-4">Total Number of users: {numOfUsers.totalNum}</p>
            
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Month</th>
                            <th className="border p-2">New Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {numOfUsers.monthlyUsers.map((data, index) => (
                            <tr key={index}>
                                <td className="border p-2">{data.month}</td>
                                <td className="border p-2">{data.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}