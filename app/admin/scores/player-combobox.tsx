"use client"

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { TeamMember } from "@/lib/types"

interface PlayerComboboxProps {
  players: TeamMember[]
  value: string
  onChange: (id: string) => void
  excludeId?: string
  placeholder?: string
}

export function PlayerCombobox({
  players,
  value,
  onChange,
  excludeId,
  placeholder = "Select player…",
}: PlayerComboboxProps) {
  const [open, setOpen] = useState(false)

  const available = players.filter((p) => p.id !== excludeId)
  const selected = players.find((p) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none",
          "hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring transition-colors",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selected ? (
            <>
              {selected.full_name}
              {selected.short_label && (
                <span className="text-muted-foreground ml-2 text-xs">
                  · {selected.short_label}
                </span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search player…" />
          <CommandList>
            <CommandEmpty>No players found.</CommandEmpty>
            <CommandGroup>
              {available.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.full_name} ${p.short_label ?? ""}`}
                  data-checked={value === p.id}
                  onSelect={() => {
                    onChange(p.id)
                    setOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{p.full_name}</p>
                    {p.short_label && (
                      <p className="text-xs text-muted-foreground">{p.short_label}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
