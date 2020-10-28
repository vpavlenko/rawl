import { createContext, useContext } from "react"
import { defaultTheme, Theme } from "../../common/theme/Theme"

export const ThemeContext = createContext<Theme>(defaultTheme)
export const useTheme = () => useContext(ThemeContext)
