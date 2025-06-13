"use client"

import { AlertTriangle } from "lucide-react"

interface ErrorRideProps {
  error: string
}

export function ErrorRide({ error }: ErrorRideProps) {
  return (
    <div className="p-4 mb-2">
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-700 dark:text-red-300">Location Error</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        </div>
      </div>
    </div>
  )
}
