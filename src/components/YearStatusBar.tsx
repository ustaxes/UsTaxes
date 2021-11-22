import { Link } from '@material-ui/core'
import { ReactElement, useState } from 'react'
import { useSelector } from 'react-redux'
import { YearsTaxesState, TaxYears } from 'ustaxes/redux'
import YearDropDown from './YearDropDown'

const YearStatusBar = (): ReactElement => {
  const year = useSelector((state: YearsTaxesState) => state.activeYear)
  const [isOpen, setOpen] = useState(false)

  const openButton = (
    <Link
      href=""
      onClick={(e) => {
        e.preventDefault()
        setOpen(true)
      }}
    >
      {TaxYears[year]}
    </Link>
  )

  return (
    <div>
      <h3>Editing Information for {isOpen ? TaxYears[year] : openButton}</h3>
      {isOpen ? <YearDropDown onDone={() => setOpen(false)} /> : undefined}
    </div>
  )
}

export default YearStatusBar
