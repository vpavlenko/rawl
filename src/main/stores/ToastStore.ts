import { AlertColor } from "@mui/material"
import { makeObservable, observable } from "mobx"

export interface ToastMessage {
  message: string
  severity: AlertColor
  key: number
}

export class ToastStore {
  messages: ToastMessage[] = []

  constructor() {
    makeObservable(this, {
      messages: observable,
    })
  }

  showInfo(message: string) {
    this.show(message, { severity: "info" })
  }

  showSuccess(message: string) {
    this.show(message, { severity: "success" })
  }

  showWarning(message: string) {
    this.show(message, { severity: "warning" })
  }

  showError(message: string) {
    this.show(message, { severity: "error" })
  }

  show(message: string, options: { severity: AlertColor }) {
    this.messages = [
      ...this.messages,
      { message, ...options, key: new Date().getTime() },
    ]
  }
}
