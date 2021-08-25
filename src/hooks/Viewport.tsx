import React, { ReactElement } from 'react'

interface ViewportContextProps {
  width: number
  height: number
}

const viewportContext = React.createContext(undefined as any)

interface ViewportProviderProps {
  children: ReactElement
}

export const ViewportProvider = ({ children }: ViewportProviderProps) => {
  const [width, setWidth] = React.useState(window.innerWidth)
  const [height, setHeight] = React.useState(window.innerHeight)

  const handleWindowResize = () => {
    setWidth(window.innerWidth)
    setHeight(window.innerHeight)
  }

  React.useEffect(() => {
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  return (
    <viewportContext.Provider value={{ width, height }}>
      {children}
    </viewportContext.Provider>
  )
}

export const useViewport = () => {
  const { width, height } = React.useContext(viewportContext)

  return { width, height }
}
