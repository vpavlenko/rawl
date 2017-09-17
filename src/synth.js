import Synthesizer from "./submodules/sf2synth/src/sound_font_synth"
import View from "./submodules/sf2synth/src/synth_view"
import MidiMessageHandler from "./submodules/sf2synth/src/midi_message_handler"
import "./synth.css"

const { ipcRenderer } = window.require("electron")

export default class SynthApp {
  eventsBuffer = []

  init() {
    const handler = new MidiMessageHandler()
    ipcRenderer.on("midi", (error, event) => {
      this.eventsBuffer.push(event)
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

    const onTimer = () => {
      // 再生時刻が現在より過去なら再生して削除
      this.eventsBuffer = this.eventsBuffer.filter(({ message, timestamp }) => {
        const delay = timestamp - window.performance.now()
        const willPlay = delay <= 0
        if (willPlay) {
          handler.processMidiMessage(message)
        }
        return !willPlay
      })

      requestAnimationFrame(onTimer)
    }

    onTimer()
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