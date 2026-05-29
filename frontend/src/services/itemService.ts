import api from '../api/axios'
import { ITEM_ENDPOINTS } from '../api/endpoints'
import { MarketItem } from '../features/marketplace/types'

type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

const itemService = {
  fetchMarketplace: async () => {
    const { data } = await api.get<PaginatedResponse<MarketItem>>(ITEM_ENDPOINTS.marketplace)
    return data.results
  },
  fetchItemDetail: async (id: string) => {
    const { data } = await api.get<MarketItem>(ITEM_ENDPOINTS.details(id))
    return data
  },
  fetchItemRecommendations: async (id: string | number) => {
    const { data } = await api.get<MarketItem[]>(ITEM_ENDPOINTS.recommendations(String(id)))
    return data
  },
}

export default itemService
