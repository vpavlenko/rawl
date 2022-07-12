import {
  Alert,
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

import styled from "@emotion/styled"
import "firebase/auth"
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth"
import { auth } from "../../firebase/firebase"

const BetaLabel = styled.span`
  border: 1px solid currentColor;
  font-size: 0.8rem;
  padding: 0.1rem 0.4rem;
  margin-left: 1em;
  color: ${({ theme }) => theme.secondaryTextColor};
`

const Description = styled.div`
  margin: 1rem 0 2rem 0;
  line-height: 1.5;
`

export const SignInDialog = observer(() => {
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

  const signInSuccessWithAuthResult = (
    authResult: any,
    redirectUrl?: string | undefined
  ) => {
    rootViewStore.openSignInDialog = false
    toastStore.showSuccess(
      localized("success-sign-in", "Successfully signed in")
    )
    return false
  }

  const signInFailure = (error: firebaseui.auth.AuthUIError) => {
    console.warn(error)
  }

  return (
    <Dialog
      open={openSignInDialog}
      onClose={onClose}
      keepMounted={false}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        {localized("sign-in", "Sign in")}
        <BetaLabel>Beta</BetaLabel>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info">
          {localized(
            "cloud-beta-warning",
            "Since the cloud function is in beta during development, please download and save your important songs frequently."
          )}
        </Alert>
        <Description>
          {localized(
            "cloud-description",
            "By signing in, you can save your music to the cloud and resume composing from anywhere at any time."
          )}
        </Description>
        <StyledFirebaseAuth
          uiConfig={{
            signInOptions: [
              GoogleAuthProvider.PROVIDER_ID,
              GithubAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
              signInSuccessWithAuthResult,
              signInFailure,
            },
            signInFlow: "popup",
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
