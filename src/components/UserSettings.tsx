import { Check } from '@material-ui/icons'
import { ReactElement, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Load } from 'ustaxes/redux/fs'
import { FSRecover } from 'ustaxes/redux/fs/Actions'
import SaveToFile from './SaveToFIle'

const UserSettings = (): ReactElement => {
  const dispatch = useDispatch()
  const [done, setDone] = useState(false)

  return (
    <>
      <h2>User Settings</h2>
      <h3>Save data</h3>
      <p>Save your data for backup or to import into desktop application</p>
      <SaveToFile variant="contained" color="primary">
        Save data to file
      </SaveToFile>
      <h3>Load data</h3>
      <p>
        Load your saved data from a file. Warning, this will overwrite present
        state.
      </p>
      <Load
        startIcon={done ? <Check /> : undefined}
        handleData={(state) => {
          if (!done) {
            dispatch(FSRecover(state))
            setDone(true)
          }
        }}
        variant="contained"
        color="primary"
      >
        Load
      </Load>
    </>
  )
}

export default UserSettings
