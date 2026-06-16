import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FloatingLabel = ({ type, label, className = '', name, autoComplete = 'off', value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const isFloated = focused || value.length > 0;

  return (
    <div className={`relative border rounded-xl transition-colors duration-200 h-14 ${focused ? 'border-blue-500' : 'border-gray-300'} ${className}`}>
      <span className={`absolute left-3 pointer-events-none transition-all duration-200 ${isFloated
        ? 'top-1.5 text-xs font-semibold ' + (value.length > 0 && !focused ? 'text-green-600' : 'text-blue-600')
        : 'top-4 text-sm text-gray-400'
        }`}>
        {label}
      </span>
      <input
        id={id}
        name={name || id}
        required
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute bottom-0 left-0 w-full px-3 pb-2 pt-0 h-8 text-sm bg-transparent outline-none rounded-xl"
      />
    </div>
  );
};

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { syncCartWithServer } = useCart();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Sync cart with server
        await syncCartWithServer();

        // Redirect to home
        navigate('/');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-sm font-sans flex flex-col gap-3">

        {/* Title with pulse dot */}
        <p className="text-2xl font-semibold text-blue-600 tracking-tight flex items-center pl-8 relative">
          <span className="absolute left-0 w-4 h-4 rounded-full bg-blue-600" />
          <span className="absolute left-0 w-4 h-4 rounded-full bg-blue-600 animate-ping opacity-75" />
          Register
        </p>

        <p className="text-sm text-gray-500">Signup now and get full access to our app.</p>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* First name / Last name row */}
          <div className="flex gap-2">
            <FloatingLabel
              type="text"
              label="Firstname"
              name="firstName"
              autoComplete="given-name"
              className="flex-1"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <FloatingLabel
              type="text"
              label="Lastname"
              name="lastName"
              autoComplete="family-name"
              className="flex-1"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <FloatingLabel
            type="email"
            label="Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FloatingLabel
            type="password"
            label="Password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FloatingLabel
            type="password"
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-xl py-2.5 transition-colors duration-200 cursor-pointer mt-1 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Submit'}
          </button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline font-medium cursor-pointer"
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
};

export default Signup;