import api from '../api/axios'
import { MarketItem } from '../features/marketplace/types'

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

const ITEM_BASE = '/items/'

const itemApi = {
  list: async (params = {}) => {
    const { data } = await api.get<PaginatedResponse<MarketItem>>(ITEM_BASE, { params })
    return data
  },
  retrieve: async (id: string | number) => {
    const { data } = await api.get<{ data: MarketItem }>(`${ITEM_BASE}${id}/`)
    return data.data || data
  },
  create: async (payload: FormData) => {
    const { data } = await api.post(ITEM_BASE, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
    return data
  },
  update: async (id: string | number, payload: FormData | object) => {
    const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    const { data } = await api.patch(`${ITEM_BASE}${id}/`, payload, config)
    return data
  },
  destroy: async (id: string | number) => {
    const { data } = await api.delete(`${ITEM_BASE}${id}/`)
    return data
  },
  archive: async (id: string | number) => {
    const { data } = await api.post(`${ITEM_BASE}${id}/archive/`)
    return data
  },
  images: async (form: FormData, onUploadProgress?: (progressEvent: ProgressEvent) => void) => {
    const { data } = await api.post('/items/images/', form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress })
    return data
  },
  deleteImage: async (id: number) => {
    const { data } = await api.delete(`/items/images/${id}/`)
    return data
  },
  categories: async () => {
    const { data } = await api.get('/items/categories/')
    return data
  },
  tags: async () => {
    const { data } = await api.get('/items/tags/')
    return data
  },
}

export default itemApi
