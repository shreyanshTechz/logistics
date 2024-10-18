import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Tracking = ({ bookingId }) => {
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 });

  useEffect(() => {
    // Listen for location updates from the server
    socket.on('locationChange', (data) => {
      if (data.bookingId === bookingId) {
        setDriverLocation(data.location);
      }
    });
  }, [bookingId]);

  return (
    <div>
      <h3>Driver's Location</h3>
      <p>Latitude: {driverLocation.lat}</p>
      <p>Longitude: {driverLocation.lng}</p>
    </div>
  );
};

export default Tracking;