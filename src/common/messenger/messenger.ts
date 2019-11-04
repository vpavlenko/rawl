export interface Messenger {
  send(type: string, payload?: any): void
  on(type: string, handler: (e: any) => void): void
}

export class WindowMessenger implements Messenger {
  private target: Window

  constructor(target: Window) {
    this.target = target
  }

  send(type: string, payload?: any) {
    this.target.postMessage({ type, payload }, "*")
  }

  on(type: string, handler: (e: any) => void) {
    window.addEventListener("message", e => {
      try {
        const json = e.data
        if (json.type === type) {
          handler(json.payload)
        }
      } catch (_) {}
    })
  }
}
