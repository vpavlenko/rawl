import WebMidiLink from "./submodules/sf2synth/src/wml.js"
import "./synth.css"

const { ipcRenderer } = window.require("electron")

export default class SynthApp {
  init() {
    const emitter = new class {
      emit = (type, data) => {
        ipcRenderer.send(type, data)
      }

      on = (type, listener) => {
        ipcRenderer.on("midi", (e, message) => {
          listener(message)
        })
      }
    }

    const wml = new WebMidiLink()
    wml.setLoadCallback(() => {
      wml.synth.setMasterVolume(16384 * 0.5)
    })
    wml.setup("/soundfonts/msgs.sf2", document.getElementById("root"), emitter)
    document.body.classList.add("synth")
  }
}
