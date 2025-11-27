'use client'

import { useState, useRef, DragEvent } from 'react'
import { WishlistItem } from '@/types'
import { generateId } from '@/lib/utils'
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
  const [priceInput, setPriceInput] = useState<string>(item?.manualPrice ?? item?.price ? String(item.manualPrice ?? item.price) : '')
  const [isPriceFocused, setIsPriceFocused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const priceInputRef = useRef<HTMLInputElement>(null)
  const goalInputRef = useRef<HTMLInputElement>(null)

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
      // Only auto-save for existing items, not new ones
      if (item) {
        saveItem()
      }
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
          // Don't auto-fill price - let user enter manually to avoid incorrect values
          // if (data.price) setPrice(data.price)
          if (data.thumbnail && !image) setImage(data.thumbnail)
        }
      } catch (error) {
        console.error('Error fetching metadata:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Only auto-save for existing items, not new ones
    if (item) {
      saveItem()
    }
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
      // Update the item's completed status
      const updatedItem: WishlistItem = {
        ...item,
        completed: true,
      }
      onSave(updatedItem)
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
    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-3 hover:shadow-lg transition-shadow">
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
        <div className="mb-1 min-h-[20px]">
          {title ? (
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {title}
            </div>
          ) : (
            <div className="text-sm font-medium text-transparent">Placeholder</div>
          )}
        </div>
        <input
          type="url"
          placeholder="Paste URL here..."
          value={link}
          onChange={(e) => handleLinkChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && (
          <div className="mt-1 text-xs text-gray-500">Loading...</div>
        )}
      </div>

      {/* Goal Field */}
      <div className="flex-[0.8] min-w-0">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Goal
        </label>
        <input
          ref={goalInputRef}
          type="text"
          placeholder="Goal (optional)"
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value)
            // Don't save while typing - only on blur or Enter
          }}
          onBlur={() => {
            // Only auto-save for existing items, not new ones
            if (item) {
              saveItem()
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              goalInputRef.current?.blur()
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Price Field */}
      <div className="flex-shrink-0">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Price
        </label>
        {!isPriceFocused && price !== undefined ? (
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
              ${price.toFixed(2)}
            </div>
            <button
              onClick={() => {
                setIsPriceFocused(true)
                setPriceInput(price.toFixed(2))
                setTimeout(() => priceInputRef.current?.focus(), 0)
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Edit price"
            >
              ✏️
            </button>
          </div>
        ) : (
          <input
            ref={priceInputRef}
            type="text"
            placeholder="Price ($)"
            value={priceInput}
            onChange={(e) => {
              const value = e.target.value
              // Allow empty string, numbers, and one decimal point
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setPriceInput(value)
                // Don't update price or save while typing - only on blur
              }
            }}
            onFocus={() => {
              setIsPriceFocused(true)
            }}
            onBlur={() => {
              setIsPriceFocused(false)
              // When user finishes typing, parse and format the price
              const numValue = parseFloat(priceInput)
              if (!isNaN(numValue) && priceInput.trim() !== '') {
                const finalPrice = numValue
                setPrice(finalPrice)
                setPriceInput(finalPrice.toFixed(2))
                // Only auto-save for existing items, not new ones
                if (item) {
                  saveItem()
                }
              } else {
                setPrice(undefined)
                setPriceInput('')
                // Only auto-save for existing items, not new ones
                if (item) {
                  saveItem()
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                priceInputRef.current?.blur()
              }
            }}
            className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Complete Button / Save Button */}
      <div className="flex-shrink-0 flex gap-2">
        {!item ? (
          // Save button for new items
          <button
            onClick={saveItem}
            disabled={!link.trim()}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              !link.trim()
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-green-200 hover:bg-green-300 text-green-800'
            }`}
          >
            Save
          </button>
        ) : (
          <>
            <button
              onClick={handleComplete}
              disabled={item.completed}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                item.completed
                  ? 'bg-green-200 text-green-800 cursor-not-allowed'
                  : 'bg-blue-200 hover:bg-blue-300 text-blue-800'
              }`}
            >
              {item.completed ? '✓ Completed' : 'Complete'}
            </button>
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md font-medium bg-pink-200 hover:bg-pink-300 text-pink-800 transition-colors"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

