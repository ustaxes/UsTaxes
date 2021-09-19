import { ReactElement } from 'react'

const boxLabel = (box: string, description: string): ReactElement => (
  <>
    <strong>Box {box}</strong> - {description}
  </>
)

export default boxLabel
