import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm font-sans">

        {/* Email */}
        <div className="mb-1">
          <label className="text-sm font-semibold text-gray-800">Email</label>
        </div>
        <div className="flex items-center border border-gray-200 rounded-xl h-12 px-3 mb-4 transition-all duration-200 focus-within:border-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 32 32" className="text-gray-400 shrink-0">
            <g data-name="Layer 3" id="Layer_3">
              <path fill="currentColor" d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" />
            </g>
          </svg>
          <input
            placeholder="Enter your Email"
            className="ml-2 flex-1 h-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
            type="text"
          />
        </div>

        {/* Password */}
        <div className="mb-1">
          <label className="text-sm font-semibold text-gray-800">Password</label>
        </div>
        <div className="flex items-center border border-gray-200 rounded-xl h-12 px-3 mb-4 transition-all duration-200 focus-within:border-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="-64 0 512 512" className="text-gray-400 shrink-0">
            <path fill="currentColor" d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" />
            <path fill="currentColor" d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" />
          </svg>
          <input
            placeholder="Enter your Password"
            className="ml-2 flex-1 h-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
            type="password"
          />
        </div>

        {/* Remember me / Forgot password */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" className="accent-blue-500" />
            Remember me
          </label>
          <span className="text-sm text-blue-500 font-medium cursor-pointer hover:underline">
            Forgot password?
          </span>
        </div>

        {/* Sign In button */}
        <button className="w-full h-12 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
          Sign In
        </button>

        {/* Sign Up link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?
          <span className="text-blue-500 font-medium cursor-pointer hover:underline ml-1">Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;