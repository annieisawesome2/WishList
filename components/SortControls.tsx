'use client'

import { SortOption } from '@/types'

interface SortControlsProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

export default function SortControls({ sortBy, onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sort by:
      </label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="price-asc">Price (Low to High)</option>
        <option value="price-desc">Price (High to Low)</option>
        <option value="alphabetical">Alphabetical</option>
        <option value="completion">Completion Status</option>
        <option value="track">Track</option>
      </select>
    </div>
  )
}

