# WishList - Goal & Dream Tracker

A flexible wishlist and goal tracker application where users can create custom tracks (Fitness, Academics, Healthy Eating, Makeup, etc.) and track items with images, links, goals, and completion status.

## Features

### 🎯 Core Structure
- **Unlimited Custom Tracks**: Create tracks like Fitness, Academics, Healthy Eating, Makeup, Clothes, Tech, Lifestyle, Travel, Gifts, etc.
- Each track contains its own wishlist items

### 📦 Item Row Layout
Each item is displayed as a horizontal card with:
- **Image Box** (left): Drag & drop or upload item images
- **Link Field** (middle): Paste URLs - automatically fetches title, price, and thumbnail
- **Goal Field** (optional): Text input or choose from preset goals based on track
- **Complete Button** (right): Mark items as completed with confetti animation

### 🧠 Ranking System
- **Primary Sort**: Price (ascending/descending)
- Additional sorting options:
  - Alphabetical
  - Completion status
  - Track
- **Global Sort**: "All Items" view shows everything ranked by price

### 🔍 Viewing Modes
1. **Track View**: Shows items within a specific track, sorted by price
2. **All-Items View**: Combines all items across tracks with global price ranking

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Canvas Confetti** - Completion animations
- **Local Storage** - Data persistence

## Usage

1. **Create Tracks**: Click "Create New Track" and enter a name
2. **Add Items**: Click on a track to open it, then add items using the item row
3. **Upload Images**: Drag & drop images or click the image box to upload
4. **Add Links**: Paste URLs to automatically fetch product information
5. **Set Goals**: Type custom goals or choose from preset goals
6. **Complete Items**: Click the "Complete" button to mark items as done
7. **View All Items**: Use the "View All Items" page to see everything across all tracks

## Data Storage

All data is stored locally in your browser using LocalStorage. Your tracks and items persist between sessions.

## License

ISC
