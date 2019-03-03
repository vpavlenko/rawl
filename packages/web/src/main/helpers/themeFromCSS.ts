import Theme from "common/theme"

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

export default function themeFromCSS(): Theme {
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
    pianoKeyBlack: getCSSVariable("--piano-key-black"),
    pianoKeyWhite: getCSSVariable("--piano-key-white"),
    keyWidth: parseInt_(getCSSVariable("--key-width")),
    keyHeight: parseInt_(getCSSVariable("--key-height")),
    rulerHeight: parseInt_(getCSSVariable("--ruler-height"))
  }
}
