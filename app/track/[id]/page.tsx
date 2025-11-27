'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Track, WishlistItem, SortOption } from '@/types'
import { storage } from '@/lib/storage'
import { sortItems } from '@/lib/utils'
import ItemRow from '@/components/ItemRow'
import SortControls from '@/components/SortControls'

export default function TrackPage() {
  const params = useParams()
  const router = useRouter()
  const trackId = params.id as string

  const [track, setTrack] = useState<Track | null>(null)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('price-asc')
  const [showAddItem, setShowAddItem] = useState(false)

  useEffect(() => {
    loadData()
  }, [trackId])

  const loadData = () => {
    const tracks = storage.getTracks()
    const foundTrack = tracks.find((t) => t.id === trackId)
    
    if (!foundTrack) {
      router.push('/')
      return
    }

    setTrack(foundTrack)
    const allItems = storage.getItems()
    const trackItems = allItems.filter((item) => item.trackId === trackId)
    setItems(trackItems)
  }

  const handleSaveItem = (item: WishlistItem) => {
    const allItems = storage.getItems()
    const existingIndex = allItems.findIndex((i) => i.id === item.id)
    const isNewItem = existingIndex === -1
    
    if (existingIndex >= 0) {
      allItems[existingIndex] = item
    } else {
      allItems.push(item)
    }

    storage.saveItems(allItems)
    loadData()
    
    // Hide the add item form after saving a new item with a link
    if (isNewItem && item.link) {
      setShowAddItem(false)
    }
  }

  const handleDeleteItem = (itemId: string) => {
    const allItems = storage.getItems()
    const updatedItems = allItems.filter((i) => i.id !== itemId)
    storage.saveItems(updatedItems)
    loadData()
  }

  const handleCompleteItem = (itemId: string) => {
    const allItems = storage.getItems()
    const item = allItems.find((i) => i.id === itemId)
    if (item) {
      item.completed = true
      storage.saveItems(allItems)
      loadData()
    }
  }

  const sortedItems = sortItems(items, sortBy)

  if (!track) {
    return <div className="min-h-screen p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Tracks
          </button>
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {track.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        <div className="mb-6 mt-6 flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="px-6 py-3 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg font-medium transition-colors shadow-md"
          >
            {showAddItem ? '− Hide Add Item' : '+ Add Item'}
          </button>
          <SortControls sortBy={sortBy} onSortChange={setSortBy} />
        </div>

        {showAddItem && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Item</h3>
            </div>
            <ItemRow
              trackId={trackId}
              trackName={track.name}
              onSave={handleSaveItem}
              onComplete={handleCompleteItem}
            />
          </div>
        )}

        {sortedItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No items yet. Add your first item above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                trackId={trackId}
                trackName={track.name}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                onComplete={handleCompleteItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

