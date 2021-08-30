import React, { ReactElement, useState, PropsWithChildren } from 'react'
import { Box, Button } from '@material-ui/core'
import { useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'

interface PagerProps {
  onAdvance: () => void
  navButtons: ReactElement
}

export const PagerContext = React.createContext<PagerProps>({
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
  const backButton = (() => {
    if (previousUrl !== undefined) {
      return (
        <Box display="flex" justifyContent="flex-start" marginRight={2}>
          <Button
            component={Link}
            to={previousUrl}
            variant="contained"
            color="secondary"
          >
            Previous
          </Button>
        </Box>
      )
    }
  })()

  return (
    <Box
      display="flex"
      justifyContent="flex-start"
      marginTop={2}
      marginBottom={1}
    >
      {backButton}
      <Button type="submit" name="submit" variant="contained" color="primary">
        {submitText}
      </Button>
    </Box>
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
  return (
    <Box
      display="flex"
      justifyContent="space-evenly"
      marginTop={3}
      marginBottom={6}
    >
      <Button
        component={Link}
        to={firstUrl}
        variant="contained"
        color="primary"
      >
        {firstText}
      </Button>
      <Button href={secondUrl} variant="contained" color="secondary">
        {secondText}
      </Button>
    </Box>
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
    <Box
      display="flex"
      justifyContent="space-evenly"
      marginTop={3}
      marginBottom={6}
    >
      <Button component={Link} to={url} variant="contained" color="primary">
        {text}
      </Button>
    </Box>
  )
}

export const usePager = (): PagerProps => useContext(PagerContext)
