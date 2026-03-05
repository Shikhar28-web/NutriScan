import React from "react"
import DiseaseImpact from "../components/DiseaseImpact"
import AlternativeProducts from "../components/AlternativeProducts"

export default function ProductResult(){

return(

<div className="max-w-6xl mx-auto py-16 px-6">

<h1 className="text-3xl font-bold mb-6">
Product Analysis
</h1>

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-semibold">
Maggi Noodles
</h2>

<p className="text-gray-600 mt-2">
High sodium, preservatives, refined flour
</p>

</div>

<DiseaseImpact/>

<AlternativeProducts/>

</div>

)

}