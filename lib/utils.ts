import { WishlistItem, SortOption } from '@/types'

export function extractPriceFromText(text: string): number | null {
  // Try to find price patterns like $99.99, $99, 99.99, etc.
  const pricePatterns = [
    /\$[\d,]+\.?\d*/g, // $99.99 or $99
    /[\d,]+\.\d{2}/g, // 99.99
    /[\d,]+/g, // 99
  ]

  for (const pattern of pricePatterns) {
    const matches = text.match(pattern)
    if (matches && matches.length > 0) {
      // Get the first match and clean it
      const priceStr = matches[0].replace(/[$,]/g, '')
      const price = parseFloat(priceStr)
      if (!isNaN(price) && price > 0) {
        return price
      }
    }
  }

  return null
}

export async function fetchUrlMetadata(url: string): Promise<{
  title?: string
  price?: number
  thumbnail?: string
}> {
  try {
    // For client-side, we'll use a proxy approach or direct fetch
    // Note: CORS may limit this, so we'll also allow manual input
    const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
  }

  return {}
}

export function sortItems(items: WishlistItem[], sortBy: SortOption): WishlistItem[] {
  const sorted = [...items]

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = a.manualPrice ?? a.price ?? Infinity
        const priceB = b.manualPrice ?? b.price ?? Infinity
        return priceA - priceB
      })

    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = a.manualPrice ?? a.price ?? Infinity
        const priceB = b.manualPrice ?? b.price ?? Infinity
        return priceB - priceA
      })

    case 'alphabetical':
      return sorted.sort((a, b) => {
        const titleA = a.title?.toLowerCase() ?? ''
        const titleB = b.title?.toLowerCase() ?? ''
        return titleA.localeCompare(titleB)
      })

    case 'completion':
      return sorted.sort((a, b) => {
        if (a.completed === b.completed) return 0
        return a.completed ? 1 : -1
      })

    case 'track':
      return sorted.sort((a, b) => a.trackId.localeCompare(b.trackId))

    default:
      return sorted
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

