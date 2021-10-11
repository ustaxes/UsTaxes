import { Theme } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/styles'
import { ReactElement, useState } from 'react'
import { useSelector } from 'react-redux'
import { TaxesState, TaxYears } from 'ustaxes/redux/data'
import YearDropDown from './YearDropDown'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(2)
    }
  })
)

const YearStatusBar = (): ReactElement => {
  const year = useSelector((state: TaxesState) => state.activeYear)
  const [isOpen, setOpen] = useState(false)

  const classes = useStyles()

  const openButton = (
    <a
      href=""
      onClick={(e) => {
        e.preventDefault()
        setOpen(true)
      }}
    >
      {TaxYears[year]}
    </a>
  )

  return (
    <div className={classes.root}>
      <h3>Editing information for {isOpen ? TaxYears[year] : openButton}</h3>
      {isOpen ? <YearDropDown onDone={() => setOpen(false)} /> : undefined}
    </div>
  )
}

export default YearStatusBar
