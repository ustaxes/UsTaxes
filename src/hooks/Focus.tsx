import { useCallback, useEffect, useRef, RefCallback } from 'react'
import { useLastLocation } from 'react-router-last-location'

export const useFocus = (): [RefCallback<HTMLElement>] => {
  const ref = useRef<HTMLElement | null>(null)
  const lastLocation = useLastLocation()
  const setRef = useCallback((node) => {
    if (ref.current) {
      // Make sure to cleanup any events/references added to the last instance
    }

    if (node) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  useEffect(() => {
    if (ref.current && lastLocation) {
      ref.current.focus()
    }
  }, [ref.current])

  return [setRef]
}
