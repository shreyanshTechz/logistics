import React, { useState } from 'react';
import axios from 'axios';

const Booking = () => {
  const [pickup, setPickup] = useState({ lat: '', lng: '' });
  const [dropoff, setDropoff] = useState({ lat: '', lng: '' });
  const [vehicleType, setVehicleType] = useState('');
  const [price, setPrice] = useState(null);

  const handleBooking = async () => {
    const response = await axios.post('http://localhost:5000/api/user/book', {
      userId: 'some-user-id',
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      vehicleType
    });
    setPrice(response.data.booking.price);
  };

  return (
    <div>
      <h2>Book a Vehicle</h2>
      <input type="text" placeholder="Pickup Lat" onChange={(e) => setPickup({ ...pickup, lat: e.target.value })} />
      <input type="text" placeholder="Pickup Lng" onChange={(e) => setPickup({ ...pickup, lng: e.target.value })} />
      <input type="text" placeholder="Dropoff Lat" onChange={(e) => setDropoff({ ...dropoff, lat: e.target.value })} />
      <input type="text" placeholder="Dropoff Lng" onChange={(e) => setDropoff({ ...dropoff, lng: e.target.value })} />
      <select onChange={(e) => setVehicleType(e.target.value)}>
        <option value="car">Car</option>
        <option value="truck">Truck</option>
      </select>
      <button onClick={handleBooking}>Book</button>
      {price && <p>Estimated Price: {price}</p>}
    </div>
  );
};

export default Booking;