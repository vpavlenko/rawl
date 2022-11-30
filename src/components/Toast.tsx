import { FC, useEffect } from "react"
import { ToastSeverity } from "../main/hooks/useToast"

export interface ToastProps {
  message: string
  severity: ToastSeverity
  onExited: () => void
}

export const Toast: FC<ToastProps> = ({ message, severity, onExited }) => {
  useEffect(() => {
    const timeout = setTimeout(onExited, 5000)
    return () => clearTimeout(timeout)
  })
  return (
    <div>
      {severity}
      {message}
    </div>
  )
}
