import { PropsWithChildren, FunctionComponent, ReactElement } from 'react'

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const ConditionallyWrap = ({
  condition,
  wrapper,
  children
}: PropsWithChildren<{
  condition: boolean
  wrapper: FunctionComponent<any>
  children: ReactElement
}>) => (condition ? wrapper(children) : children)

export default ConditionallyWrap
