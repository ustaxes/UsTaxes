import { Check } from '@material-ui/icons'
import { ReactElement, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fsRecover } from 'ustaxes/redux/fs/Actions'
import { LoadRaw } from 'ustaxes/redux/fs/Load'
import SaveToFile from './SaveToFile'
import ClearLocalStorage from './ClearLocalStorage'

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
      <LoadRaw
        startIcon={done ? <Check /> : undefined}
        accept="*.json"
        handleData={(state) => {
          if (!done) {
            dispatch(fsRecover(state))
            setDone(true)
          }
        }}
        variant="contained"
        color="primary"
      >
        Load
      </LoadRaw>
      <h3>Delete data</h3>
      <ClearLocalStorage variant="contained" color="primary">
        Clear Local Storage
      </ClearLocalStorage>
    </>
  )
}

export default UserSettings
