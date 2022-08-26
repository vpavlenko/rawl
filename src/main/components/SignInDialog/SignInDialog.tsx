import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import { SignInDialogContent } from "./SignInDialogContent"

export const SignInDialog: FC = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    rootViewStore: { openSignInDialog },
    toastStore,
  } = rootStore

  const onClose = useCallback(
    () => (rootViewStore.openSignInDialog = false),
    [rootViewStore]
  )

  const signInSuccessWithAuthResult = () => {
    rootViewStore.openSignInDialog = false
    toastStore.showSuccess(
      localized("success-sign-in", "Successfully signed in")
    )
  }

  const signInFailure = (error: firebaseui.auth.AuthUIError) => {
    console.warn(error)
  }

  return (
    <SignInDialogContent
      open={openSignInDialog}
      onClose={onClose}
      onSuccess={signInSuccessWithAuthResult}
      onFailure={signInFailure}
    />
  )
})
