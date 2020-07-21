import { combineReducers } from 'redux';
import {
    ADD_CART_ITEM,
    REMOVE_CART_ITEM,
    EMPTY_CART,

    SAVE_FORM_DATA
} from './actions'

function formReducer(state = {}, action) {
    switch (action.type) {
        case SAVE_FORM_DATA:
            return { ...state, ...action.formData }

        default:
            return state
    }
}

function cartReducer(state = {}, action) {
    switch (action.type) {
        case ADD_CART_ITEM:
            return state[action.id] ? {
                ...state,
                [action.id]: {
                    id: action.id,
                    name: action.name,
                    price: action.price,
                    amount: action.amount + state[action.id].amount
                }
            } : {
                    ...state,
                    [action.id]: {
                        id: action.id,
                        name: action.name,
                        price: action.price,
                        amount: action.amount
                    }
                }

        case REMOVE_CART_ITEM:
            return (({ [action.id]: _, ...rest }) => rest)(state)

        case EMPTY_CART:
            return {}

        default:
            return state;
    }
}
const rootReducer = combineReducers({
    information: formReducer,
    cart: cartReducer
})
export default rootReducer;
