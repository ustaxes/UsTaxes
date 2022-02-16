import { ReactElement } from 'react'
import { Load } from 'ustaxes/redux/fs'

export const TransactionImporter = (): ReactElement => {
  return (
    <Load
      variant="contained"
      color="primary"
      handleData={(contents) => console.log(contents)}
    >
      Load CSV File
    </Load>
  )
}
