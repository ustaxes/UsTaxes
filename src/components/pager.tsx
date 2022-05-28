import {
  createContext,
  useContext,
  PropsWithChildren,
  ReactElement,
  ReactNode
} from 'react'
import { useMediaQuery, Button, Grid } from '@material-ui/core'
import { isMobileOnly as isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import { useLocation, useNavigate } from 'react-router'

export interface PagerProps {
  onAdvance: () => void
  navButtons?: ReactElement
}

export const PagerContext = createContext<PagerProps>({
  onAdvance: () => {
    // do nothing
  }
})

interface PagerProviderProps<A> {
  pages: A[]
}

interface Page {
  url: string
}

export const PagerProvider = <A extends Page>({
  children,
  pages
}: PropsWithChildren<PagerProviderProps<A>>): ReactElement => {
  const lookup = new Map(pages.map((p, i) => [p.url, i]))

  const currentLoc = useLocation()
  const currentPage = lookup.get(currentLoc.pathname) ?? 0

  const navigate = useNavigate()

  const onAdvance: (() => void) | undefined = (() => {
    if (currentPage < pages.length - 1) {
      return () => navigate(pages[currentPage + 1].url)
    }
  })()

  const prev = currentPage > 0 ? pages[currentPage - 1] : undefined

  const navButtons: ReactElement = (
    <PagerButtons
      previousUrl={prev?.url}
      submitText={onAdvance !== undefined ? 'Save and Continue' : undefined}
    />
  )

  return (
    <PagerContext.Provider
      value={{
        onAdvance:
          onAdvance ??
          (() => {
            // end of pages
          }),
        navButtons
      }}
    >
      {children}
    </PagerContext.Provider>
  )
}

interface PagerButtonsProps {
  previousUrl?: string
  nextUrl?: string
  submitText?: string
}

export const PagerButtons = ({
  submitText,
  previousUrl
}: PagerButtonsProps): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const backButton = (() => {
    if (previousUrl !== undefined && previousUrl !== '/start') {
      return (
        <Grid item xs={isMobile && 12}>
          <Button
            component={Link}
            to={previousUrl}
            variant="contained"
            color={prefersDarkMode ? 'default' : 'secondary'}
            fullWidth
          >
            Previous
          </Button>
        </Grid>
      )
    }
  })()

  const submitButton: ReactNode = (() => {
    if (submitText !== undefined) {
      return (
        <Grid item xs={isMobile ? 12 : undefined}>
          <Button
            type="submit"
            name="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            {submitText}
          </Button>
        </Grid>
      )
    }
  })()

  return (
    <Grid container spacing={2} direction={isMobile ? 'row-reverse' : 'row'}>
      {backButton}
      {submitButton}
    </Grid>
  )
}

interface StartButtonsProps {
  firstUrl: string
  firstText: string
  secondUrl: string
  secondText: string
}

export const StartButtons = ({
  firstUrl,
  firstText,
  secondUrl,
  secondText
}: StartButtonsProps): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Button
          component={Link}
          to={firstUrl}
          variant="contained"
          color="primary"
          fullWidth
        >
          {firstText}
        </Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button
          href={secondUrl}
          variant="contained"
          fullWidth
          color={prefersDarkMode ? 'default' : 'secondary'}
        >
          {secondText}
        </Button>
      </Grid>
    </Grid>
  )
}

interface SingleButtonsProps {
  url: string
  text: string
}

export const SingleButtons = ({
  url,
  text
}: SingleButtonsProps): ReactElement => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button
          component={Link}
          to={url}
          variant="contained"
          color="primary"
          fullWidth
        >
          {text}
        </Button>
      </Grid>
    </Grid>
  )
}

export const usePager = (): PagerProps => useContext(PagerContext)
