export interface WishlistItem {
  id: string
  trackId: string
  image?: string // base64 or URL
  link: string
  title?: string
  price?: number
  thumbnail?: string
  goal?: string
  completed: boolean
  createdAt: number
  manualPrice?: number // User-input price if URL extraction fails
}

export interface Track {
  id: string
  name: string
  color?: string
  createdAt: number
}

export type SortOption = 'price-asc' | 'price-desc' | 'alphabetical' | 'completion' | 'track'

export interface PresetGoal {
  id: string
  text: string
  trackType?: string
}

