import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

type Category = 'all' | 'professional' | 'personal'

interface Interest {
  label: string
  emoji: string
  category: 'professional' | 'personal'
}

const INTERESTS: Interest[] = [
  // Professional
  { label: "Frontend Development", emoji: "💻", category: "professional" },
  { label: "Component Design", emoji: "🧩", category: "professional" },
  { label: "Design Systems", emoji: "📐", category: "professional" },
  { label: "UI/UX Design", emoji: "🎨", category: "professional" },
  { label: "User-Centred Design", emoji: "👤", category: "professional" },
  { label: "Delightful UX", emoji: "💫", category: "professional" },
  { label: "Making Things Fun", emoji: "🎉", category: "professional" },
  { label: "Micro-interactions", emoji: "✨", category: "professional" },
  { label: "Animation", emoji: "🎬", category: "professional" },
  { label: "Colour Theory", emoji: "🎨", category: "professional" },
  { label: "Typography", emoji: "🖋️", category: "professional" },
  { label: "Data Visualisation", emoji: "📊", category: "professional" },
  { label: "App Development", emoji: "📱", category: "professional" },
  { label: "Figma", emoji: "🖼️", category: "professional" },
  { label: "TanStack", emoji: "🗂️", category: "professional" },
  { label: "AI Tools", emoji: "🤖", category: "professional" },
  { label: "Documentation", emoji: "📝", category: "professional" },

  // Personal
  { label: "Baldur's Gate 3", emoji: "🎲", category: "personal" },
  { label: "Cats", emoji: "🐱", category: "personal" },
  { label: "Coffee", emoji: "☕", category: "personal" },
  { label: "Cooking", emoji: "🍳", category: "personal" },
  { label: "Dungeons & Dragons", emoji: "🐉", category: "personal" },
  { label: "Fashion", emoji: "👠", category: "personal" },
  { label: "Gorillaz", emoji: "🎵", category: "personal" },
  { label: "Horror Games", emoji: "👾", category: "personal" },
  { label: "Interior Decor", emoji: "🛋️", category: "personal" },
  { label: "Japan", emoji: "🗾", category: "personal" },
  { label: "Lana Del Rey", emoji: "🌹", category: "personal" },
  { label: "Photography", emoji: "📷", category: "personal" },
  { label: "Resident Evil", emoji: "🧟", category: "personal" },
  { label: "Romantasy Books", emoji: "📚", category: "personal" },
  { label: "Silent Hill", emoji: "🌫️", category: "personal" },
  { label: "Sourdough Baking", emoji: "🍞", category: "personal" },
  { label: "Space", emoji: "🚀", category: "personal" },
  { label: "Taylor Swift", emoji: "🤍", category: "personal" },
  { label: "The Last of Us", emoji: "🍄", category: "personal" },
];

const FILTERS: { label: string; value: Category }[] = [
  { label: 'All',          value: 'all' },
  { label: 'Professional', value: 'professional' },
  { label: 'Personal',     value: 'personal' },
]

export function Interests() {
  const [active, setActive] = useState<Category>('all')

  const filtered = INTERESTS.filter((i) =>
    active === "all" ? true : i.category === active,
  ).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-5">
      {/* Filter pills */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`
              px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase
              transition-all duration-200 border
              ${active === f.value
                ? 'bg-accent text-neutral-950 border-accent'
                : 'border-accent text-accent hover:bg-accent-soft'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interest badges */}
      <div className="flex flex-wrap gap-2">
        {filtered.map(interest => (
          <Badge
            key={interest.label}
            variant="outline"
            className="border-accent text-accent bg-accent-soft px-3 py-1 text-xs font-body gap-1.5 cursor-default"
          >
            <span>{interest.emoji}</span>
            {interest.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
