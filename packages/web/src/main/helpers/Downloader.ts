export default class Downloader {
  static download(url: string, name = "noname") {
    const a = document.createElement("a")
    a.href = url
    a.download = name
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // http://stackoverflow.com/a/33622881/1567777
  static downloadBlob(data: BlobPart, fileName: string, mimeType: string) {
    const blob = new Blob([data], {
      type: mimeType
    })
    const url = window.URL.createObjectURL(blob)
    Downloader.download(url, fileName)
    setTimeout(() => {
      return window.URL.revokeObjectURL(url)
    }, 1000)
  }
}
