import React from "react";

export default function Home() {
  return (
    <div>

      {/* HERO SECTION */}

      <section className="max-w-7xl mx-auto px-6 mt-24 grid md:grid-cols-2 gap-12 items-center">


        {/* LEFT SIDE */}

        <div>

          <h1 className="text-5xl font-bold leading-tight">
            Scan, Analyze & Choose
            <span className="text-blue-600 block">
              Healthier Food
            </span>
          </h1>

          <p className="text-gray-600 mt-6 text-lg">
            NutriLens analyzes ingredients and shows how packaged foods
            affect your health while recommending healthier alternatives.
          </p>


          {/* PRODUCT INPUT */}

          <div className="flex flex-col gap-4 mt-8">

            <div className="flex gap-4">

              <input
                type="text"
                placeholder="Enter product name..."
                className="border px-5 py-3 rounded-lg w-72"
              />

              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Analyze
              </button>

            </div>


            {/* BARCODE UPLOAD */}

            <div className="flex items-center gap-4">

              <label className="bg-gray-100 border px-5 py-3 rounded-lg cursor-pointer hover:bg-gray-200">

                📷 Upload Barcode Image

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                />

              </label>

              <span className="text-gray-500 text-sm">
                Upload product barcode to scan automatically
              </span>

            </div>

          </div>

        </div>


        {/* RIGHT IMAGE */}

        <div className="flex justify-center">

          <img
            src="https://i.pinimg.com/1200x/93/ba/14/93ba14e517b6aa97a1c42b3ca5dd57e2.jpg"
            alt="Healthy Food"
            className="rounded-xl shadow-lg w-full max-w-md"
          />

        </div>

      </section>



      {/* HOW IT WORKS */}

      <section className="bg-gray-50 py-20">

        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-3xl font-bold">
            How NutriLens Works
          </h2>


          <div className="grid md:grid-cols-3 gap-10 mt-12">

            <div className="flex flex-col items-center">

              <img
                src="https://cdn-icons-png.flaticon.com/512/622/622669.png"
                className="w-14 mb-4"
              />

              <h3 className="font-semibold text-xl">
                Scan Product
              </h3>

              <p className="text-gray-600 mt-2">
                Enter product name or upload barcode to analyze ingredients.
              </p>

            </div>


            <div className="flex flex-col items-center">

              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                className="w-14 mb-4"
              />

              <h3 className="font-semibold text-xl">
                Ingredient Analysis
              </h3>

              <p className="text-gray-600 mt-2">
                AI detects additives, preservatives and nutrition values.
              </p>

            </div>


            <div className="flex flex-col items-center">

              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                className="w-14 mb-4"
              />

              <h3 className="font-semibold text-xl">
                Health Score
              </h3>

              <p className="text-gray-600 mt-2">
                Receive a simple health score and healthier alternatives.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* FEATURES */}

      <section className="py-24 max-w-7xl mx-auto px-6">

        <h2 className="text-3xl font-bold text-center">
          Powerful NutriLens Features
        </h2>


        <div className="grid md:grid-cols-3 gap-10 mt-14">


          <div className="p-6 border rounded-xl shadow-sm hover:shadow-md">

            <img
              src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
              className="w-12 mb-4"
            />

            <h3 className="font-semibold text-xl">
              Ingredient Scanner
            </h3>

            <p className="text-gray-600 mt-3">
              Detect hidden additives and harmful preservatives.
            </p>

          </div>


          <div className="p-6 border rounded-xl shadow-sm hover:shadow-md">

            <img
              src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
              className="w-12 mb-4"
            />

            <h3 className="font-semibold text-xl">
              Health Score
            </h3>

            <p className="text-gray-600 mt-3">
              Each product receives a score from 0-100.
            </p>

          </div>


          <div className="p-6 border rounded-xl shadow-sm hover:shadow-md">

            <img
              src="https://cdn-icons-png.flaticon.com/512/833/833472.png"
              className="w-12 mb-4"
            />

            <h3 className="font-semibold text-xl">
              Disease Risk Detection
            </h3>

            <p className="text-gray-600 mt-3">
              Understand which health conditions a product may affect.
            </p>

          </div>


          <div className="p-6 border rounded-xl shadow-sm hover:shadow-md">

            <img
              src="https://cdn-icons-png.flaticon.com/512/135/135620.png"
              className="w-12 mb-4"
            />

            <h3 className="font-semibold text-xl">
              Healthier Alternatives
            </h3>

            <p className="text-gray-600 mt-3">
              Discover better product options instantly.
            </p>

          </div>


          <div className="p-6 border rounded-xl shadow-sm hover:shadow-md">

            <img
              src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
              className="w-12 mb-4"
            />

            <h3 className="font-semibold text-xl">
              Nutrition Insights
            </h3>

            <p className="text-gray-600 mt-3">
              Understand fats, sugar, and calories clearly.
            </p>

          </div>


          <div className="p-6 border rounded-xl shadow-sm hover:shadow-md">

            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
              className="w-12 mb-4"
            />

            <h3 className="font-semibold text-xl">
              Smart AI Analysis
            </h3>

            <p className="text-gray-600 mt-3">
              AI explains complex ingredients in simple language.
            </p>

          </div>

        </div>

      </section>



      {/* CTA */}

      <section className="bg-blue-600 text-white py-20 text-center">

        <h2 className="text-3xl font-bold">
          Start Scanning Your Food Today
        </h2>

        <p className="mt-4">
          Make smarter food decisions with NutriLens.
        </p>

        <button className="mt-8 bg-white text-blue-600 px-8 py-4 rounded-lg font-medium">
          Analyze Product
        </button>

      </section>



      {/* FOOTER */}

      <footer className="bg-gray-900 text-white py-12 text-center">

        <p>
          © 2026 NutriLens — AI Food Analyzer
        </p>

      </footer>

    </div>
  );
}