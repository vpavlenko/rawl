import { createMuiTheme } from "@material-ui/core/styles"

export const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "hsl(230, 70%, 55%)"
    },
    background: {
      default: "#454b60",
      paper: "#272a36"
    }
  }
})
