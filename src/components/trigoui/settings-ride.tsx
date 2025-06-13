"use client"

import { CreditCard, Users, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RideSettings {
  rideType: string
  paymentMethod: string
  priority: string
  passengers: string
  toda: string
}

interface SettingsRideProps {
  settings: RideSettings
  onSettingsChange: (settings: RideSettings) => void
}

export function SettingsRide({ settings, onSettingsChange }: SettingsRideProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label className="text-sm text-zinc-500">Ride Type</Label>
        <RadioGroup
          value={settings.rideType}
          onValueChange={(value) => onSettingsChange({ ...settings, rideType: value })}
          className="flex gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tricycle" id="tricycle" />
            <Label htmlFor="tricycle" className="text-sm cursor-pointer">
              Tricycle
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="motorcycle" id="motorcycle" />
            <Label htmlFor="motorcycle" className="text-sm cursor-pointer">
              Motorcycle
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-500 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Payment Method
        </Label>
        <RadioGroup
          value={settings.paymentMethod}
          onValueChange={(value) => onSettingsChange({ ...settings, paymentMethod: value })}
          className="flex gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cash" id="cash" />
            <Label htmlFor="cash" className="text-sm cursor-pointer">
              Cash
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gcash" id="gcash" />
            <Label htmlFor="gcash" className="text-sm cursor-pointer">
              GCash
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-zinc-500 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Priority
        </Label>
        <RadioGroup
          value={settings.priority}
          onValueChange={(value) => onSettingsChange({ ...settings, priority: value })}
          className="flex gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard" className="text-sm cursor-pointer">
              Standard
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="priority" id="priority" />
            <Label htmlFor="priority" className="text-sm cursor-pointer">
              Priority
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="passengers" className="text-sm text-zinc-500 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Passengers
        </Label>
        <Select
          value={settings.passengers}
          onValueChange={(value) => onSettingsChange({ ...settings, passengers: value })}
        >
          <SelectTrigger className="w-full bg-zinc-100 dark:bg-zinc-800 border-0">
            <SelectValue placeholder="Select number of passengers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Passenger</SelectItem>
            <SelectItem value="2">2 Passengers</SelectItem>
            <SelectItem value="3">3 Passengers</SelectItem>
            <SelectItem value="4">4 Passengers</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
