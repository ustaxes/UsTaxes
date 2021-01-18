import { Box, Button } from '@material-ui/core'
import React, { ReactElement, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

export const usePager = (pageUrls: string[]): [() => void, () => void, string | undefined, string] => {
  const history = useHistory()

  const initPath: string = history.location.pathname
  const initialPage: number = Math.max(pageUrls.findIndex(p => p === initPath), 0)

  const [curPage, update] = useState(initialPage)

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
