import React from "react"

export default function Features(){

  return(

    <div className="bg-gray-50 py-20">

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-xl mb-2">Ingredient Analysis</h3>
          <p className="text-gray-600">
            AI analyzes ingredients and detects harmful chemicals.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-xl mb-2">Disease Impact</h3>
          <p className="text-gray-600">
            See which diseases may be affected by a product.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-xl mb-2">Healthy Alternatives</h3>
          <p className="text-gray-600">
            Discover better food options instantly.
          </p>
        </div>

      </div>

    </div>

  )

}