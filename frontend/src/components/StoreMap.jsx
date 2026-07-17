import React from "react";
import storeLayout from "../data/StoreLayout";
import "./StoreMap.css";


function StoreMap({route=[]}){


return (

<div className="supermarket-map">


<div className="map-header">
🏪 Madina Supermarket
</div>


<div className="aisles">


{
Object.entries(storeLayout.nodes).map(([id,node])=>(

<div

key={id}

className={
route.includes(id)
?
"store-node active"
:
"store-node"
}

style={{
left:`${node.x}%`,
top:`${node.y}%`
}}

>

<div className="icon">

{node.icon}

</div>


<span>
{node.name}
</span>


</div>

))

}


</div>


</div>


)

}


export default StoreMap;