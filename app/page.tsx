'use client'

import { useState, useEffect } from 'react'
import { Track, WishlistItem } from '@/types'
import { storage } from '@/lib/storage'
import { generateId } from '@/lib/utils'
import TrackCard from '@/components/TrackCard'
import Link from 'next/link'

// Completion Pie Chart Component
function CompletionPieChart({ items }: { items: WishlistItem[] }) {
  const totalItems = items.length
  const completedItems = items.filter((item) => item.completed).length
  const pendingItems = totalItems - completedItems
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  // Calculate for SVG pie chart
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const completedOffset = circumference - (completionPercentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 mb-4">
        <svg className="transform -rotate-90" width="160" height="160" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            className="dark:stroke-gray-700"
          />
          {/* Completed progress */}
          {completedItems > 0 && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#86efac"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={completedOffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(completionPercentage)}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Complete
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-300"></div>
          <span className="text-gray-700 dark:text-gray-300">
            {completedItems} Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
          <span className="text-gray-700 dark:text-gray-300">
            {pendingItems} Pending
          </span>
        </div>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">⭐</span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              My WishList
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your goals and dreams across different categories
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Combined Goals Widget */}
          <div className="bg-pink-50 dark:bg-gray-800 rounded-xl p-6 shadow-md border border-pink-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Goals
              </h2>
            </div>
            {items.filter((item) => item.goal && item.goal.trim() !== '' && !item.completed).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No active goals. Add goals to your items to track your progress!
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items
                  .filter((item) => item.goal && item.goal.trim() !== '' && !item.completed)
                  .map((item) => {
                    const track = tracks.find((t) => t.id === item.trackId)
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg border-2 bg-white border-pink-200 dark:bg-gray-700 dark:border-gray-600 flex items-center justify-start gap-3 min-h-[80px]"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.goal || 'Goal'}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <p className="text-xl font-medium text-pink-600 dark:text-pink-400 text-left flex-1" style={{ fontFamily: "'Fredoka One', cursive" }}>
                          {item.goal}
                        </p>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Completion Tracker Widget */}
          {items.length > 0 && (
            <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-6 shadow-md border border-blue-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <span className="text-2xl">📊</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Progress Tracker
                </h2>
              </div>
              <CompletionPieChart items={items} />
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {!showNewTrackInput ? (
              <button
                onClick={() => setShowNewTrackInput(true)}
                className="px-6 py-3 bg-green-200 hover:bg-green-300 text-green-800 rounded-lg font-medium transition-colors"
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
                  className="px-6 py-2 bg-green-200 hover:bg-green-300 text-green-800 rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewTrackInput(false)
                    setNewTrackName('')
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <Link
            href="/all-items"
            className="px-6 py-3 bg-purple-200 hover:bg-purple-300 text-purple-800 rounded-lg font-medium transition-colors"
          >
            View All Items
          </Link>
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

