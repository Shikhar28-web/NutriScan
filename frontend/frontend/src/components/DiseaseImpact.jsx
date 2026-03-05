import React from "react"
export default function DiseaseImpact(){

const diseases = [
"High Blood Pressure",
"Obesity",
"Heart Disease"
]

return(

<div className="mt-10">

<h2 className="text-2xl font-bold mb-4">
Health Impact
</h2>

<div className="grid md:grid-cols-3 gap-4">

{diseases.map((d,i)=>(

<div key={i}
className="bg-red-50 border border-red-200 p-4 rounded-lg">

{d}

</div>

))}

</div>

</div>

)

}