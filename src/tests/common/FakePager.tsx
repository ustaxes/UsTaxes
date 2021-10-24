import { Button } from '@material-ui/core'
import { PropsWithChildren, ReactElement } from 'react'
import { PagerContext, PagerProps } from 'ustaxes/components/pager'

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

export const FakePagerProvider = ({
  children
}: PropsWithChildren<Record<never, never>>): ReactElement => (
  <PagerContext.Provider value={constPagerProps}>
    {children}
  </PagerContext.Provider>
)
