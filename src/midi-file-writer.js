"use strict"

class MidiFileWriter {
  static writeToBytes(tracks) {

  }
}

class Downloader {
  static download(url, name){
    var a = document.createElement("a")
    a.href = url
    a.setAttribute("download", name || "noname")
    a.dispatchEvent(new CustomEvent("click"))
  }
}
