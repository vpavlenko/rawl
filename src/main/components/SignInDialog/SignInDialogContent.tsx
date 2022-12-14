import { FC } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "../../../components/Dialog"
import { StyledFirebaseAuth } from "../FirebaseAuth/StyledFirebaseAuth"

import styled from "@emotion/styled"
import "firebase/auth"
import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth"
import { Alert } from "../../../components/Alert"
import { Button } from "../../../components/Button"
import { Localized } from "../../../components/Localized"
import { auth } from "../../../firebase/firebase"

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

export interface SignInDialogContentProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  onFailure: (error: firebaseui.auth.AuthUIError) => void
}

export const SignInDialogContent: FC<SignInDialogContentProps> = ({
  open,
  onClose,
  onSuccess,
  onFailure,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose} style={{ minWidth: "20rem" }}>
      <DialogTitle>
        <Localized default="Sign in">sign-in</Localized>
        <BetaLabel>Beta</BetaLabel>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info">
          <Localized default="Since the cloud function is in beta during development, please download and save your important songs frequently.">
            cloud-beta-warning
          </Localized>
        </Alert>
        <Description>
          <Localized default="By signing in, you can save your music to the cloud and resume composing from anywhere at any time.">
            cloud-description
          </Localized>
        </Description>
        <StyledFirebaseAuth
          uiConfig={{
            signInOptions: [
              GoogleAuthProvider.PROVIDER_ID,
              GithubAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
              signInSuccessWithAuthResult() {
                onSuccess()
                return false
              },
              signInFailure: onFailure,
            },
            signInFlow: "popup",
          }}
          firebaseAuth={auth}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          <Localized default="Close">close</Localized>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
