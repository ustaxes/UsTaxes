import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
  useState
} from 'react'
import { FormField } from '../data'

interface PrelimFormData {
  doc: ArrayBuffer
  fields: FormField[]
  title: string
}

interface FormLibraryData {
  forms: PrelimFormData[]
  workingPDF?: Uint8Array
  selectedField?: number
  methods: {
    addForm: (form: PrelimFormData) => void
    removeForm: (index: number) => void
    setWorkingPDF: (pdf: Uint8Array | undefined) => void
    setSelectedField: (index: number | undefined) => void
  }
}

const blankFormLibrary: FormLibraryData = {
  forms: [],
  methods: {
    addForm: () => {
      // do nothing
    },
    removeForm: () => {
      // do nothing
    },
    setWorkingPDF: () => {
      // do nothing
    },
    setSelectedField: () => {
      // do nothing
    }
  }
}

const FormLibraryContext = createContext<FormLibraryData>(blankFormLibrary)

export const FormLibraryProvider = (
  props: PropsWithChildren<Partial<Omit<FormLibraryData, 'methods'>>>
): ReactElement => {
  const { forms: initForms = [], children } = props
  const [forms, setForms] = useState<PrelimFormData[]>(initForms)
  const [workingPDF, setWorkingPDF] = useState<Uint8Array | undefined>()
  const [selectedField, setSelectedField] = useState<number | undefined>()

  const addForm = (form: PrelimFormData): void => {
    setForms([...forms, form])
  }

  const removeForm = (index: number): void => {
    setForms(forms.filter((_, i) => i !== index))
  }

  return (
    <FormLibraryContext.Provider
      value={{
        forms,
        workingPDF,
        selectedField,
        methods: { addForm, removeForm, setWorkingPDF, setSelectedField }
      }}
    >
      {children}
    </FormLibraryContext.Provider>
  )
}

const useFormLibrary = (): FormLibraryData => useContext(FormLibraryContext)

export default useFormLibrary
