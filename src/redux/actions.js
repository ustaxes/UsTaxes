export const ADD_CART_ITEM = 'ADD_CART_ITEM'
export const REMOVE_CART_ITEM = 'REMOVE_CART_ITEM'
export const EMPTY_CART = 'EMPTY_CART'

export const SAVE_FORM_DATA = 'SAVE_FORM_DATA'

// saving form data to larger form data object with all information that has been saved to pages
export function saveFormData(formData, key) {
    return {
        type: SAVE_FORM_DATA,
        formData,
        key
    }
}

export function addCartItem(id, name, price, amount) {
    return {
        type: ADD_CART_ITEM,
        id,
        name,
        price,
        amount
    }
}

export function removeCartItem(id) {
    return {
        type: REMOVE_CART_ITEM,
        id
    }
}

export function emptyCart() {
    return {
        type: EMPTY_CART
    }
}