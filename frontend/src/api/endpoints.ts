export const AUTH_ENDPOINTS = {
  login: '/auth/login/',
  register: '/auth/register/',
  logout: '/auth/logout/',
  refresh: '/auth/token/refresh/',
  me: '/auth/me/',
}

export const ITEM_ENDPOINTS = {
  marketplace: '/items/',
  details: (id: string) => `/items/${id}/`,
  recommendations: (id: string) => `/items/${id}/recommendations/`,
}
