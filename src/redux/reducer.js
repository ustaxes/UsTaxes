import { combineReducers } from 'redux';
import {
    SAVE_FORM_DATA
} from './actions'

function formReducer(state = {}, action) {
    switch (action.type) {
        case SAVE_FORM_DATA:
            let test = {}
            test[action.key] = action.formData
            return { ...state, ...test }

        default:
            return state
    }
}

const rootReducer = combineReducers({
    information: formReducer,
})
export default rootReducer;
