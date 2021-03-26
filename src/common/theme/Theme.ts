export interface Theme {
  font: string
  canvasFont: string
  themeColor: string
  backgroundColor: string
  secondaryBackgroundColor: string
  tertiaryBackgroundColor: string
  dividerColor: string
  textColor: string
  secondaryTextColor: string
  tertiaryTextColor: string
  pianoKeyBlack: string
  pianoKeyWhite: string
  pianoBlackKeyLaneColor: string
  ghostNoteColor: string
  recordColor: string
}

export const defaultTheme: Theme = {
  font: "-apple-system, BlinkMacSystemFont, Avenir, Lato",
  canvasFont: "Arial",
  themeColor: "hsl(230, 70%, 55%)",
  textColor: "#fbfcff",
  secondaryTextColor: "#8e96ab",
  tertiaryTextColor: "#5a6173",
  dividerColor: "#454a58",
  backgroundColor: "#272a36",
  secondaryBackgroundColor: "#454b60",
  tertiaryBackgroundColor: "#535b72",
  pianoKeyBlack: "#272a36",
  pianoKeyWhite: "#fbfcff",
  pianoBlackKeyLaneColor: "#1f2029",
  ghostNoteColor: "#444444",
  recordColor: "#dd3c3c",
}

declare module "styled-components" {
  interface DefaultTheme extends Theme {}
}
