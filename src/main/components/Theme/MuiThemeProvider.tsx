import { createTheme, ThemeProvider } from "@mui/material"
import { FC, PropsWithChildren } from "react"
import { useTheme } from "../../hooks/useTheme"

export const MuiThemeProvider: FC<
  React.PropsWithChildren<PropsWithChildren<unknown>>
> = ({ children }) => {
  const theme = useTheme()
  return (
    <ThemeProvider
      theme={createTheme({
        components: {
          MuiButtonBase: {
            defaultProps: {
              disableRipple: true,

              /* disable focus */
              tabIndex: -1,
              onMouseDown: (e) => e.preventDefault(),
            },
            styleOverrides: {
              root: {
                color: theme.textColor,
                fontSize: "inherit",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                color: theme.textColor,
                fontSize: "inherit",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                background: theme.backgroundColor,
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                fontSize: "inherit",
              },
            },
          },
          MuiSlider: {
            defaultProps: {
              /* disable focus */
              onFocus: (e) => e.target.blur(),
            },
          },
        },
        palette: {
          mode: "dark",
          primary: {
            main: theme.themeColor,
          },
          background: {
            default: theme.secondaryBackgroundColor,
            paper: theme.backgroundColor,
          },
        },
        typography: {
          fontFamily: theme.font,
          fontSize: 13,
        },
      })}
    >
      {children}
    </ThemeProvider>
  )
}
