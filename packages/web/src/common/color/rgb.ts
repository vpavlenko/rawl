import Color from "color"

export interface RGB {
  r: number
  g: number
  b: number
}

export function colorStr({ r, g, b }: RGB, alpha = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`
}

export const toRGB = (color: Color): RGB => ({
  r: color.red(),
  g: color.green(),
  b: color.blue()
})
