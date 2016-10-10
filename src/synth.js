import WebMidiLink from "./submodules/sf2synth/bin/sf2.synth.js"

var wml = new WebMidiLink()
wml.setLoadCallback(function(arraybuffer) {
  // ロード完了時の処理
})
wml.setup("./soundfonts/msgs.sf2")
