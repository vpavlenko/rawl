import Synthesizer from "./submodules/sf2synth/src/sound_font_synth"
import View from "./submodules/sf2synth/src/synth_view"
import MidiMessageHandler from "./submodules/sf2synth/src/midi_message_handler"
import "./synth.css"

const { ipcRenderer } = window.require("electron")

export default class SynthApp {
  init() {
    
    const handler = new MidiMessageHandler()
    ipcRenderer.on("midi", (e, { message, timestamp }) => {
      const delay = timestamp - window.performance.now()
      setTimeout(() => {
        handler.processMidiMessage(message)
      }, delay)
    })
    
    const url = "/soundfonts/msgs.sf2"
    loadSoundFont(url, input => {
      const synth = new Synthesizer(input)
      synth.init()
      synth.start()
      handler.synth = synth
      
      const view = new View()
      synth.view = view
      document.body.classList.add("synth")
      document.getElementById("root").appendChild(view.draw(synth))
    })
  }
}

function loadSoundFont(url, callback) {
  const xhr = new XMLHttpRequest()
  
  xhr.open("GET", url, true)
  xhr.responseType = "arraybuffer"

  xhr.addEventListener("load", ev => {
    /** @type {XMLHttpRequest} */
    const xhr = ev.target
    callback(new Uint8Array(xhr.response))
  }, false)

  xhr.send()
}