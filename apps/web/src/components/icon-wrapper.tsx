"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"

interface IconWrapperProps {
  icon: LucideIcon
  className?: string
}

export function IconWrapper({ icon: Icon, className }: IconWrapperProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={className} />
  }

  return <Icon className={className} />
}