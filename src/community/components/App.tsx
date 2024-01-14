import { FC } from "react"
import { HelmetProvider } from "react-helmet-async"
import { ActionDialog } from "../../components/ActionDialog"
import { PromptDialog } from "../../components/PromptDialog"
import { Toast } from "../../components/Toast"
import { EmotionThemeProvider } from "../../main/components/Theme/EmotionThemeProvider"
import { DialogProvider } from "../../main/hooks/useDialog"
import { PromptProvider } from "../../main/hooks/usePrompt"
import { ToastProvider } from "../../main/hooks/useToast"
import { StoreContext } from "../hooks/useStores"
import RootStore from "../stores/RootStore"
import { GlobalCSS } from "./GlobalCSS"
import { RootView } from "./RootView"

export const App: FC = () => {
  return (
    <StoreContext.Provider value={new RootStore()}>
      <EmotionThemeProvider>
        <HelmetProvider>
          <ToastProvider component={Toast}>
            <PromptProvider component={PromptDialog}>
              <DialogProvider component={ActionDialog}>
                <GlobalCSS />
                <RootView />
              </DialogProvider>
            </PromptProvider>
          </ToastProvider>
        </HelmetProvider>
      </EmotionThemeProvider>
    </StoreContext.Provider>
  )
}
