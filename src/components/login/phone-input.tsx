"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronsUpDown, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Philippine telcos
const telcos = [
  {
    value: "globe",
    label: "Globe",
    prefix: "0917",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#0064D2" />
        <path
          d="M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M18 8C18 9.10457 17.1046 10 16 10C14.8954 10 14 9.10457 14 8C14 6.89543 14.8954 6 16 6C17.1046 6 18 6.89543 18 8Z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    value: "smart",
    label: "Smart",
    prefix: "0918",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0F9347" />
        <path d="M6 12H18M6 8H18M6 16H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "dito",
    label: "DITO",
    prefix: "0895",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="#E20714" />
        <path
          d="M8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: "sun",
    label: "Sun Cellular",
    prefix: "0922",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#FDB913" />
        <circle cx="12" cy="12" r="5" fill="#FDB913" stroke="#ED1C24" strokeWidth="2" />
        <path d="M17 7L19 5M5 19L7 17M5 5L7 7M17 17L19 19" stroke="#ED1C24" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "tnt",
    label: "TNT",
    prefix: "0907",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#0033A0" />
        <path d="M7 8H17M12 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "tm",
    label: "TM",
    prefix: "0905",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#00AEEF" />
        <path d="M7 8H17M9 8V16M15 8V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function PhoneInput() {
  const [open, setOpen] = useState(false)
  const [selectedTelco, setSelectedTelco] = useState(telcos[0])
  const [phoneNumber, setPhoneNumber] = useState("")

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^\d]/g, "")

    // Limit to 7 digits (plus the 4-digit prefix = 11 digits total)
    if (value.length <= 7) {
      setPhoneNumber(value)
    }
  }

  return (
    <div className="flex space-x-2">
      <div className="w-1/3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-center gap-2">
                {selectedTelco.icon}
                <span>{selectedTelco.label}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search telco..." />
              <CommandList>
                <CommandEmpty>No telco found.</CommandEmpty>
                <CommandGroup>
                  {telcos.map((telco) => (
                    <CommandItem
                      key={telco.value}
                      value={telco.value}
                      onSelect={() => {
                        setSelectedTelco(telco)
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn("h-4 w-4", selectedTelco.value === telco.value ? "opacity-100" : "opacity-0")}
                        />
                        {telco.icon}
                        {telco.label}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-2/3 relative">
        <div className="flex">
          <div className="bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-200 dark:border-zinc-700 rounded-l-md px-2 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              {selectedTelco.icon}
              <Phone size={14} className="text-zinc-400" />
            </div>
            {selectedTelco.prefix}
          </div>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className="rounded-l-none pl-2"
            placeholder="1234567"
            required
          />
        </div>
        <p className="text-xs text-zinc-500 mt-1">Format: {selectedTelco.prefix} + 7 digits</p>
      </div>
    </div>
  )
}
