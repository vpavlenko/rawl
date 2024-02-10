import { vec4 } from "gl-matrix"

export interface TrackColor {
  red: number // 0 to 0xFF
  green: number // 0 to 0xFF
  blue: number // 0 to 0xFF
  alpha: number // 0 to 0xFF (0 is transparent)
}

export const trackColorToCSSColor = (color: TrackColor): string =>
  `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 0xff})`

export const trackColorToVec4 = (color: TrackColor): vec4 => [
  color.red / 0xff,
  color.green / 0xff,
  color.blue / 0xff,
  color.alpha / 0xff,
]
