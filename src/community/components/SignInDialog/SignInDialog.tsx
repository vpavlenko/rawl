import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { useLocalization } from "../../../common/localize/useLocalization"
import { useToast } from "../../../main/hooks/useToast"
import { useStores } from "../../hooks/useStores"
import { SignInDialogContent } from "./SignInDialogContent"

export const SignInDialog: FC = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    rootViewStore: { openSignInDialog },
  } = rootStore
  const toast = useToast()
  const localized = useLocalization()

  const onClose = useCallback(
    () => (rootViewStore.openSignInDialog = false),
    [rootViewStore],
  )

  const signInSuccessWithAuthResult = async () => {
    rootViewStore.openSignInDialog = false
    toast.success(localized("success-sign-in", "Successfully signed in"))
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
