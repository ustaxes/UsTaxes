export function getAllDataFlat (state) {
  return (
    Object.assign({}, ...Object.values(state.information))
  )
}
