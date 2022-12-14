// Copy from https://github.com/firebase/firebaseui-web-react/pull/173#issuecomment-1151532176

import styled from "@emotion/styled"
import { onAuthStateChanged } from "firebase/auth"
import * as firebaseui from "firebaseui"
import { useEffect, useRef, useState } from "react"

interface Props {
  // The Firebase UI Web UI Config object.
  // See: https://github.com/firebase/firebaseui-web#configuration
  uiConfig: firebaseui.auth.Config
  // Callback that will be passed the FirebaseUi instance before it is
  // started. This allows access to certain configuration options such as
  // disableAutoSignIn().
  uiCallback?(ui: firebaseui.auth.AuthUI): void
  // The Firebase App auth instance to use.
  firebaseAuth: any // As firebaseui-web
}

const Container = styled.div`
  ul.firebaseui-idp-list {
    list-style-type: none;
    padding: 0;
  }

  button.firebaseui-idp-button {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid ${({ theme }) => theme.dividerColor};
    background: inherit !important;
    color: inherit;
    min-height: 3rem;
    min-width: 12rem;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background: ${({ theme }) => theme.highlightColor} !important;
    }
  }

  img.firebaseui-idp-icon {
    width: 1.5rem;
  }

  span.firebaseui-idp-icon-wrapper {
    display: flex;
    margin-right: 1rem;
  }

  span.firebaseui-idp-text.firebaseui-idp-text-short {
    display: none;
  }

  li.firebaseui-list-item {
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }
`

export const StyledFirebaseAuth = ({
  uiConfig,
  firebaseAuth,
  uiCallback,
}: Props) => {
  const [userSignedIn, setUserSignedIn] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    // Get or Create a firebaseUI instance.
    const firebaseUiWidget =
      firebaseui.auth.AuthUI.getInstance() ||
      new firebaseui.auth.AuthUI(firebaseAuth)

    if (uiConfig.signInFlow === "popup") {
      firebaseUiWidget.reset()
    }

    // We track the auth state to reset firebaseUi if the user signs out.
    const unregisterAuthObserver = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user && userSignedIn) {
        firebaseUiWidget.reset()
      }
      setUserSignedIn(!!user)
    })

    // Trigger the callback if any was set.
    if (uiCallback) {
      uiCallback(firebaseUiWidget)
    }

    // Render the firebaseUi Widget.
    // @ts-ignore
    firebaseUiWidget.start(elementRef.current, uiConfig)

    return () => {
      unregisterAuthObserver()
      firebaseUiWidget.reset()
    }
  }, [firebaseui, uiConfig])

  return <Container ref={elementRef} />
}
