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
