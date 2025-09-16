export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://sentinel-api.ihorsavenko.com",

  endpoints: {
    login: "/api/public/auth/signin",
    register: "/api/public/auth/signup",
    dashboard: "/api/private/dashboard/",
    verify_token: "/api/public/auth/verify",
    missions: "/api/private/mission/",
    mission_details: (id: string) => `/api/private/mission/${id}`,
    proceed_step: (missionId: string) => `/api/private/step/proceed/${missionId}`,
  },
}

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseUrl}${endpoint}`
}
