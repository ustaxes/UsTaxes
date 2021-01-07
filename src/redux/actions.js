export const SAVE_FORM_DATA = 'SAVE_FORM_DATA'

// saving form data to larger form data object with all information that has been saved to pages
export function saveFormData (formData, key) {
  // remove hyphens in SSIDs, Zips etc.. added for readability, removed for PDF filling
  Object.keys(formData).forEach(key => {
    if (formData[key]) {
      formData[key] = formData[key].replace(/-/g, '')
    }
  })
  return {
    type: SAVE_FORM_DATA,
    formData,
    key
  }
}
