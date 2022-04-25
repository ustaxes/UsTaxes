import { useCallback, useEffect, useRef, RefCallback } from 'react'
import { useLastLocation } from 'react-router-last-location'

export const useFocus = (): [RefCallback<HTMLElement>] => {
  const ref = useRef<HTMLElement | null>(null)
  const lastLocation = useLastLocation()
  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node
  }, [])

  useEffect(() => {
    if (ref.current && lastLocation) {
      ref.current.focus()
    }
  }, [ref.current])

  return [setRef]
}
