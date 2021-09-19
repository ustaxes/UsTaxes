import { ReactElement } from 'react'
import { Exfiltrate, Load } from 'ustaxes/redux/External'

const UserSettings = (): ReactElement => {
  return (
    <>
      <h2>User Settings</h2>
      <h3>Save data</h3>
      <p>Save your data for backup or to import into desktop application</p>
      <Exfiltrate variant="contained" color="primary">
        Save data to file
      </Exfiltrate>
      <h3>Load data</h3>
      <p>
        Load your saved data from a file. Warning, this will overwrite present
        state.
      </p>
      <Load variant="contained" color="primary">
        Load
      </Load>
    </>
  )
}

export default UserSettings
