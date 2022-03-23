import { Assignment, Form } from './data'

export enum FormGenActionName {
  ADD_FORM = 'ADD_FORM',
  ASSIGN_FIELD = 'ASSIGN_FIELD'
}

type Save<T, R> = {
  type: T
  formData: R
}

type AddForm = Save<typeof FormGenActionName.ADD_FORM, Form>
type AssignField = Save<typeof FormGenActionName.ASSIGN_FIELD, Assignment>

export type FormAction = AddForm | AssignField

export const addForm = (form: Form): AddForm => ({
  type: FormGenActionName.ADD_FORM,
  formData: form
})

export const assignField = (assignment: Assignment): AssignField => ({
  type: FormGenActionName.ASSIGN_FIELD,
  formData: assignment
})
