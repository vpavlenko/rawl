// use Electron clipboard API in future
export default class Clipboard {
  constructor() {
    this.data = {}
  }
  writeText(text) {
    this.data.text = text
  }
  readText() {
    return this.data.text
  }
  clear(type) {
    delete this.data[type]
  }
  write(data, type) {
    this.data[type] = data
  }
}
