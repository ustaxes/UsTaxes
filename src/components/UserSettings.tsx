import { Check } from '@mui/icons-material'
import { ReactElement, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Load } from 'ustaxes/redux/fs'
import { fsRecover } from 'ustaxes/redux/fs/Actions'
import { USTSerializedState } from 'ustaxes/redux/store'
import SaveToFile from './SaveToFile'

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
      <Load<USTSerializedState>
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
      </Load>
    </>
  )
}

export default UserSettings
