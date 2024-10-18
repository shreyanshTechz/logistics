import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const DriverDashboard = () => {
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });
  const socket = io('http://localhost:5000'); // Connect to the backend
  const [user, setUser] = useState(localStorage.getItem('userid'));

  // Function to update driver location
  const updateLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(user);
        setDriverLocation({ lat: latitude, lng: longitude });

        // Emit the location to the server
        socket.emit('driver-location-update', {
          lat: latitude,
          lng: longitude,
          driverId: user,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  // Fetch and update the driver's location every 5 seconds
  useEffect(() => {
    const locationInterval = setInterval(updateLocation, 5000);

    // Cleanup the interval when the component unmounts
    return () => {
      clearInterval(locationInterval);
      socket.disconnect(); // Ensure socket is disconnected on unmount
    };
  }, [socket, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-500">
          Driver Dashboard
        </h1>
        <h3 className="text-lg font-semibold mb-2 text-gray-600">
          Your Current Location:
        </h3>
        <div className="space-y-2 text-center">
          <p className="text-gray-700">
            <span className="font-medium">Latitude:</span> {driverLocation.lat}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Longitude:</span> {driverLocation.lng}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
