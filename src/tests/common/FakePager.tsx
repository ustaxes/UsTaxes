import { Button } from '@material-ui/core'
import { PropsWithChildren, ReactElement } from 'react'
import { PagerContext, PagerProps } from 'ustaxes/components/pager'
import TestPage from './Page'

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

export abstract class PagerTestPage extends TestPage {
  renderComponent(): ReactElement {
    return <FakePagerProvider>{super.renderComponent()}</FakePagerProvider>
  }

  saveButton = (): HTMLButtonElement =>
    this.rendered().getByRole('button', { name: /Save/i }) as HTMLButtonElement
}

export const FakePagerProvider = ({
  children
}: PropsWithChildren<Record<never, never>>): ReactElement => (
  <PagerContext.Provider value={constPagerProps}>
    {children}
  </PagerContext.Provider>
)
