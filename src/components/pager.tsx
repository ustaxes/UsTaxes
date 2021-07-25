import { Box, Button } from '@material-ui/core'
import React, { ReactElement, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

const makePager = <A, >(pages: A[], url: (a: A) => string, lookup: Map<string, number>): [A | undefined, (() => void) | undefined] => {
  const history = useHistory()

  const [curPage, update] = useState(lookup.get(history.location.pathname) ?? 0)

  history.listen((e) => {
    const newPage = lookup.get(e.pathname)

    if (newPage !== undefined) {
      update(newPage)
    }
  })

  const forward: (() => void) | undefined = (() => {
    if (curPage < pages.length - 1) {
      return () => history.push(url(pages[curPage + 1]))
    }
    return undefined
  })()

  const prev = (() => {
    if (curPage > 0) {
      return pages[curPage - 1]
    }
  })()

  return [prev, forward]
}

interface PagerButtonsProps {
  previousUrl?: string
  submitText: string
}

export const PagerButtons = ({ submitText, previousUrl }: PagerButtonsProps): ReactElement => {
  const backButton = (() => {
    if (previousUrl !== undefined) {
      return (
        <Box display="flex" justifyContent="flex-start" paddingRight={2}>
          <Button component={Link} to={previousUrl} variant="contained" color="secondary" >
            Previous
          </Button>
        </Box>
      )
    }
  })()

  return (
    <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
      {backButton}
      <Button type="submit" variant="contained" color="primary">
        { submitText }
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

export const StartButtons = ({ firstUrl, firstText, secondUrl, secondText }: StartButtonsProps): ReactElement => {
  return (
    <Box display="flex" justifyContent="space-evenly" paddingTop={3} paddingBottom={6}>
      <Button component={Link} to={ firstUrl } variant="contained" color="primary" >
        { firstText }
      </Button>
      <Button href={ secondUrl } variant="contained" color="secondary" >
        { secondText }
      </Button>
    </Box>
  )
}

interface SingleButtonsProps {
  url: string
  text: string
}

export const SingleButtons = ({ url, text }: SingleButtonsProps): ReactElement => {
  return (
    <Box display="flex" justifyContent="space-evenly" paddingTop={3} paddingBottom={6}>
      <Button component={Link} to = { url } variant="contained" color="primary" >
        { text }
      </Button>
    </Box>
  )
}

interface PagerProps {
  onAdvance: (() => void)
  navButtons: ReactElement
}

export const PagerContext = React.createContext<PagerProps>({
  onAdvance: () => {},
  navButtons: <></>
})

/**
 * Create hook for a forward and back flow
 * This just keeps track of an array index based on a list of URLS
 * for pages a user would navigate through. This way the browser back
 * button can behave as expected based on the user's actual sequence of actions,
 * but a previous / next flow can be available as well for a sequence of screens.
 * @param pages a list of pages A
 * @param url gets a url out of a page A, starting with '/' (history.location.pathname)
 * @returns [previousPage, goToNextPage]
 */
export const usePager = <A, >(pages: A[], url: (a: A) => string): [A | undefined, (() => void) | undefined] => {
  return makePager(pages, url, new Map(pages.map((p, i) => [url(p), i])))
}
