export function getProducts(state) {
    return state.products
}

export function getProduct(state, id) {
    return state.products[id]
}

export function getCartItems(state) {
    return state.cart
}