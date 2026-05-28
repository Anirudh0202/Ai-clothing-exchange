export interface MarketItem {
  id: number
  title: string
  description: string
  price: number
  image?: string
  condition?: string
  owner?: {
    id: number
    username: string
  }
}
