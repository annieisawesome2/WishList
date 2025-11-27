'use client'

import { useState, useRef, DragEvent, useEffect } from 'react'
import { WishlistItem } from '@/types'
import { generateId } from '@/lib/utils'
import { getPresetGoalsForTrack } from '@/lib/presetGoals'
import { storage } from '@/lib/storage'
import confetti from 'canvas-confetti'

interface ItemRowProps {
  item?: WishlistItem
  trackId: string
  trackName?: string
  onSave: (item: WishlistItem) => void
  onDelete?: (itemId: string) => void
  onComplete: (itemId: string) => void
}

export default function ItemRow({ item, trackId, trackName, onSave, onDelete, onComplete }: ItemRowProps) {
  const [image, setImage] = useState<string | undefined>(item?.image)
  const [link, setLink] = useState(item?.link || '')
  const [goal, setGoal] = useState(item?.goal || '')
  const [title, setTitle] = useState(item?.title || '')
  const [price, setPrice] = useState<number | undefined>(item?.manualPrice ?? item?.price)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPresetGoals, setShowPresetGoals] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const goalRef = useRef<HTMLDivElement>(null)
  
  const resolvedTrackName = trackName || (typeof window !== 'undefined' ? storage.getTracks().find((t) => t.id === trackId)?.name || '' : '')
  const presetGoals = getPresetGoalsForTrack(resolvedTrackName)

  // Close preset goals dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (goalRef.current && !goalRef.current.contains(event.target as Node)) {
        setShowPresetGoals(false)
      }
    }

    if (showPresetGoals) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPresetGoals])

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
      saveItem()
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleLinkChange = async (newLink: string) => {
    setLink(newLink)
    
    if (newLink && isValidUrl(newLink)) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/metadata?url=${encodeURIComponent(newLink)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.title) setTitle(data.title)
          if (data.price) setPrice(data.price)
          if (data.thumbnail && !image) setImage(data.thumbnail)
        }
      } catch (error) {
        console.error('Error fetching metadata:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    saveItem()
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const saveItem = () => {
    const itemData: WishlistItem = {
      id: item?.id || generateId(),
      trackId,
      image,
      link,
      goal: goal || undefined,
      title: title || undefined,
      price,
      manualPrice: price,
      completed: item?.completed || false,
      createdAt: item?.createdAt || Date.now(),
    }
    onSave(itemData)
  }

  const handleComplete = () => {
    if (item) {
      onComplete(item.id)
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-3 hover:shadow-lg transition-shadow">
      {/* Image Box */}
      <div
        className={`flex-shrink-0 w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <img
            src={image}
            alt="Item"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-400 text-xs text-center p-2">
            Drop image or click
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Link Field */}
      <div className="flex-1 min-w-0">
        <input
          type="url"
          placeholder="Paste URL here..."
          value={link}
          onChange={(e) => handleLinkChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {title && (
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
            {title}
          </div>
        )}
        <div className="mt-1 flex items-center gap-2">
          {price !== undefined ? (
            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
              ${price.toFixed(2)}
            </div>
          ) : (
            <input
              type="number"
              placeholder="Price ($)"
              step="0.01"
              min="0"
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                setPrice(isNaN(value) ? undefined : value)
                saveItem()
              }}
              className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
          {price !== undefined && (
            <button
              onClick={() => {
                setPrice(undefined)
                saveItem()
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Edit price"
            >
              ✏️
            </button>
          )}
        </div>
        {isLoading && (
          <div className="mt-1 text-xs text-gray-500">Loading...</div>
        )}
      </div>

      {/* Goal Field */}
      <div ref={goalRef} className="flex-1 min-w-0 relative">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Goal (optional)"
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value)
              saveItem()
            }}
            onFocus={() => setShowPresetGoals(true)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {presetGoals.length > 0 && (
            <button
              onClick={() => setShowPresetGoals(!showPresetGoals)}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md text-sm"
              title="Show preset goals"
            >
              📋
            </button>
          )}
        </div>
        {showPresetGoals && presetGoals.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {presetGoals.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setGoal(preset.text)
                  setShowPresetGoals(false)
                  saveItem()
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
              >
                {preset.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Complete Button */}
      <div className="flex-shrink-0 flex gap-2">
        {item && (
          <button
            onClick={handleComplete}
            disabled={item.completed}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              item.completed
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {item.completed ? '✓ Completed' : 'Complete'}
          </button>
        )}
        {item && onDelete && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

