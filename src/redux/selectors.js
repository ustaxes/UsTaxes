export function getFormData(state, id) {
    return (state["information"][id] ? 
            state["information"][id] : 
            {}
        )
}

export function getProduct(state, id) {
    return state.products[id]
}

export function getCartItems(state) {
    return state.cart
}