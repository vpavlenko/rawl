import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useCallback } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"
import { StyledFirebaseAuth } from "../FirebaseAuth/StyledFirebaseAuth"

import "firebase/auth"
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth"
import { auth } from "../../firebase/firebase"

export const SignInDialog = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    rootViewStore: { openSignInDialog },
  } = rootStore

  const onClose = useCallback(
    () => (rootViewStore.openSignInDialog = false),
    [rootViewStore]
  )

  return (
    <Dialog
      open={openSignInDialog}
      onClose={onClose}
      keepMounted={false}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{localized("sign-in", "Sign in")}</DialogTitle>
      <DialogContent>
        <StyledFirebaseAuth
          uiConfig={{
            signInOptions: [
              GoogleAuthProvider.PROVIDER_ID,
              TwitterAuthProvider.PROVIDER_ID,
              GithubAuthProvider.PROVIDER_ID,
            ],
          }}
          firebaseAuth={auth}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
})
