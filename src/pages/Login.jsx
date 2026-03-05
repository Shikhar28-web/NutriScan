import React from "react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">

      <div className="bg-white rounded-xl shadow-xl w-[900px] grid grid-cols-2 overflow-hidden">

        {/* LEFT SIDE IMAGE */}

        <div className="bg-blue-100 flex items-center justify-center p-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/5087/5087579.png"
            alt="login illustration"
            className="w-80"
          />
        </div>

        {/* RIGHT SIDE FORM */}

        <div className="flex flex-col justify-center px-12">

          <h2 className="text-3xl font-bold text-blue-600 mb-2">
            Welcome!
          </h2>

          <p className="text-gray-500 mb-6">
            Sign in to your account
          </p>

          <input
            type="email"
            placeholder="Email Address"
            className="border p-3 rounded-lg mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg mb-4"
          />

          <p className="text-sm text-blue-500 mb-4 cursor-pointer">
            Forgot Password?
          </p>

          <button className="bg-blue-600 text-white py-3 rounded-lg mb-4 hover:bg-blue-700">
            SIGN IN
          </button>

          <p className="text-center text-gray-500">
            Don't have an account?
            <Link to="/signup" className="text-blue-600 ml-2">
              Sign Up
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}