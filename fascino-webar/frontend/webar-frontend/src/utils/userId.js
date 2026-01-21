// Generate or retrieve userId from localStorage
export function getOrCreateUserId() {
  const STORAGE_KEY = 'webar_userId'
  
  let userId = localStorage.getItem(STORAGE_KEY)
  
  if (!userId) {
    // Generate UUID v4
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    localStorage.setItem(STORAGE_KEY, userId)
  }
  
  return userId
}



