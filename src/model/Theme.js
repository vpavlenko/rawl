// 文頭、文末のスペースを取り除く
function trimSpace(str) {
  const matched = str.match(/^\s*(.+?)\s*$/)
  return (matched && matched.length) > 0 ? matched[1] : str
}

function getCSSVariable(name) {
  const s = window.getComputedStyle(document.body)
  return trimSpace(s.getPropertyValue(name))
}

export function hslWithAlpha(hsl, alpha) {
  const [, h, s, l] = hsl.match(/hsl\((.+), (.+)%, (.+)%\)/)
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}

function parseInt_(v) {
  return parseInt(v, 10)
}

export default class Theme {
  font = "Arial"
  canvasFont = "Arial"
  themeColor = "black"
  noteColor = "black"
  backgroundColor = "white"
  secondaryBackgroundColor = "gray"
  dividerColor = "gray"
  textColor = "black"
  secondaryTextColor = "black"
  keyWidth = 120
  keyHeight = 20
  rulerHeight = 30

  static fromCSS() {
    const t = new Theme()
    t.font = getCSSVariable("--font")
    t.canvasFont = getCSSVariable("--canvas-font")
    t.themeColor = getCSSVariable("--theme-color")
    t.noteColor = getCSSVariable("--note-color")
    t.backgroundColor = getCSSVariable("--background-color")
    t.secondaryBackgroundColor = getCSSVariable("--secondary-background-color")
    t.dividerColor = getCSSVariable("--divider-color")
    t.textColor = getCSSVariable("--text-color")
    t.secondaryTextColor = getCSSVariable("--secondary-text-color")
    t.keyWidth = parseInt_(getCSSVariable("--key-width"))
    t.keyHeight = parseInt_(getCSSVariable("--key-height"))
    t.rulerHeight = parseInt_(getCSSVariable("--ruler-height"))
    return t
  }
}
