export interface Messenger {
  send(type: string, payload?: any): void
  on(type: string, handler: (e: any) => void): void
}

export class WindowMessenger implements Messenger {
  send(type: string, payload: any) {
    window.parent.postMessage({ type, payload }, "*")
  }

  on(type: string, handler: (e: any) => void) {
    window.addEventListener("message", e => {
      if (e.data.type === type) {
        handler(e.data.payload)
      }
    })
  }
}
