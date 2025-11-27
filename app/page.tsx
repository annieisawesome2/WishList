'use client'

import { useState, useEffect } from 'react'
import { Track, WishlistItem } from '@/types'
import { storage } from '@/lib/storage'
import { generateId } from '@/lib/utils'
import TrackCard from '@/components/TrackCard'
import Link from 'next/link'

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [items, setItems] = useState<WishlistItem[]>([])
  const [newTrackName, setNewTrackName] = useState('')
  const [showNewTrackInput, setShowNewTrackInput] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setTracks(storage.getTracks())
    setItems(storage.getItems())
  }

  const createTrack = () => {
    if (!newTrackName.trim()) return

    const newTrack: Track = {
      id: generateId(),
      name: newTrackName.trim(),
      createdAt: Date.now(),
    }

    const updatedTracks = [...tracks, newTrack]
    setTracks(updatedTracks)
    storage.saveTracks(updatedTracks)
    setNewTrackName('')
    setShowNewTrackInput(false)
  }

  const deleteTrack = (trackId: string) => {
    const updatedTracks = tracks.filter((t) => t.id !== trackId)
    const updatedItems = items.filter((i) => i.trackId !== trackId)
    setTracks(updatedTracks)
    setItems(updatedItems)
    storage.saveTracks(updatedTracks)
    storage.saveItems(updatedItems)
  }

  const getItemCount = (trackId: string) => {
    return items.filter((item) => item.trackId === trackId).length
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My WishList
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your goals and dreams across different categories
          </p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/all-items"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            View All Items
          </Link>
        </div>

        <div className="mb-6">
          {!showNewTrackInput ? (
            <button
              onClick={() => setShowNewTrackInput(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              + Create New Track
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Track name (e.g., Fitness, Academics, Makeup...)"
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTrack()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <button
                onClick={createTrack}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewTrackInput(false)
                  setNewTrackName('')
                }}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No tracks yet. Create your first track to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                itemCount={getItemCount(track.id)}
                onDelete={deleteTrack}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

