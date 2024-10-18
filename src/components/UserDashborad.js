import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const DriverList = ({ drivers, handleBookDriver }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drivers.length > 0 ? (
          drivers.map((driver) => (
            <div
              key={driver._id}
              className="bg-white shadow-md rounded-lg p-4 transition-transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-blue-500">{driver.name}</h3>
              <p className="text-gray-600">Vehicle: {driver.vehicleType}</p>
              <p className="text-gray-600">
                Distance: {driver.distance.toFixed(2)} km
              </p>
              <p className="text-gray-600">Price: ${driver.price.toFixed(2)}</p>
              <button
                onClick={() => handleBookDriver(driver._id)}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Book Driver
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No drivers available.</p>
        )}
      </div>
    );
  };


const UserDashboard = () => {
  const [drivers, setDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState(null); // User's current location
  const [pickupLocation, setPickupLocation] = useState({ lat: 0, lng: 0 });
  const [dropoffLocation, setDropoffLocation] = useState({ lat: 0, lng: 0 });
  const socket = io('http://localhost:5000'); // Replace with your server URL

  // Function to calculate the distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Fetch user's location once the component mounts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        console.log(userLocation);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  // Fetch available drivers once the user's location is available
  useEffect(() => {
    if (userLocation) {
      console.log(userLocation);

      const fetchDrivers = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/user/drivers');
          const driversWithDistanceAndPrice = response.data.map((driver) => {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              driver.currentLocation.lat,
              driver.currentLocation.lng
            );
            const price = calculatePrice(distance, driver.vehicleType);
            return { ...driver, distance, price };
          });

          // Sort drivers by distance (ascending)
          const sortedDrivers = driversWithDistanceAndPrice.sort(
            (a, b) => a.distance - b.distance
          );
          setDrivers(sortedDrivers);
        } catch (error) {
          console.error('Error fetching drivers:', error);
        }
      };

      fetchDrivers();

      // Listen for real-time driver location updates
      socket.on('driver-location-updated', (updatedDriver) => {
        setDrivers((prevDrivers) =>
          prevDrivers.map((driver) =>
            driver._id === updatedDriver.driverId
              ? {
                  ...driver,
                  currentLocation: updatedDriver,
                  distance: calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    updatedDriver.lat,
                    updatedDriver.lng
                  ),
                  price: calculatePrice(
                    calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      updatedDriver.lat,
                      updatedDriver.lng
                    ),
                    driver.vehicleType
                  ),
                }
              : driver
          )
        );
      });

      // Listen for driver booking updates (when a driver gets booked)
      socket.on('driver-booked', (bookedDriverId) => {
        setDrivers((prevDrivers) =>
          prevDrivers.filter((driver) => driver._id !== bookedDriverId)
        );
      });

      // Clean up the socket listeners when the component unmounts
      return () => {
        socket.off('driver-location-changed');
        socket.off('driver-booked');
      };
    }
  }, [userLocation, socket]);

  // Calculate price based on distance and vehicle type
  const calculatePrice = (distance, vehicleType) => {
    let basePrice = 50; // Base price
    let pricePerKm = 0;

    if (vehicleType === 'Car') {
      pricePerKm = 10; // Example price per km for cars
    } else if (vehicleType === 'Truck') {
      pricePerKm = 15; // Example price per km for trucks
    }

    return basePrice + pricePerKm * distance;
  };

  // Handle booking a driver
  const handleBookDriver = async (driverId) => {
    try {
      const token = localStorage.getItem('token'); // User's JWT token
      await axios.post(
        'http://localhost:5000/api/book',
        {
          driverId,
          pickupLocation,
          dropoffLocation,
          vehicleType: drivers.find((driver) => driver._id === driverId).vehicleType
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token for authentication
          },
        }
      );
      alert('Booking confirmed!');
      socket.emit('driver-booked', driverId); // Notify other users that this driver is booked
    } catch (error) {
      console.error('Error booking driver:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">User Dashboard</h1>

        {/* Display User's Current Coordinates */}
        {userLocation ? (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Your Current Location:</h3>
            <p className="text-gray-700">Latitude: {userLocation.lat}</p>
            <p className="text-gray-700">Longitude: {userLocation.lng}</p>
          </div>
        ) : (
          <p className="text-red-500">Fetching your location...</p>
        )}

        <h3 className="text-lg font-semibold text-gray-600 mb-4">Available Drivers (sorted by distance):</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Pickup Latitude"
            onChange={(e) => setPickupLocation({ ...pickupLocation, lat: e.target.value })}
            className="border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Pickup Longitude"
            onChange={(e) => setPickupLocation({ ...pickupLocation, lng: e.target.value })}
            className="border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Dropoff Latitude"
            onChange={(e) => setDropoffLocation({ ...dropoffLocation, lat: e.target.value })}
            className="border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Dropoff Longitude"
            onChange={(e) => setDropoffLocation({ ...dropoffLocation, lng: e.target.value })}
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <DriverList drivers={drivers} handleBookDriver={handleBookDriver} />
        
      </div>
      
    </div>
  );
};

export default UserDashboard;
