import { FC } from "react"
import { HelmetProvider } from "react-helmet-async"
import { EmotionThemeProvider } from "../../main/components/Theme/EmotionThemeProvider"
import { GlobalCSS } from "../../main/components/Theme/GlobalCSS"
import { MuiThemeProvider } from "../../main/components/Theme/MuiThemeProvider"
import { RootView } from "./RootView"

export const App: FC = () => {
  return (
    <MuiThemeProvider>
      <EmotionThemeProvider>
        <HelmetProvider>
          <GlobalCSS />
          <RootView />
        </HelmetProvider>
      </EmotionThemeProvider>
    </MuiThemeProvider>
  )
}
