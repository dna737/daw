"use client"

import * as React from "react"
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Checked = DropdownMenuCheckboxItemProps["checked"]

export default function Filters() {
  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true)
  const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false)
  const [showPanel, setShowPanel] = React.useState<Checked>(false)

  const dropdownOptions = [
    {
      label: "Status Bar",
      checked: showStatusBar,
      onCheckedChange: setShowStatusBar
    },
    {
      label: "Activity Bar",
      checked: showActivityBar,
      onCheckedChange: setShowActivityBar
    },
    {
      label: "Panel",
      checked: showPanel,
      onCheckedChange: setShowPanel
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dropdownOptions.map((option) => (
          <DropdownMenuCheckboxItem
            checked={option.checked}
            onCheckedChange={option.onCheckedChange}
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
