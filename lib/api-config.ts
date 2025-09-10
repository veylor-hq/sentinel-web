export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.1.193:8001",

  endpoints: {
    login: "/api/public/auth/signin/",
    register: "/api/public/auth/signup/",
    dashboard: "/api/private/dashboard/",
  },
}

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseUrl}${endpoint}`
}
