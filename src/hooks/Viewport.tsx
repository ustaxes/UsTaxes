import React, { PropsWithChildren, Context, ReactElement } from 'react'

interface Bounds {
  width: number
  height: number
}

const getBounds = (): Bounds => ({
  width: window.innerWidth,
  height: window.innerHeight
})

export const viewportContext: Context<Bounds> = React.createContext(getBounds())

export const ViewportProvider = ({
  children
}: PropsWithChildren<Record<never, never>>): ReactElement => {
  const [bounds, setBounds] = React.useState(getBounds())

  const handleWindowResize = (): void => setBounds(getBounds())

  React.useEffect(() => {
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [])

  return (
    <viewportContext.Provider value={bounds}>
      {children}
    </viewportContext.Provider>
  )
}

export const useViewport = (): Bounds => React.useContext(viewportContext)
