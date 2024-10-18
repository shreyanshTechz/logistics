import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Booking from './components/Booking';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthForm from './components/Auth';
import UserDashboard from './components/UserDashborad';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/signup" element={<AuthForm/>}/>
          <Route path="/" element={<UserDashboard/>} />
          <Route path="/driver" element={<DriverDashboard driverId="6711765aadb9a17e0ec20ef2" />} />
          <Route path="/admin" element={<AdminDashboard/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;