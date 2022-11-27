import { FC } from "react"
import { HelmetProvider } from "react-helmet-async"
import { EmotionThemeProvider } from "../../main/components/Theme/EmotionThemeProvider"
import { GlobalCSS } from "../../main/components/Theme/GlobalCSS"
import { StoreContext } from "../hooks/useStores"
import RootStore from "../stores/RootStore"
import { RootView } from "./RootView"

export const App: FC = () => {
  return (
    <StoreContext.Provider value={new RootStore()}>
      <EmotionThemeProvider>
        <HelmetProvider>
          <GlobalCSS />
          <RootView />
        </HelmetProvider>
      </EmotionThemeProvider>
    </StoreContext.Provider>
  )
}
