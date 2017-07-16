export default class SynthOutput {
  constructor() {
    const url = "./sf2.html"
    this.window = window.open(url, "sy1", "width=900,height=670,scrollbars=yes,resizable=yes")
  }

  send(msg, timestamp) {
    const aMsg = ["midi", ...msg.map(m => m.toString(16))].join(",")
    const delay = timestamp - window.performance.now()

    setTimeout(() => {
      if (this.window) {
        this.window.postMessage(aMsg, "*")
      }
    }, delay)
  }
}
