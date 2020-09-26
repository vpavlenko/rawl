import { createMuiTheme } from "@material-ui/core/styles"
import { defaultTheme } from "./Theme"

export const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette: {
    type: "dark",
    primary: {
      main: defaultTheme.themeColor,
    },
    background: {
      default: defaultTheme.secondaryBackgroundColor,
      paper: defaultTheme.backgroundColor,
    },
  },
  typography: {
    fontFamily: defaultTheme.font,
    fontSize: 13,
  },
})
