import { Box, Button } from '@material-ui/core'
import React, { ReactElement, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

/**
 * Create hook for a forward and back flow
 * This just keeps track of an array index based on a list of URLS
 * for pages a user would navigate through. This way the browser back
 * button can behave as expected based on the user's actual sequence of actions,
 * but a previous / next flow can be available as well for a sequence of screens.
 * @param pages a list of pages A
 * @param url gets a url out of a page A, starting with '/' (history.location.pathname)
 * @returns [goToPreviousPage, goToNextPage, previousUrl, currentUrl]
 */
export const usePager = <A, >(pages: A[], url: (a: A) => string): [() => void, (() => void) | undefined, A | undefined, A] => {
  const history = useHistory()

  const navPage = (path: string): number | undefined => {
    const found = pages.findIndex(p => url(p) === path)
    if (found < 0) {
      return undefined
    } else {
      return found
    }
  }

  const [curPage, update] = useState(navPage(history.location.pathname) ?? 0)

  history.listen((e) => {
    const newPage = navPage(e.pathname)

    if (newPage !== undefined) {
      update(newPage)
    }
  })

  const previous = (): void => {
    if (curPage > 0) {
      update(curPage - 1)
      history.push(url(pages[curPage - 1]))
    }
  }

  const forward: (() => void) | undefined = (() => {
    if (curPage < pages.length - 1) {
      return () => {
        history.push(pages[curPage + 1])
        update(curPage + 1)
      }
    }
    return undefined
  })()

  const prev = (() => {
    if (curPage > 0) {
      return pages[curPage - 1]
    }
  })()

  return [previous, forward, prev, pages[curPage]]
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

interface PagerProps {
  onAdvance: (() => void)
  navButtons: ReactElement
}

export const PagerContext = React.createContext<PagerProps>({
  onAdvance: () => {},
  navButtons: <></>
})
