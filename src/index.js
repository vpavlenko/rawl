import App from "./App"
import SynthApp from "./synth"

switch(document.location.hash) {
  case "": {
    const app = new App()
    app.init()
    break
  }
  case "#synth": {
    const app = new SynthApp()
    app.init()
    break
  }
}
