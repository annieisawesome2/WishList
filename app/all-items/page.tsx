'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Track, WishlistItem, SortOption } from '@/types'
import { storage } from '@/lib/storage'
import { sortItems } from '@/lib/utils'
import ItemRow from '@/components/ItemRow'
import SortControls from '@/components/SortControls'

export default function AllItemsPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('price-asc')
  const [selectedTrack, setSelectedTrack] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setItems(storage.getItems())
    setTracks(storage.getTracks())
  }

  const handleSaveItem = (item: WishlistItem) => {
    const allItems = storage.getItems()
    const existingIndex = allItems.findIndex((i) => i.id === item.id)
    
    if (existingIndex >= 0) {
      allItems[existingIndex] = item
    } else {
      allItems.push(item)
    }

    storage.saveItems(allItems)
    loadData()
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

  const filteredItems = selectedTrack === 'all' 
    ? items 
    : items.filter((item) => item.trackId === selectedTrack)

  const sortedItems = sortItems(filteredItems, sortBy)

  const getTrackName = (trackId: string) => {
    return tracks.find((t) => t.id === trackId)?.name || 'Unknown Track'
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            All Items
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all wishlist items across all tracks, sorted by price
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4 flex-wrap">
          <SortControls sortBy={sortBy} onSortChange={setSortBy} />
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by track:
            </label>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tracks</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sortedItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No items found. {selectedTrack !== 'all' && 'Try selecting a different track or add items to tracks.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div key={item.id} className="relative">
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                  {getTrackName(item.trackId)}
                </div>
                <ItemRow
                  item={item}
                  trackId={item.trackId}
                  trackName={getTrackName(item.trackId)}
                  onSave={handleSaveItem}
                  onDelete={handleDeleteItem}
                  onComplete={handleCompleteItem}
                />
              </div>
            ))}
          </div>
        )}

        {sortedItems.length > 0 && (
          <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Summary
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Total Items: {sortedItems.length}</p>
              <p>
                Completed: {sortedItems.filter((i) => i.completed).length} / {sortedItems.length}
              </p>
              <p>
                Total Value: $
                {sortedItems
                  .reduce((sum, item) => sum + (item.manualPrice ?? item.price ?? 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

