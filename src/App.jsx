import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup.jsx";

function Navbar() {
  return (
    <div className="w-full flex justify-center mt-6">

      <div className="bg-blue-600 text-white w-[90%] max-w-6xl flex items-center justify-between px-8 py-4 rounded-full shadow-lg">

        {/* LOGO */}

        <div className="flex items-center gap-3">

          <div className="bg-white text-blue-600 font-bold w-10 h-10 rounded-full flex items-center justify-center">
            N
          </div>

          <span className="font-bold text-lg">NutriLens</span>

        </div>


        {/* NAV LINKS */}

        <div className="flex gap-10 font-medium">

          <Link to="/">Home</Link>
          <Link to="/">About</Link>
          <Link to="/">Contact Us</Link>

        </div>


        {/* AUTH BUTTONS */}

        <div className="flex gap-4 items-center">

          <Link to="/login">
            <button className="text-white">
              Login
            </button>
          </Link>

          <Link to="/signup">
            <button className="bg-white text-blue-600 px-5 py-2 rounded-full font-semibold">
              Sign Up
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;