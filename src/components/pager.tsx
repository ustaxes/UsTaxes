import { Box, Button } from '@material-ui/core'
import React, { ReactElement, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

/**
 * Create hook for a forward and back flow
 * This just keeps track of an array index based on a list of URLS
 * for pages a user would navigate through. This way the browser back
 * button can behave as expected based on the user's actual sequence of actions,
 * but a previous / next flow can be available as well for a sequence of screens.
 * @param pageUrls a list of urls, starting with '/' (history.location.pathname)
 * @returns [goToPreviousPage, goToNextPage, previousUrl, currentUrl]
 */
export const usePager = (pageUrls: string[]): [() => void, () => void, string | undefined, string] => {
  const history = useHistory()

  const navPage = (path: string): number | undefined => {
    const found = pageUrls.findIndex(p => p === path)
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
      history.push(pageUrls[curPage - 1])
    }
  }

  const forward = (): void => {
    if (curPage < pageUrls.length) {
      history.push(pageUrls[curPage + 1])
      update(curPage + 1)
    }
  }

  let prevUrl
  if (curPage > 0) {
    prevUrl = pageUrls[curPage - 1]
  }

  return [previous, forward, prevUrl, pageUrls[curPage]]
}

interface PagerButtonsProps {
  backUrl?: string
  submitText: string
  onBack: () => void
}

export const PagerButtons = ({ submitText, backUrl, onBack }: PagerButtonsProps): ReactElement => {
  let backButton: ReactElement | undefined
  if (backUrl !== undefined) {
    backButton = (
      <Box display="flex" justifyContent="flex-start" paddingRight={2}>
        <Button onClick={onBack} component={Link} to={backUrl} variant="contained" color="secondary" >
          Previous
        </Button>
      </Box>
    )
  }

  return (
    <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
      {backButton}
      <Button type="submit" variant="contained" color="primary">
        { submitText }
      </Button>
    </Box>
  )
}
