export function findPath(graph,start,end){

const queue=[
 [start]
];

const visited=new Set();


while(queue.length){

const path=queue.shift();

const node=path[path.length-1];


if(node===end)
return path;


if(!visited.has(node)){

visited.add(node);


graph[node].forEach(neighbor=>{

queue.push([
...path,
neighbor
]);

});

}

}


return [];

}