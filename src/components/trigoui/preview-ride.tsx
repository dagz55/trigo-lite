"use client"

import { TriGOLoading } from "@/components/trigoui/trigo-loading"
import { Clock, CreditCard } from "lucide-react"
import type { TODA } from "@/lib/location-utils"

interface PreviewProps {
  isLoading: boolean
  imageUrl: string
  selectedTODA: TODA | null
  destination: string
  fare?: number
  distance?: number
  duration?: number
}

export function Preview({
  isLoading,
  imageUrl,
  selectedTODA,
  destination,
  fare = 75, // Default fare if not calculated
  distance = 3.5, // Default distance
  duration = 12, // Default duration
}: PreviewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <TriGOLoading size={40} showText={true} />
        <p className="text-sm text-zinc-500">Finding available riders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-green-500">
          <img src={imageUrl || "/placeholder.svg"} alt="Driver" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 className="font-medium">Juan dela Cruz</h3>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm">4.8</span>
            <span className="text-xs text-zinc-500">(120 trips)</span>
          </div>
          <p className="text-xs text-zinc-500">Tricycle • ABC-123</p>
        </div>
      </div>

      <div className="p-3 space-y-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Pickup</p>
            <p className="text-sm font-medium">{selectedTODA ? `Near ${selectedTODA.name}` : "Current Location"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Destination</p>
            <p className="text-sm font-medium">
              {destination || (selectedTODA ? `${selectedTODA.name} exit point (labasan)` : "exit point (labasan)")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-700">
          <div className="mt-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">Fare</p>
              <p className="text-sm font-bold">₱{fare.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-zinc-500">
                {distance} km • ~{duration} mins
              </p>
              <p className="text-xs text-zinc-500">Base + Distance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" />
          <span className="text-sm">ETA: {duration} mins</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-zinc-500" />
          <span className="text-sm">Cash</span>
        </div>
      </div>
    </div>
  )
}
