'use client'

import { Track } from '@/types'
import Link from 'next/link'

interface TrackCardProps {
  track: Track
  itemCount: number
  onDelete?: (trackId: string) => void
}

export default function TrackCard({ track, itemCount, onDelete }: TrackCardProps) {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  const color = track.color || colors[track.name.length % colors.length]

  return (
    <div className="relative group">
      <Link
        href={`/track/${track.id}`}
        className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
            {track.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {track.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault()
            if (confirm(`Delete track "${track.name}"?`)) {
              onDelete(track.id)
            }
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-pink-200 hover:bg-pink-300 text-pink-800 text-xs rounded"
        >
          ×
        </button>
      )}
    </div>
  )
}

