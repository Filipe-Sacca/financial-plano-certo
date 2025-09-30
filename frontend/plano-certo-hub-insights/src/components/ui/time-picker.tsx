import * as React from "react"
import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  label?: string
  className?: string
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ value = "", onChange, disabled = false, label, className }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {label && <Label>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            type="time"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="pr-10"
          />
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    )
  }
)

TimePicker.displayName = "TimePicker"