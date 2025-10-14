import { getAuthHeader, isAuthenticated, clearAuthTokens } from './auth'

export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean
  baseURL?: string
}

/**
 * Enhanced fetch function that automatically handles authentication
 */
export const apiClient = async (
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const {
    requireAuth = false,
    baseURL = '',
    headers = {},
    ...fetchOptions
  } = options

  // Construct full URL
  const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`

  // Prepare headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers
  }

  // Add authentication header if required or available
  if (requireAuth || isAuthenticated()) {
    const authHeaders = getAuthHeader()
    Object.assign(requestHeaders, authHeaders)
  }

  // If auth is required but user is not authenticated, throw error
  if (requireAuth && !isAuthenticated()) {
    throw new Error('Authentication required but user is not logged in')
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders
    })

    // Handle 401 Unauthorized - clear tokens and redirect to login
    if (response.status === 401) {
      clearAuthTokens()
      // You might want to trigger a redirect to login page here
      // or emit an event that your app can listen to
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      throw new Error('Authentication expired. Please log in again.')
    }

    return response
  } catch (error) {
    // Re-throw the error for the caller to handle
    throw error
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: (endpoint: string, options: ApiRequestOptions = {}) =>
    apiClient(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, data?: unknown, options: ApiRequestOptions = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),

  put: (endpoint: string, data?: unknown, options: ApiRequestOptions = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),

  patch: (endpoint: string, data?: unknown, options: ApiRequestOptions = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: (endpoint: string, options: ApiRequestOptions = {}) =>
    apiClient(endpoint, { ...options, method: 'DELETE' })
}

/**
 * Helper function to handle API responses with JSON parsing
 */
export const handleApiResponse = async <T = unknown>(
  response: Response
): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // If JSON parsing fails, use default message
    }
    
    throw new Error(errorMessage)
  }

  try {
    return await response.json() as T
  } catch {
    // If no JSON body, return empty object
    return {} as T
  }
}

/**
 * Complete API call with automatic error handling and JSON parsing
 */
export const apiCall = async <T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const response = await apiClient(endpoint, options)
  return handleApiResponse<T>(response)
}