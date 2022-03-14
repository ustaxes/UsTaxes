import { Theme } from '@mui/material'
import { styled } from '@mui/material/styles'

const FormRoot = styled('div')(({ palette: { mode: themeType } }: Theme) => ({
  'form-root': {
    '& .MuiFormLabel-root': {
      color:
        themeType === 'dark'
          ? 'rgba(255, 255, 255, 0.7)'
          : 'rgba(0, 0, 0, 0.54)'
    }
  }
}))

export default FormRoot
