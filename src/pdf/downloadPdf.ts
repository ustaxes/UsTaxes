export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const openBlobInNewTab = (blob: Blob): Window | null => {
  const url = URL.createObjectURL(blob)
  const tab = window.open(url, '_blank')
  if (!tab) {
    URL.revokeObjectURL(url)
    return null
  }
  tab.addEventListener('beforeunload', () => URL.revokeObjectURL(url))
  return tab
}
