import { PropsWithChildren, ReactNode, ReactElement } from 'react'

type ConditionallyWrapProps = PropsWithChildren<{
  condition: boolean
  wrapper: (children: ReactNode) => ReactElement
}>

const ConditionallyWrap = ({
  condition,
  wrapper,
  children
}: ConditionallyWrapProps): ReactElement =>
  condition ? wrapper(children) : <>{children}</>

export default ConditionallyWrap
