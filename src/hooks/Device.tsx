import { useEffect, useState } from 'react'
import { useViewport } from './Viewport'
import { useTheme } from '@material-ui/core/styles'

interface DeviceProps {
  isMobile: boolean
}

export const useDevice = (): DeviceProps => {
  const { width } = useViewport()
  const theme = useTheme()
  const [isMobile, setIsMobile] = useState(theme.breakpoints.values.sm > width)

  useEffect(() => {
    setIsMobile(theme.breakpoints.values.sm > width)
  }, [width])

  return { isMobile }
}
