export function getFormData (state, id) {
  return (state.information[id]
    ? state.information[id]
    : {}
  )
}

export function getAllDataFlat (state) {
  return (
    Object.assign({}, ...Object.values(state.information))
  )
}
