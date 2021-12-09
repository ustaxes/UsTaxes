import { ReactElement } from 'react'
import { Prompt as RouterPrompt } from 'react-router'

export const Prompt = ({
  when,
  message = 'Are you sure you want to leave? Data will be lost'
}: {
  when: boolean
  message?: string
}): ReactElement => <RouterPrompt when={when} message={message} />
