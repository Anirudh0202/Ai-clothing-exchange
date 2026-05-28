import api from '../api/axios'
import { ITEM_ENDPOINTS } from '../api/endpoints'
import { MarketItem } from '../features/marketplace/types'

const itemService = {
  fetchMarketplace: async () => {
    const { data } = await api.get<MarketItem[]>(ITEM_ENDPOINTS.marketplace)
    return data
  },
  fetchItemDetail: async (id: string) => {
    const { data } = await api.get<MarketItem>(ITEM_ENDPOINTS.details(id))
    return data
  },
}

export default itemService
