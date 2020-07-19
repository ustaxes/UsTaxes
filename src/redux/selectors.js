export function getFormData(state) {
    return state.information
}

export function getProduct(state, id) {
    return state.products[id]
}

export function getCartItems(state) {
    return state.cart
}