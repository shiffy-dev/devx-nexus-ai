const storeLayout={

nodes:{


entrance:{
x:10,
y:85,
name:"Entrance",
icon:"🚪"
},


vegetables:{
x:25,
y:40,
name:"Vegetables",
icon:"🥬"
},


bakery:{
x:50,
y:25,
name:"Bakery",
icon:"🍞"
},


dairy:{
x:75,
y:40,
name:"Dairy",
icon:"🥛"
},


checkout:{
x:90,
y:85,
name:"Checkout",
icon:"🛒"
}


},


edges:{

entrance:[
"vegetables",
"checkout"
],

vegetables:[
"entrance",
"bakery"
],

bakery:[
"vegetables",
"dairy"
],

dairy:[
"bakery",
"checkout"
],

checkout:[
"entrance",
"dairy"
]


}


}


export default storeLayout;