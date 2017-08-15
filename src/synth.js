import Synthesizer from "./submodules/sf2synth/src/sound_font_synth.js"
import MidiMessageHandler from "./submodules/sf2synth/src/midi_message_handler.js"
import "./synth.css"

const { ipcRenderer } = window.require("electron")

export default class SynthApp {
  init() {
    
    const handler = new MidiMessageHandler()
    ipcRenderer.on("midi", (e, message) => {
      handler.processMidiMessage(message)
    })
    
    const url = "/soundfonts/SGM-180 v1.5.sf2"
    loadSoundFont(url, input => {
      const synth = new Synthesizer(input)
      synth.init()
      synth.start()
      handler.synth = synth
      document.body.classList.add("synth")
      document.getElementById("root").appendChild(synth.drawSynth())
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