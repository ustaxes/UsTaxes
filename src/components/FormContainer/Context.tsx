import {
  createContext,
  useContext,
  PropsWithChildren,
  Context,
  ReactElement
} from 'react'
import { DataSource } from 'ustaxes/core/data'

interface FormContainerProps {
  onSubmit?: () => void
  getSource?: (name: string) => DataSource | undefined
}

const getProps = (): FormContainerProps => ({
  onSubmit: () => null,
  getSource: () => undefined
})

export const formContainerContext: Context<FormContainerProps> = createContext(
  getProps()
)

export const FormContainerProvider = ({
  onSubmit,
  getSource,
  children
}: PropsWithChildren<FormContainerProps>): ReactElement => {
  return (
    <formContainerContext.Provider value={{ onSubmit, getSource }}>
      {children}
    </formContainerContext.Provider>
  )
}

export const useFormContainer = (): FormContainerProps =>
  useContext(formContainerContext)
