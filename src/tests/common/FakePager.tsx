import { Button } from '@material-ui/core'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropsWithChildren, ReactElement } from 'react'
import { PagerContext, PagerProps } from 'ustaxes/components/pager'
import DomMethods from './DomMethods'

const constPagerProps: PagerProps = {
  onAdvance: () => {
    // not needed
  },
  navButtons: (
    <Button type="submit" name="save">
      Save and Continue
    </Button>
  )
}

export class PagerMethods extends DomMethods {
  saveButton = (): HTMLButtonElement =>
    within(this.dom()).getByRole('button', {
      name: /Save/i
    }) as HTMLButtonElement

  save = (): void => userEvent.click(this.saveButton())
}

export const FakePagerProvider = ({
  children
}: PropsWithChildren<Record<never, never>>): ReactElement => (
  <PagerContext.Provider value={constPagerProps}>
    {children}
  </PagerContext.Provider>
)
