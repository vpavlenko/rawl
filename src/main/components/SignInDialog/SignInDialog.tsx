import { observer } from "mobx-react-lite"
import { FC, useCallback } from "react"
import { useLocalization } from "../../../common/localize/useLocalization"
import { auth } from "../../../firebase/firebase"
import { useStores } from "../../hooks/useStores"
import { useToast } from "../../hooks/useToast"
import { SignInDialogContent } from "./SignInDialogContent"

export const SignInDialog: FC = observer(() => {
  const rootStore = useStores()
  const {
    userRepository,
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

    // Create user profile if not exists
    const user = await userRepository.getCurrentUser()
    const authUser = auth.currentUser
    if (authUser !== null && user === null) {
      const newUserData = {
        name: authUser.displayName ?? "",
        bio: "",
      }
      await userRepository.create(newUserData)
    }

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
