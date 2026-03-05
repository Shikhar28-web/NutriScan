import React from "react"
export default function AlternativeProducts(){

const alternatives = [
"Oats Noodles",
"Whole Wheat Pasta",
"Millet Noodles"
]

return(

<div className="mt-10">

<h2 className="text-2xl font-bold mb-4">
Healthier Alternatives
</h2>

<div className="grid md:grid-cols-3 gap-6">

{alternatives.map((p,i)=>(

<div key={i}
className="bg-green-50 p-4 rounded-lg shadow">

{p}

</div>

))}

</div>

</div>

)

}