// 文頭、文末のスペースを取り除く
function trimSpace(str: string) {
  const matched = str.match(/^\s*(.+?)\s*$/)
  return (matched && matched.length) > 0 ? matched[1] : str
}

function getCSSVariable(name: string) {
  const s = window.getComputedStyle(document.body)
  return trimSpace(s.getPropertyValue(name))
}

export function hslWithAlpha(hsl: string, alpha: number) {
  const [, h, s, l] = hsl.match(/hsl\((.+), (.+)%, (.+)%\)/)
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}

function parseInt_(v: string) {
  return parseInt(v, 10)
}

export default interface Theme {
  font: string
  canvasFont: string
  themeColor: string
  noteColor: string
  backgroundColor: string
  secondaryBackgroundColor: string
  dividerColor: string
  textColor: string
  secondaryTextColor: string
  keyWidth: number
  keyHeight: number
  rulerHeight: number
}

export const defaultTheme: Theme = {
  font: "Arial",
  canvasFont: "Arial",
  themeColor: "black",
  noteColor: "black",
  backgroundColor: "white",
  secondaryBackgroundColor: "gray",
  dividerColor: "gray",
  textColor: "black",
  secondaryTextColor: "black",
  keyWidth: 120,
  keyHeight: 20,
  rulerHeight: 30,
}

export function themeFromCSS() {
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
    keyWidth: parseInt_(getCSSVariable("--key-width")),
    keyHeight: parseInt_(getCSSVariable("--key-height")),
    rulerHeight: parseInt_(getCSSVariable("--ruler-height"))
  }
}
