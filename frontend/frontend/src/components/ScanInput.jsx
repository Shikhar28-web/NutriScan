import React from "react"
import { useNavigate } from "react-router-dom"

export default function ScanInput(){

  const navigate = useNavigate()

  return(

    <div className="flex gap-4">

      <input
        placeholder="Enter product name..."
        className="border px-4 py-3 rounded-lg w-72 focus:ring-2 focus:ring-blue-400 outline-none"
      />

      <button
        onClick={()=>navigate("/result")}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Analyze
      </button>

    </div>

  )

}