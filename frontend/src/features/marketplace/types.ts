export interface MarketItem {
  id: number
  title: string
  description: string
  brand?: string
  size?: string
  status?: string
  location?: string
  primary_image?: {
    id: number
    image: string
    is_primary: boolean
  } | null
  images?: Array<{
    id: number
    image: string
    is_primary: boolean
  }>
  condition?: string
  category?: {
    id: number
    name: string
    slug: string
  } | null
  tags?: Array<{
    id: number
    name: string
  }>
  owner?: {
    id: number
    username: string
    email?: string
  }
}
