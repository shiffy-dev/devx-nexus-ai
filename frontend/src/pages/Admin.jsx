import React, {useEffect, useState} from "react";


function Admin(){

const [orders,setOrders] = useState([]);



useEffect(()=>{


const socket = new WebSocket(
"ws://127.0.0.1:8000/ws/admin"
);



socket.onmessage = (event)=>{


const data = JSON.parse(
event.data
);


if(data.type==="NEW_ORDER"){

setOrders(prev=>[
...prev,
data.order
]);

}

};



return ()=>socket.close();


},[]);



return (

<div>

<h1>
Admin Dashboard
</h1>


<h2>
Live Orders
</h2>


{
orders.map(order=>(

<div key={order.order_id}>

<h3>
🔔 {order.order_id}
</h3>

<p>
Customer: {order.customer}
</p>


<p>
Items:
{
order.items.join(", ")
}
</p>


<p>
Status:
{order.status}
</p>


</div>

))

}


</div>

)

}


export default Admin;