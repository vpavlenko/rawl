export interface TrackColor {
  red: number // 0 to 0xFF
  green: number // 0 to 0xFF
  blue: number // 0 to 0xFF
  alpha: number // 0 to 0xFF (0 is transparent)
}

export const trackColorToCSSColor = (color: TrackColor): string =>
  `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha / 0xff})`
