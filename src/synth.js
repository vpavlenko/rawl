import Synthesizer from "./submodules/sf2synth/src/sound_font_synth"
import View from "./submodules/sf2synth/src/synth_view"
import MidiMessageHandler from "./submodules/sf2synth/src/midi_message_handler"
import Recorder from "./submodules/opus-recorder/src/recorder"

import "./synth.css"

const { ipcRenderer } = window.require("electron")

export default class SynthApp {
  eventsBuffer = []

  // 送信元とのタイムスタンプの差
  timestampOffset = 0

  init() {
    const handler = new MidiMessageHandler()
    ipcRenderer.on("midi", (error, { events, timestamp }) => {
      this.eventsBuffer = [...this.eventsBuffer, ...events]
      this.timestampOffset = window.performance.now() - timestamp
    })

    const url = "/soundfonts/msgs.sf2"
    loadSoundFont(url, input => {
      const ctx = new window.AudioContext()
      const output = ctx.createGain()
      output.connect(ctx.destination)

      const synth = new Synthesizer(input, ctx)
      synth.init()
      synth.connect(output)
      handler.synth = synth

      const view = new View()
      synth.view = view
      document.body.classList.add("synth")
      document.getElementById("root").appendChild(view.draw(synth))

      document.getElementById("root").insertAdjacentHTML("beforeend", `
      <h2>Commands</h2>
      <button id="init">init</button>
      <button id="start" disabled>start</button>
      <button id="pause" disabled>pause</button>
      <button id="resume" disabled>resume</button>
      <button id="stopButton" disabled>stop</button>
    
      <h2>Recordings</h2>
      <ul id="recordingslist"></ul>`)
      prepareRecorder(ctx, output)
    })

    const onTimer = () => {

      // 再生時刻が現在より過去なら再生して削除
      const eventsToSend = this.eventsBuffer.filter(({ message, timestamp }) => {
        const delay = timestamp - window.performance.now() + this.timestampOffset
        return delay <= 0
      })

      const allSoundOffChannels = eventsToSend
        .filter(({ message }) => isMessageAllSoundOff(message))
        .map(({ message }) => getMessageChannel(message))

      // 再生するイベントと、all sound off を受信したチャンネルのイベントを削除する
      this.eventsBuffer = this.eventsBuffer.filter(e => {
        return !eventsToSend.includes(e) && !allSoundOffChannels.includes(getMessageChannel(e.message))
      })

      eventsToSend.forEach(({ message }) => handler.processMidiMessage(message))

      requestAnimationFrame(onTimer)
    }

    onTimer()
  }
}

function prepareRecorder(ctx, output) {
  const recorder = new Recorder(ctx, {
    numberOfChannels: 2,
    encoderPath: "/libs/opus-recorder/waveWorker.min.js"
  })
  const init = document.querySelector("#init")
  const start = document.querySelector("#start")
  const pause = document.querySelector("#pause")
  const resume = document.querySelector("#resume")
  const stopButton = document.querySelector("#stopButton")
  const recordingslist = document.querySelector("#recordingslist")

  init.addEventListener("click", () => initRecorder())
  start.addEventListener("click", () => { recorder.start() })
  pause.addEventListener("click", () => { recorder.pause() })
  resume.addEventListener("click", () => { recorder.resume() })
  stopButton.addEventListener("click", () => { recorder.stop() })

  recorder.addEventListener("start", e => {
    console.log('Recorder is started')
    start.disabled = resume.disabled = true
    pause.disabled = stopButton.disabled = false
  })
  recorder.addEventListener("stop", e => {
    console.log('Recorder is stopped')
    pause.disabled = resume.disabled = stopButton.disabled = start.disabled = true
  })
  recorder.addEventListener("pause", e => {
    console.log('Recorder is paused')
    pause.disabled = start.disabled = true
    resume.disabled = stopButton.disabled = false
  })
  recorder.addEventListener("resume", e => {
    console.log('Recorder is resuming')
    start.disabled = resume.disabled = true
    pause.disabled = stopButton.disabled = false
  })
  recorder.addEventListener("streamError", e => {
    console.log('Error encountered: ' + e.error.name)
  })
  recorder.addEventListener("streamReady", e => {
    pause.disabled = resume.disabled = stopButton.disabled = true
    start.disabled = false
    console.log('Audio stream is ready.')
  })
  recorder.addEventListener("dataAvailable", e => {
    var dataBlob = new Blob([e.detail], { type: 'audio/wav' })
    var fileName = new Date().toISOString() + ".wav"
    var url = URL.createObjectURL(dataBlob)
    var audio = document.createElement('audio')
    audio.controls = true
    audio.src = url
    var link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.innerHTML = link.download
    var li = document.createElement('li')
    li.appendChild(link)
    li.appendChild(audio)
    recordingslist.appendChild(li)
  })

  function initRecorder() {
    recorder.initStream(output)
  }

  return recorder
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

/// メッセージがチャンネルイベントならチャンネルを、そうでなければ -1 を返す
function getMessageChannel(message) {
  const isChannelEvent = (message[0] & 0xf0) !== 0xf0
  return isChannelEvent ? message[0] & 0x0f : -1
}

function isMessageAllSoundOff(message) {
  const isControlChange = (message[0] & 0xf0) === 0xB0
  if (isControlChange) {
    const isAllSoundOff = message[1] === 0x78
    return isAllSoundOff
  }
  return false
}