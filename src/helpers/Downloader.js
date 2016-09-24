export default class Downloader {
  static download(url, name){
    var a = document.createElement("a")
    a.href = url
    a.setAttribute("download", name || "noname")
    a.dispatchEvent(new CustomEvent("click"))
  }

  // http://stackoverflow.com/a/33622881/1567777
  static downloadBlob(data, fileName, mimeType) {
    var blob, url
    blob = new Blob([data], {
      type: mimeType
    })
    url = window.URL.createObjectURL(blob)
    Downloader.download(url, fileName, mimeType)
    setTimeout(() => {
      return window.URL.revokeObjectURL(url)
    }, 1000)
  }
}
