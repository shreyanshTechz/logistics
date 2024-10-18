import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const driverResponse = await axios.get('http://localhost:5000/api/admin/drivers');
        const bookingResponse = await axios.get('http://localhost:5000/api/admin/bookings');

        setDrivers(driverResponse.data);
        setBookings(bookingResponse.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <h3>Drivers</h3>
      <ul>
        {drivers.map((driver) => (
          <li key={driver._id}>
            {driver.name} - {driver.vehicleType} - {driver.isAvailable ? 'Available' : 'Unavailable'}
          </li>
        ))}
      </ul>

      <h3>Bookings</h3>
      <ul>
        {bookings.map((booking) => (
          <li key={booking._id}>
            Booking ID: {booking._id}, Status: {booking.status}, Price: {booking.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;