// 文頭、文末のスペースを取り除く
function trimSpace(str) {
  return str.match(/^\s*(.+?)\s*$/)[1]
}

function getCSSVariable(name) {
  const s = window.getComputedStyle(document.body)
  return trimSpace(s.getPropertyValue(name))
}

export function hslWithAlpha(hsl, alpha) {
  const [, h, s, l] = hsl.match(/hsl\((.+), (.+)%, (.+)%\)/)
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}

let instance

export default class Theme {
  static load() {
    if (instance) {
      return instance
    }
    return instance = this.fromCSS()
  }
  static fromCSS() {
    return {
      font: getCSSVariable("--font"),
      canvasFont: getCSSVariable("--canvas-font"),
      themeColor: getCSSVariable("--theme-color"),
      noteColor: getCSSVariable("--note-color"),
      backgroundColor: getCSSVariable("--background-color"),
      secondaryBackgroundColor: getCSSVariable("--secondary-background-color"),
      dividerColor: getCSSVariable("--divider-color"),
      textColor: getCSSVariable("--text-color"),
      secondaryTextColor: getCSSVariable("--secondary-text-color"),
      keyWidth: parseInt(getCSSVariable("--key-width")),
      keyHeight: parseInt(getCSSVariable("--key-height")),
      rulerHeight: parseInt(getCSSVariable("--ruler-height")),
      controlHeight: parseInt(getCSSVariable("--control-height"))
    }
  }
}
