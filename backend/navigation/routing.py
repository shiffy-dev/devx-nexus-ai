from collections import deque

from navigation.graph import graph
from navigation.product_locations import product_locations



def shortest_path(start, target):

    queue = deque()

    queue.append([start])

    visited = set()


    while queue:

        path = queue.popleft()

        node = path[-1]


        if node == target:
            return path


        if node in visited:
            continue


        visited.add(node)


        for neighbour in graph.get(node, []):

            new_path = list(path)

            new_path.append(neighbour)

            queue.append(new_path)


    return []



def get_product_nodes(product_ids):

    nodes = []

    for product_id in product_ids:

        if product_id in product_locations:

            nodes.append(
                product_locations[product_id]
            )

    return nodes

def create_route(start_node, product_ids):

    product_nodes = get_product_nodes(product_ids)


    store_order = [
        "N-001",
        "N-002",
        "N-011",
        "N-012",
        "N-004",
        "N-005",
        "N-006",
        "N-007",
        "N-008",
        "N-010",
        "N-013",
        "N-014"
    ]


    current_index = store_order.index(start_node)


    # remove locations already passed
    remaining_products = []

    for node in product_nodes:

        if store_order.index(node) >= current_index:
            remaining_products.append(node)


    remaining_products.sort(
        key=lambda x: store_order.index(x)
    )


    route = [
        start_node
    ]


    current = start_node


    for node in remaining_products:

        path = shortest_path(
            current,
            node
        )

        route.extend(
            path[1:]
        )

        current = node


    return route