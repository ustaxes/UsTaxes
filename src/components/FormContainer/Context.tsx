import {
  createContext,
  useContext,
  PropsWithChildren,
  Context,
  ReactElement
} from 'react'

interface FormContainerProps {
  onSubmit?: () => void
}

const getProps = (): FormContainerProps => ({
  onSubmit: () => null
})

export const formContainerContext: Context<FormContainerProps> = createContext(
  getProps()
)

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
