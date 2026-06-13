import React, { useState } from 'react';

const FloatingLabel = ({ type, label, className = '' }) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');

  const isFloated = focused || value.length > 0;

  return (
    <div className={`relative border rounded-xl transition-colors duration-200 h-14 ${focused ? 'border-blue-500' : 'border-gray-300'} ${className}`}>
      <span className={`absolute left-3 pointer-events-none transition-all duration-200 ${
        isFloated
          ? 'top-1.5 text-xs font-semibold ' + (value.length > 0 && !focused ? 'text-green-600' : 'text-blue-600')
          : 'top-4 text-sm text-gray-400'
      }`}>
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute bottom-0 left-0 w-full px-3 pb-2 pt-0 h-8 text-sm bg-transparent outline-none rounded-xl"
      />
    </div>
  );
};

const Signup = () => {
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

        {/* First name / Last name row */}
        <div className="flex gap-2">
          <FloatingLabel type="text" label="Firstname" className="flex-1" />
          <FloatingLabel type="text" label="Lastname" className="flex-1" />
        </div>

        <FloatingLabel type="email" label="Email" />
        <FloatingLabel type="password" label="Password" />
        <FloatingLabel type="password" label="Confirm password" />

        {/* Submit */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-xl py-2.5 transition-colors duration-200 cursor-pointer mt-1">
          Submit
        </button>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="#" className="text-blue-600 hover:underline font-medium">Sign in</a>
        </p>

      </div>
    </div>
  );
};

export default Signup;