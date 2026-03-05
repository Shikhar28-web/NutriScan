import React from "react"

export default function ProductResult() {

  return (

    <div className="max-w-5xl mx-auto py-20 px-6">

      <h1 className="text-4xl font-bold mb-10">
        Product Analysis
      </h1>

      <div className="bg-white shadow-lg rounded-xl p-8">

        <h2 className="text-2xl font-semibold mb-4">
          Maggi Noodles
        </h2>

        <p className="text-gray-600 mb-4">
          High sodium, preservatives and refined flour detected.
        </p>

        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          ⚠️ May increase risk of high blood pressure and obesity.
        </div>

      </div>

    </div>

  )

}