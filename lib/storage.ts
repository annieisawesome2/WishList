import { WishlistItem, Track } from '@/types'

const TRACKS_KEY = 'wishlist_tracks'
const ITEMS_KEY = 'wishlist_items'

export const storage = {
  // Tracks
  getTracks: (): Track[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(TRACKS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveTracks: (tracks: Track[]): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TRACKS_KEY, JSON.stringify(tracks))
  },

  // Items
  getItems: (): WishlistItem[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(ITEMS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveItems: (items: WishlistItem[]): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
  },
}

