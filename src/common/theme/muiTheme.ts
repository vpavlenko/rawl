import { unstable_createMuiStrictModeTheme as createTheme } from "@mui/material/styles"
import { defaultTheme } from "./Theme"

export const theme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        color: "inherit",

        /* disable focus */
        tabIndex: -1,
        onMouseDown: (e) => e.preventDefault(),
      },
    },
  },
  palette: {
    mode: "dark",
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
