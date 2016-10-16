import WebMidiLink from "./submodules/sf2synth/bin/sf2.synth.js"

var wml = new WebMidiLink()
wml.setLoadCallback(function() {
  wml.synth.setMasterVolume(16384 * 0.5)
})
wml.setup("./soundfonts/msgs.sf2")
