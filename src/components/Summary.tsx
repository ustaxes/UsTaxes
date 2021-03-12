import React, { ReactElement } from 'react'
import { Box } from '@material-ui/core'
import { PagerContext } from './pager'
import { create1040 } from '../irsForms/Main'
import { useSelector } from 'react-redux'
import { Information, TaxesState } from '../redux/data'

const Summary = (): ReactElement => {
  const state: Information = useSelector((state: TaxesState) => state.information)

  const f1040 = create1040(state)

  return (
    <PagerContext.Consumer>
      { ({ navButtons }) =>
        <Box display="flex" justifyContent="center">
          <form>
            <div>
              <Box display="flex" justifyContent="flex-start">
                <h2>Summary</h2>
              </Box>
              <Box display="flex" justifyContent="flex-start">
                <h4>Credits</h4>
                {f1040.scheduleEIC?.investmentIncome(f1040)}
              </Box>
              {navButtons}
            </div>
          </form>
        </Box>
      }
    </PagerContext.Consumer>
  )
}

export default Summary
