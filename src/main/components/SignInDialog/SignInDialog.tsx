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
      maxWidth="xs"
      keepMounted={false}
    >
      <DialogTitle>{localized("sign-in", "Sign in")}</DialogTitle>
      <DialogContent></DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{localized("close", "Close")}</Button>
      </DialogActions>
    </Dialog>
  )
})
