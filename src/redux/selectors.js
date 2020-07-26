export function getFormData(state, id) {
    return (state["information"][id] ? 
            state["information"][id] : 
            {}
        )
}