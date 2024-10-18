import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const history = useNavigate();
  const [isUser, setIsUser] = useState(true);
  const [isSignup, setIsSignup] = useState(false);

  const [emailOrName, setEmailOrName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleUserType = () => {
    setIsUser((prev) => !prev);
    setEmailOrName('');
    setPassword('');
    setPhone('');
    setVehicleType('');
  };

  const toggleSignupLogin = () => {
    setIsSignup((prev) => !prev);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    try {
      let endpoint, payload;

      if (isSignup) {
        if (isUser) {
          endpoint = '/auth/user/signup';
          payload = { name: emailOrName, email: emailOrName, phone, password };
        } else {
          endpoint = '/auth/driver/signup';
          payload = { name: emailOrName, vehicleType, password };
        }
      } else {
        if (isUser) {
          endpoint = '/auth/user/login';
          payload = { email: emailOrName, password };
        } else {
          endpoint = '/auth/driver/login';
          payload = { name: emailOrName, password };
        }
      }

      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (!isSignup) {
        const token = response.data.token;
        const userid = response.data.userid;
        localStorage.setItem('token', token);
        localStorage.setItem('userid', userid);
        alert(`${isUser ? 'User' : 'Driver'} logged in successfully!`);
        history(`${isUser ? '/' : '/driver'}`);
      } else {
        alert(`${isUser ? 'User' : 'Driver'} signed up successfully!`);
        history(`${isUser ? '/' : '/driver'}`);
      }

      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">
        {isSignup
          ? isUser
            ? 'User Signup'
            : 'Driver Signup'
          : isUser
          ? 'User Login'
          : 'Driver Login'}
      </h2>

      <div className="space-y-4 w-full max-w-xs">
        <input
          type="text"
          placeholder={isUser ? 'Email' : 'Name'}
          value={emailOrName}
          onChange={(e) => setEmailOrName(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        {isSignup && isUser && (
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-md"
        />

        {isSignup && !isUser && (
          <input
            type="text"
            placeholder="Vehicle Type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        )}

        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          {isSignup ? 'Signup' : 'Login'}
        </button>

        <div className="flex justify-between">
          <button
            onClick={toggleSignupLogin}
            className="text-blue-500 underline"
          >
            {isSignup ? 'Switch to Login' : 'Switch to Signup'}
          </button>

          <button
            onClick={toggleUserType}
            className="text-blue-500 underline"
          >
            Switch to {isUser ? 'Driver' : 'User'}{' '}
            {isSignup ? 'Signup' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
