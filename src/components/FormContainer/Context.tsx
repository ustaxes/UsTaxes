import type { PropsWithChildren, Context, ReactElement } from 'react'
import { createContext, useContext } from 'react'

interface FormContainerProps {
  onSubmit?: () => void
}

const getProps = (): FormContainerProps => ({
  onSubmit: () => null
})

export const formContainerContext: Context<FormContainerProps> =
  createContext(getProps())

export const FormContainerProvider = ({
  onSubmit,
  children
}: PropsWithChildren<FormContainerProps>): ReactElement => {
  return (
    <formContainerContext.Provider value={{ onSubmit }}>
      {children}
    </formContainerContext.Provider>
  )
}

export const useFormContainer = (): FormContainerProps =>
  useContext(formContainerContext)
