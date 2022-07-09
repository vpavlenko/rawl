import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useState } from "react"
import { localized } from "../../../common/localize/localizedString"
import { useStores } from "../../hooks/useStores"

export const PromptDialog = observer(() => {
  const rootStore = useStores()
  const {
    promptStore,
    promptStore: { props },
  } = rootStore
  const [input, setInput] = useState("")

  const onClose = useCallback(() => (promptStore.props = null), [])

  // reset on open
  useEffect(() => {
    if (props !== null) {
      setInput(props.initialText ?? "")
    }
  }, [props !== null])

  const _onClickOK = () => {
    props?.callback(input)
    onClose()
  }

  return (
    <Dialog open={props !== null} onClose={onClose} maxWidth="xs">
      <DialogTitle>{props?.title}</DialogTitle>
      <DialogContent>
        <TextField
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus={true}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              _onClickOK()
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={_onClickOK}>{localized("ok", "OK")}</Button>
        <Button
          onClick={() => {
            props?.callback(null)
            onClose()
          }}
        >
          {localized("cancel", "Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  )
})
