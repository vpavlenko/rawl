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
  pianoKeyBlack: string
  pianoKeyWhite: string
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
  pianoKeyBlack: "black",
  pianoKeyWhite: "white",
  keyWidth: 120,
  keyHeight: 20,
  rulerHeight: 30
}
