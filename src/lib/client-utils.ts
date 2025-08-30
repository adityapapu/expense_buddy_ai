/**
 * Safely check if code is running in browser environment
 */
export const isBrowser = () => {
  return typeof window !== "undefined"
}

/**
 * Safely get window width with a fallback value
 */
export const getWindowWidth = (fallback = 1024) => {
  return isBrowser() ? window.innerWidth : fallback
}

/**
 * Safely get window height with a fallback value
 */
export const getWindowHeight = (fallback = 768) => {
  return isBrowser() ? window.innerHeight : fallback
}

/**
 * Check if viewport is mobile sized
 */
export const isMobileViewport = (breakpoint = 768) => {
  return isBrowser() ? window.innerWidth < breakpoint : false
}

