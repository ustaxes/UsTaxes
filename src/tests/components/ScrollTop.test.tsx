import { render, screen } from '@testing-library/react'
import * as materialUi from '@material-ui/core'
import ScrollTop from 'ustaxes/components/ScrollTop'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'

jest.mock('@material-ui/core', () => {
  const actual =
    jest.requireActual<typeof import('@material-ui/core')>('@material-ui/core')
  return {
    ...actual,
    useScrollTrigger: jest.fn()
  }
})

const mockUseScrollTrigger = jest.mocked(materialUi.useScrollTrigger)

describe('ScrollTop', () => {
  beforeEach(() => {
    mockUseScrollTrigger.mockReset()
    window.scrollTo = jest.fn()
  })

  it('hides the button when the scroll threshold has not been reached', () => {
    mockUseScrollTrigger.mockReturnValue(false)

    render(<ScrollTop />)

    const container = screen.getByRole('presentation', { hidden: true })
    expect(container).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument()
  })

  it('shows the button and scrolls to top when clicked', async () => {
    mockUseScrollTrigger.mockReturnValue(true)
    const user = setupUserEvent()

    render(<ScrollTop />)

    const container = screen.getByRole('presentation')
    expect(container).toHaveAttribute('aria-hidden', 'false')

    await user.click(screen.getByRole('button', { name: 'scroll back to top' }))

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    })
  })
})
