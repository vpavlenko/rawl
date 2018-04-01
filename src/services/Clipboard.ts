// use Electron clipboard API in future
class Clipboard {
  data: any = {}

  writeText(text: string) {
    this.data.text = text
  }
  readText() {
    return this.data.text
  }
  clear(type: string) {
    delete this.data[type]
  }
  write(data: any, type: string) {
    this.data[type] = data
  }
}

// singleton
export default new Clipboard()
