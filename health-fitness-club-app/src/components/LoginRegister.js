import React, { useState } from 'react';
import './LoginRegister.css';

const LoginRegister = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [address, setAddress] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [firstName, setFirstName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        sessionStorage.setItem('userId', data.id);
        onLogin(data.role);
      } catch (error) {
        alert('Login failed. Please try again.');
        console.error(error);
      }
    } else {
      alert('Please fill in both email and password.');
    }
  };

  const handleRegister = async () => {
    if (email && password && firstName && lastName && phone && address && birthday && weight && height && paymentMethod) {
      try {
        const role = 'Member';
        const joinDate = new Date().toISOString().split('T')[0];
        const membershipEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];

        if (isNaN(weight) || isNaN(height)) {
          alert('Weight and height must be numbers.');
          return;
        }

        // Convert weight and height to numbers
        const numericWeight = Number(weight);
        const numericHeight = Number(height);

        // Calculate BMI
        const bmi = numericWeight / (Math.pow(numericHeight / 100, 2));

        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            phone,
            address,
            birthday,
            role,
            joinDate,
            membershipEndDate,
            weight: numericWeight,
            height: numericHeight,
            bmi,
            paymentMethod,
          }),
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        const data = await response.json();
        sessionStorage.setItem('userId', data.id);
        onLogin(data.role);
      } catch (error) {
        alert('Registration failed. Please try again.');
        console.error(error);
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="login-register-container">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      {isLogin ? (
        <>
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="action-button" onClick={handleLogin}>Login</button>
          <button className="toggle-button" onClick={() => setIsLogin(false)}>Go to Register</button>
        </>
      ) : (
        <>
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input-field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="input-field" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input className="input-field" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input className="input-field" type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="input-field" type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <label htmlFor="birthday" className="birthday-label">Birthday:</label>
          <input className="input-field" type="date" placeholder="Birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          <input className="input-field" type="text" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
          <input className="input-field" type="text" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} />
          <label htmlFor="birthday" className="membership-cost-label">Membership Cost: $99.99</label>
          <input className="input-field" type="text" placeholder="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          <button className="action-button" onClick={handleRegister}>Register</button>
          <button className="toggle-button" onClick={() => setIsLogin(true)}>Back to Login</button>
        </>
      )}
    </div>
  );
};

export default LoginRegister;