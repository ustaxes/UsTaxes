import {
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  ReactElement
} from 'react'
import { useMediaQuery, Button, Grid } from '@material-ui/core'
import { isMobile } from 'react-device-detect'
import { Link, useHistory } from 'react-router-dom'

interface PagerProps {
  onAdvance: () => void
  navButtons: ReactElement
}

export const PagerContext = createContext<PagerProps>({
  onAdvance: () => {
    /* just a placeholder */
  },
  navButtons: <></>
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
  const history = useHistory()

  const lookup = new Map(pages.map((p, i) => [p.url, i]))

  const [curPage, update] = useState(lookup.get(history.location.pathname) ?? 0)

  history.listen((e) => {
    const newPage = lookup.get(e.pathname)

    if (newPage !== undefined) {
      update(newPage)
    }
  })

  const onAdvance: (() => void) | undefined = (() => {
    if (curPage < pages.length - 1) {
      return () => history.push(pages[curPage + 1].url)
    }
    return undefined
  })()

  const prev = (() => {
    if (curPage > 0) {
      return pages[curPage - 1]
    }
  })()

  const navButtons: ReactElement = (
    <PagerButtons
      previousUrl={prev?.url}
      submitText={onAdvance !== undefined ? 'Save and Continue' : 'Create PDF'}
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
  submitText: string
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

  const submitButton = (() => (
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
  ))()

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
