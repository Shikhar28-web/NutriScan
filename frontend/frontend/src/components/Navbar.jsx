import React from "react"
import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <div className="w-full flex justify-center mt-6">

      <nav className="w-[90%] max-w-6xl bg-blue-600 rounded-full shadow-lg px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
            N
          </div>

          <span className="text-xl font-bold text-white">
            NutriLens
          </span>

        </div>


        {/* Navigation */}

        <div className="flex gap-10 text-white font-medium">

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact Us</Link>

        </div>


        {/* Buttons */}

        <div className="flex items-center gap-4">

          <button className="text-white">
            Login
          </button>

          <button className="bg-white text-blue-600 px-5 py-2 rounded-full font-medium">
            Sign Up
          </button>

        </div>

      </nav>

    </div>
  )
}