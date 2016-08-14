function getCSSVariable(name) {
  const s = window.getComputedStyle(document.body)
  return s.getPropertyValue(name)
}

function hslWithAlpha(hsl, alpha) {
  const [_, h, s, l] = hsl.match(/hsl\((.+), (.+)%, (.+)%\)/)
  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}

export default class Theme {
  static get font() {
    return getCSSVariable("--font") 
  }

  static get canvasFont() { 
    return getCSSVariable("--canvas-font") 
  }

  static get themeColor() {
    return getCSSVariable("--theme-color") 
  }

  static get backgroundColor() {
    return getCSSVariable("--background-color") 
  }

  static get secondaryBackgroundColor() {
    return getCSSVariable("--secondary-background-color") 
  }

  static getDividerColorAccented(accented) {
    return accented ? this.secondaryTextColor : this.dividerColor
  }

  static get dividerColor() {
    return getCSSVariable("--divider-color") 
  }

  static get textColor() {
    return getCSSVariable("--text-color") 
  }

  static get secondaryTextColor() {
    return getCSSVariable("--secondary-text-color") 
  }
}

export { hslWithAlpha }
